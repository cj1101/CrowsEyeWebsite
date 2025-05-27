const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Your Firebase project configuration
const FIREBASE_PROJECT_ID = 'crows-eye-website';
const CUSTOM_DOMAIN = 'crowseye.tech';

console.log('🚀 Setting up Firebase Hosting for crowseye.tech...\n');

// Step 1: Initialize Firebase project
console.log('📋 Step 1: Initializing Firebase project...');
try {
  // Create .firebaserc file with your project
  const firebaserc = {
    projects: {
      default: FIREBASE_PROJECT_ID
    }
  };
  
  fs.writeFileSync('.firebaserc', JSON.stringify(firebaserc, null, 2));
  console.log('✅ Created .firebaserc with project:', FIREBASE_PROJECT_ID);
} catch (error) {
  console.error('❌ Error creating .firebaserc:', error.message);
}

// Step 2: Update firebase.json for custom domain
console.log('\n📋 Step 2: Updating Firebase configuration...');
try {
  const firebaseConfig = {
    hosting: {
      public: "out",
      ignore: [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      rewrites: [
        {
          source: "**",
          destination: "/index.html"
        }
      ],
      headers: [
        {
          source: "**/*.@(js|css)",
          headers: [
            {
              key: "Cache-Control",
              value: "max-age=31536000"
            }
          ]
        },
        {
          source: "**/*.@(jpg|jpeg|gif|png|svg|webp)",
          headers: [
            {
              key: "Cache-Control",
              value: "max-age=31536000"
            }
          ]
        }
      ],
      cleanUrls: true,
      trailingSlash: false
    }
  };
  
  fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
  console.log('✅ Updated firebase.json with optimized configuration');
} catch (error) {
  console.error('❌ Error updating firebase.json:', error.message);
}

// Step 3: Create deployment script
console.log('\n📋 Step 3: Creating deployment scripts...');
try {
  const deployScript = `#!/bin/bash
echo "🚀 Building and deploying to Firebase Hosting..."
echo "📦 Building Next.js app..."
npm run build

echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Your site is live at: https://${CUSTOM_DOMAIN}"
echo "🌐 Firebase URL: https://${FIREBASE_PROJECT_ID}.web.app"
`;

  fs.writeFileSync('deploy.sh', deployScript);
  console.log('✅ Created deploy.sh script');
} catch (error) {
  console.error('❌ Error creating deploy script:', error.message);
}

// Step 4: Instructions for custom domain setup
console.log('\n📋 Step 4: Custom Domain Setup Instructions');
console.log('='.repeat(50));
console.log(`
🌐 CUSTOM DOMAIN SETUP FOR ${CUSTOM_DOMAIN}

1. **Firebase Console Setup:**
   - Go to: https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/hosting
   - Click "Add custom domain"
   - Enter: ${CUSTOM_DOMAIN}
   - Follow the verification steps

2. **DNS Configuration:**
   You'll need to add these DNS records to your domain registrar:
   
   For ${CUSTOM_DOMAIN}:
   Type: A
   Name: @ (or leave blank)
   Value: [Firebase will provide IP addresses]
   
   For www.${CUSTOM_DOMAIN}:
   Type: CNAME
   Name: www
   Value: ${FIREBASE_PROJECT_ID}.web.app

3. **SSL Certificate:**
   Firebase will automatically provision SSL certificates for your custom domain.

4. **Deploy Commands:**
   - Manual deploy: npm run deploy
   - Test locally: npm run firebase:serve
   - Build only: npm run build

5. **GitHub Actions:**
   Your GitHub Actions workflow is already configured for automatic deployment.
   Add these secrets to your GitHub repository:
   - FIREBASE_SERVICE_ACCOUNT: [Get from Firebase Console]
   - FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}
`);

console.log('\n🎯 NEXT STEPS:');
console.log('1. Run: firebase login');
console.log('2. Run: npm run deploy');
console.log('3. Set up custom domain in Firebase Console');
console.log('4. Configure DNS records with your domain registrar');
console.log('\n✅ Setup complete! Your project is ready for Firebase Hosting.'); 