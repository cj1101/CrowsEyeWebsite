#!/usr/bin/env node

/**
 * Simple script to create a test user in your existing Firestore
 * No emulators needed - uses your real Firestore database
 */

// Import Firestore directly from the frontend configuration
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc, Timestamp } = require('firebase/firestore');
require('dotenv').config();

// Use your existing Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function createTestUser() {
  try {
    console.log('🔧 Connecting to your existing Firestore...');
    
    // Initialize Firebase with your existing config
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Connected to Firestore');

    // Create test user with your email
    const userId = 'test_user_charlie';
    console.log('👤 Creating test user...');
    
    await setDoc(doc(db, 'users', userId), {
      email: 'charlie@suarezhouse.net',
      username: 'charlie_test',
      fullName: 'Charlie Test User',
      isActive: true,
      subscriptionTier: 'pro',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Created test user: charlie@suarezhouse.net');

    // Create some test media
    console.log('📸 Creating test media...');
    
    for (let i = 1; i <= 5; i++) {
      await addDoc(collection(db, 'media'), {
        userId,
        filename: `test-image-${i}.jpg`,
        originalFilename: `test-image-${i}.jpg`,
        gcsPath: `/test/media/test-image-${i}.jpg`,
        thumbnailPath: `/test/thumbnails/test-image-${i}_thumb.jpg`,
        mediaType: 'image',
        fileSize: 1024000 + (i * 100000),
        width: 1920,
        height: 1080,
        caption: `Test image ${i}`,
        description: `Test image ${i} for migration testing`,
        aiTags: ['test', 'migration', 'sample'],
        isPostReady: i % 2 === 0,
        status: 'uploaded',
        uploadDate: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    console.log('✅ Created 5 test media items');

    console.log('\n🎉 Test data created successfully!');
    console.log('🌐 Now test your app: http://localhost:3000');
    console.log('📝 Use this user ID for testing: test_user_charlie');
    console.log('📧 Email: charlie@suarezhouse.net');

  } catch (error) {
    console.error('❌ Failed to create test user:', error);
    
    if (error.code === 'auth/insufficient-permission') {
      console.log('\n💡 Firestore rules might be blocking this operation');
      console.log('This is normal - try testing through the frontend instead');
    }
    
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.log('\n💡 Firebase config missing - make sure .env.local is set up');
      console.log('Run: npm run emulator:setup');
    }
  }
}

// Only run if called directly
if (require.main === module) {
  createTestUser();
}

module.exports = { createTestUser }; 