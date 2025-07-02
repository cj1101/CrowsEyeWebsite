#!/usr/bin/env node

/**
 * Create Demo Data for Firestore Emulators
 * This script creates demo users and media directly in Firestore emulators for testing
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK for emulator
admin.initializeApp({
  projectId: 'demo-project',
  credential: admin.credential.applicationDefault(),
});

// Connect to emulator
const db = admin.firestore();
db.settings({
  host: 'localhost:8080',
  ssl: false
});

async function createDemoUser() {
  console.log('👤 Creating demo user...');
  
  const demoUserId = 'demo_user_1';
  const userRef = db.collection('users').doc(demoUserId);
  
  await userRef.set({
    email: 'demo@example.com',
    username: 'demo_user',
    fullName: 'Demo User',
    isActive: true,
    subscriptionTier: 'pro',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  });

  console.log('✅ Created demo user: demo@example.com');
  return demoUserId;
}

async function createDemoMedia(userId) {
  console.log('📸 Creating demo media...');
  
  const batch = db.batch();
  
  // Create 10 demo media items
  for (let i = 1; i <= 10; i++) {
    const mediaRef = db.collection('media').doc();
    batch.set(mediaRef, {
      userId,
      filename: `demo-image-${i}.jpg`,
      originalFilename: `demo-image-${i}.jpg`,
      gcsPath: `/demo/media/demo-image-${i}.jpg`,
      thumbnailPath: `/demo/thumbnails/demo-image-${i}_thumb.jpg`,
      mediaType: 'image',
      fileSize: 1024000 + (i * 100000),
      width: 1920,
      height: 1080,
      caption: `Demo image ${i} caption`,
      description: `This is demo image ${i} for testing the Firestore migration`,
      aiTags: ['demo', 'test', 'image', `sample${i}`],
      isPostReady: i % 3 === 0, // Every 3rd image is post-ready
      status: i % 2 === 0 ? 'uploaded' : 'draft',
      uploadDate: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }
  
  await batch.commit();
  console.log('✅ Created 10 demo media items');
}

async function createDemoGallery(userId) {
  console.log('🖼️ Creating demo gallery...');
  
  const galleryRef = db.collection('galleries').doc();
  await galleryRef.set({
    userId,
    title: 'Demo Gallery',
    description: 'A sample gallery for testing',
    mediaIds: [], // In real app, this would be populated with media IDs
    isPublic: false,
    createdDate: admin.firestore.Timestamp.now(),
    updatedDate: admin.firestore.Timestamp.now(),
  });

  console.log('✅ Created demo gallery');
}

async function main() {
  try {
    console.log('🚀 Creating demo data for Firestore emulators...');
    
    // Test connection first
    await db.collection('test').add({
      message: 'Connection test',
      timestamp: admin.firestore.Timestamp.now()
    });
    console.log('✅ Connected to Firestore emulator');
    
    // Clean up test document
    const testDocs = await db.collection('test').get();
    const batch = db.batch();
    testDocs.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // Create demo data
    const userId = await createDemoUser();
    await createDemoMedia(userId);
    await createDemoGallery(userId);

    console.log('\n🎉 Demo data created successfully!');
    console.log('🔗 Open Emulator UI: http://localhost:4000');
    console.log('🌐 Open your app: http://localhost:3000');
    console.log('\n📊 Created:');
    console.log('- 1 demo user (demo@example.com)');
    console.log('- 10 demo media items');
    console.log('- 1 demo gallery');
    
  } catch (error) {
    console.error('❌ Demo data creation failed:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Make sure emulators are running');
      console.log('Run: npm run emulator:start');
    }
    
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}

module.exports = { main }; 