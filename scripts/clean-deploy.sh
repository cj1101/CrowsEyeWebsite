#!/bin/bash
echo "🧹 Cleaning up for Firebase deployment..."

# Create installers directory if it doesn't exist
mkdir -p installers

# Move installer files from public to installers directory
if [ -f "public/install.bat" ]; then
    mv public/install.bat installers/
    echo "✅ Moved install.bat to installers/"
fi

if [ -f "public/install.py" ]; then
    mv public/install.py installers/
    echo "✅ Moved install.py to installers/"
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf out
rm -rf .next

# Build the project
echo "📦 Building Next.js app..."
npm run build

# Remove any executable files that might have been copied
echo "🧹 Removing executable files from out directory..."
find out -name "*.py" -delete
find out -name "*.bat" -delete
find out -name "*.exe" -delete
find out -name "*.sh" -delete

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Your site should be live at: https://crows-eye-website.web.app" 