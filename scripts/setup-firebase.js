#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Firebase Setup for Crow\'s Eye Website');
console.log('==========================================\n');

console.log('Please provide your Firebase configuration values.');
console.log('You can find these in Firebase Console > Project Settings > General > Your apps > Web app\n');

const questions = [
  { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', prompt: 'Firebase API Key: ' },
  { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', prompt: 'Auth Domain (project-id.firebaseapp.com): ' },
  { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', prompt: 'Project ID: ' },
  { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', prompt: 'Storage Bucket (project-id.appspot.com): ' },
  { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', prompt: 'Messaging Sender ID: ' },
  { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', prompt: 'App ID: ' }
];

const config = {};

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.prompt, (answer) => {
      config[question.key] = answer.trim();
      resolve();
    });
  });
}

async function setupFirebase() {
  console.log('Enter your Firebase configuration:\n');
  
  for (const question of questions) {
    await askQuestion(question);
  }
  
  // Create .env.local content
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envWithComments = `# Firebase Configuration for Crow's Eye Website
# Generated on ${new Date().toISOString()}

${envContent}

# Optional: For development
NEXT_PUBLIC_ENVIRONMENT=development
`;

  // Write to .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    fs.writeFileSync(envPath, envWithComments);
    console.log('\n✅ Firebase configuration saved to .env.local');
    console.log('\n🚀 You can now run: npm run dev');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure your Firebase project has Authentication enabled');
    console.log('2. Enable Email/Password and Google sign-in methods');
    console.log('3. Set up Firestore database');
    console.log('4. Add your domain to Firebase Auth authorized domains');
  } catch (error) {
    console.error('\n❌ Error writing .env.local:', error.message);
    console.log('\nPlease create .env.local manually with this content:');
    console.log('\n' + envWithComments);
  }
  
  rl.close();
}

setupFirebase().catch(console.error); 