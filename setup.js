#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Crow\'s Eye Website Setup');
console.log('============================\n');

async function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ Error during ${description}:`, error.message);
    process.exit(1);
  }
}

async function askQuestion(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupFirebase() {
  console.log('🔥 Firebase Configuration Setup');
  console.log('================================\n');
  
  const hasEnvFile = fs.existsSync('.env.local');
  
  if (hasEnvFile) {
    const overwrite = await askQuestion('Found existing .env.local file. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Skipping Firebase setup...\n');
      return;
    }
  }
  
  console.log('Please provide your Firebase configuration values.');
  console.log('Get these from: Firebase Console > Project Settings > General > Your apps > Web app\n');
  
  const config = {};
  const questions = [
    { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', prompt: 'Firebase API Key: ' },
    { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', prompt: 'Auth Domain (project-id.firebaseapp.com): ' },
    { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', prompt: 'Project ID: ' },
    { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', prompt: 'Storage Bucket (project-id.appspot.com): ' },
    { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', prompt: 'Messaging Sender ID: ' },
    { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', prompt: 'App ID: ' }
  ];
  
  for (const question of questions) {
    config[question.key] = await askQuestion(question.prompt);
  }
  
  const envContent = `# Firebase Configuration for Crow's Eye Website
# Generated on ${new Date().toISOString()}

${Object.entries(config).map(([key, value]) => `${key}=${value}`).join('\n')}

# Optional: For development
NEXT_PUBLIC_ENVIRONMENT=development
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Firebase configuration saved to .env.local\n');
}

async function setupGitHubSecrets() {
  console.log('🔐 GitHub Secrets Setup Instructions');
  console.log('====================================\n');
  
  console.log('To enable automatic deployment, add these secrets to your GitHub repository:');
  console.log('Go to: GitHub Repository > Settings > Secrets and variables > Actions\n');
  
  console.log('Required secrets for Firebase:');
  console.log('- NEXT_PUBLIC_FIREBASE_API_KEY');
  console.log('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  console.log('- NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  console.log('- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  console.log('- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  console.log('- NEXT_PUBLIC_FIREBASE_APP_ID\n');
  
  console.log('Optional secrets for Vercel deployment:');
  console.log('- VERCEL_TOKEN (from Vercel dashboard)');
  console.log('- VERCEL_ORG_ID (from Vercel project settings)');
  console.log('- VERCEL_PROJECT_ID (from Vercel project settings)\n');
  
  await askQuestion('Press Enter to continue...');
}

async function main() {
  try {
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      console.error('❌ package.json not found. Please run this script from the project root.');
      process.exit(1);
    }
    
    // Install dependencies
    await runCommand('npm install', 'Installing dependencies');
    
    // Setup Firebase
    await setupFirebase();
    
    // Setup GitHub secrets instructions
    await setupGitHubSecrets();
    
    console.log('🎉 Setup Complete!');
    console.log('==================\n');
    
    console.log('Next steps:');
    console.log('1. 🔥 Set up your Firebase project (see FIREBASE_SETUP.md)');
    console.log('2. 🚀 Run locally: npm run dev');
    console.log('3. 🌐 Deploy: Push to GitHub (automatic deployment configured)');
    console.log('4. 📱 Test authentication features\n');
    
    const startNow = await askQuestion('Start development server now? (Y/n): ');
    if (startNow.toLowerCase() !== 'n') {
      console.log('\n🚀 Starting development server...\n');
      execSync('npm run dev', { stdio: 'inherit' });
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main(); 