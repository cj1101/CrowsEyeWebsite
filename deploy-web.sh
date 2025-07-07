#!/bin/bash

# Crow's Eye Web App - Firebase Deployment Script
# This script builds and deploys the web application to Firebase

set -e

echo "🚀 Starting Crow's Eye Web App deployment to Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please log in to Firebase:"
    firebase login
fi

# Check if we have a Firebase project
if [ ! -f ".firebaserc" ]; then
    echo "❌ No Firebase project configured. Please run:"
    echo "   firebase init"
    exit 1
fi

# Get API URL from user if not set
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "🔧 API URL not set. Please provide your deployed API URL:"
    read -p "API URL (e.g., https://crow-eye-api-xxxxx-uc.a.run.app): " API_URL
    if [ -z "$API_URL" ]; then
        echo "⚠️  No API URL provided. Using localhost (development mode)"
        API_URL="http://localhost:8000"
    fi
else
    API_URL="$NEXT_PUBLIC_API_URL"
fi

echo "📋 Using API URL: $API_URL"

# Set environment variable for build
export NEXT_PUBLIC_API_URL="$API_URL"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️  Building application..."
npm run build

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

# Get the hosting URL
PROJECT_ID=$(firebase projects:list --json | jq -r '.[] | select(.current == true) | .projectId')
HOSTING_URL="https://$PROJECT_ID.web.app"

echo "✅ Deployment complete!"
echo "🌐 Web App URL: $HOSTING_URL"
echo "🔗 API URL: $API_URL"
echo ""
echo "📝 Next steps:"
echo "1. Test your web app: $HOSTING_URL"
echo "2. Verify API connection in the AI Tools tab"
echo "3. Update any bookmarks or links"
echo ""
echo "🎉 Your Crow's Eye marketing tool is now live!" 