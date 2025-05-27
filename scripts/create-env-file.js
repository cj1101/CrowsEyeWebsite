#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating .env.local file for Firebase configuration...\n');

const envTemplate = `# Firebase Configuration for Crow's Eye Website
# Replace these placeholder values with your actual Firebase project configuration
# Get these values from Firebase Console → Project Settings → General → Your apps

NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Optional: Custom API Key for BYOK users
NEXT_PUBLIC_CUSTOM_API_KEY=

# Optional: Stripe Configuration (for payments)
STRIPE_SECRET_KEY=
STRIPE_BYOK_COUPON_ID=

# Development Environment
NEXT_PUBLIC_ENVIRONMENT=development
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
    fs.copyFileSync(envPath, envPath + '.backup');
  }
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file');
  console.log('\n📝 Next steps:');
  console.log('1. Open .env.local in your editor');
  console.log('2. Replace the placeholder values with your actual Firebase configuration');
  console.log('3. Get your Firebase config from: https://console.firebase.google.com/');
  console.log('   → Project Settings → General → Your apps → Web app config');
  console.log('\n🚀 After updating .env.local, run: npm run dev');
  
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('\nPlease create .env.local manually with this content:');
  console.log('\n' + envTemplate);
} 