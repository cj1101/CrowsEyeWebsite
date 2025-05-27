const fs = require('fs');
const path = require('path');

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Deleted ${dirPath}`);
  }
}

function deleteFilesWithExtension(dir, extensions) {
  if (!fs.existsSync(dir)) return;
  
  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        const ext = path.extname(file);
        if (extensions.includes(ext)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted ${filePath}`);
        }
      }
    }
  }
  
  walkDir(dir);
}

function moveInstallerFiles() {
  const installersDir = 'installers';
  
  // Create installers directory if it doesn't exist
  if (!fs.existsSync(installersDir)) {
    fs.mkdirSync(installersDir);
    console.log('📁 Created installers directory');
  }
  
  // Move installer files from public
  const filesToMove = ['install.bat', 'install.py'];
  
  for (const file of filesToMove) {
    const sourcePath = path.join('public', file);
    const destPath = path.join(installersDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.renameSync(sourcePath, destPath);
      console.log(`📦 Moved ${file} to installers/`);
    }
  }
}

function removeVercelAssets() {
  // Remove vercel.svg from public directory
  const vercelSvg = path.join('public', 'vercel.svg');
  if (fs.existsSync(vercelSvg)) {
    fs.unlinkSync(vercelSvg);
    console.log('🗑️ Removed vercel.svg');
  }
  
  // Remove .vercel directory if it exists
  const vercelDir = '.vercel';
  if (fs.existsSync(vercelDir)) {
    deleteDirectory(vercelDir);
  }
}

console.log('🧹 Starting clean build process...');

// Remove Vercel assets
removeVercelAssets();

// Move installer files first
moveInstallerFiles();

// Clean previous builds
console.log('🗑️ Cleaning previous builds...');
deleteDirectory('out');
deleteDirectory('.next');

console.log('✅ Clean process completed!'); 