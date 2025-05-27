Write-Host "🧹 Cleaning up for Firebase deployment..." -ForegroundColor Green

# Create installers directory if it doesn't exist
if (!(Test-Path "installers")) {
    New-Item -ItemType Directory -Path "installers"
}

# Move installer files from public to installers directory
if (Test-Path "public/install.bat") {
    Move-Item "public/install.bat" "installers/"
    Write-Host "✅ Moved install.bat to installers/" -ForegroundColor Green
}

if (Test-Path "public/install.py") {
    Move-Item "public/install.py" "installers/"
    Write-Host "✅ Moved install.py to installers/" -ForegroundColor Green
}

# Clean previous build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "out") { Remove-Item -Recurse -Force "out" }
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

# Build the project
Write-Host "📦 Building Next.js app..." -ForegroundColor Blue
npm run build

# Remove any executable files that might have been copied
Write-Host "🧹 Removing executable files from out directory..." -ForegroundColor Yellow
Get-ChildItem -Path "out" -Recurse -Include "*.py", "*.bat", "*.exe", "*.sh" | Remove-Item -Force

# Deploy to Firebase
Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Magenta
firebase deploy --only hosting

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your site should be live at: https://crows-eye-website.web.app" -ForegroundColor Cyan 