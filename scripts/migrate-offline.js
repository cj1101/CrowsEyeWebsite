#!/usr/bin/env node

/**
 * Offline Migration Script for Firebase Emulators
 * This script migrates data from SQLite to Firebase emulators for testing
 */

const admin = require('firebase-admin');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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

// SQLite database path
const SQLITE_DB_PATH = path.join(__dirname, '..', 'crow_eye_local.db');

async function openDatabase() {
  return open({
    filename: SQLITE_DB_PATH,
    driver: sqlite3.Database,
  });
}

async function migrateUsers(sqliteDb) {
  console.log('🔄 Migrating users to emulator...');
  
  let users;
  try {
    users = await sqliteDb.all('SELECT * FROM users');
  } catch (error) {
    console.log('⚠️  No users table found, creating demo user...');
    return await createDemoUser();
  }

  const batch = db.batch();
  const userIdMap = new Map();

  for (const user of users) {
    try {
      // For emulator, we'll use a simple UID mapping
      const emulatorUid = `user_${user.id}`;
      userIdMap.set(user.id, emulatorUid);

      // Create Firestore user document
      const userRef = db.collection('users').doc(emulatorUid);
      batch.set(userRef, {
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        isActive: user.is_active,
        subscriptionTier: user.subscription_tier || 'free',
        createdAt: admin.firestore.Timestamp.fromDate(new Date(user.created_at)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(user.created_at)),
      });

      console.log(`✅ Prepared user for migration: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to prepare user ${user.email}:`, error);
    }
  }

  await batch.commit();
  console.log(`✅ Migrated ${users.length} users to emulator`);
  
  return userIdMap;
}

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
  
  const userIdMap = new Map();
  userIdMap.set('demo', demoUserId);
  return userIdMap;
}

async function migrateMedia(sqliteDb, userIdMap) {
  console.log('🔄 Migrating media items to emulator...');
  
  let mediaItems;
  try {
    mediaItems = await sqliteDb.all('SELECT * FROM media_items');
  } catch (error) {
    console.log('⚠️  No media table found, creating demo media...');
    return await createDemoMedia(userIdMap);
  }

  let batch = db.batch();
  let batchCount = 0;

  for (const media of mediaItems) {
    const userId = userIdMap.get(media.user_id) || Array.from(userIdMap.values())[0];
    
    const mediaRef = db.collection('media').doc();

    const mediaData = {
      userId,
      filename: media.filename || `demo-file-${Date.now()}.jpg`,
      originalFilename: media.original_filename || media.filename,
      gcsPath: media.gcs_path || `/demo/media/${media.id}`,
      mediaType: media.media_type || 'image',
      fileSize: media.file_size || 1024000,
      caption: media.caption || '',
      description: media.description || '',
      aiTags: [],
      isPostReady: media.is_post_ready || false,
      status: media.status || 'draft',
      uploadDate: admin.firestore.Timestamp.fromDate(new Date(media.upload_date || Date.now())),
      createdAt: admin.firestore.Timestamp.fromDate(new Date(media.upload_date || Date.now())),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date(media.updated_date || Date.now())),
    };

    batch.set(mediaRef, mediaData);
    batchCount++;
    
    if (batchCount >= 50) {
      await batch.commit();
      console.log(`📦 Batch committed (${batchCount} items)`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`📦 Final batch committed (${batchCount} items)`);
  }

  console.log(`✅ Migrated ${mediaItems.length} media items to emulator`);
}

async function createDemoMedia(userIdMap) {
  console.log('📸 Creating demo media...');
  
  const userId = Array.from(userIdMap.values())[0];
  const batch = db.batch();
  
  // Create 5 demo media items
  for (let i = 1; i <= 5; i++) {
    const mediaRef = db.collection('media').doc();
    batch.set(mediaRef, {
      userId,
      filename: `demo-image-${i}.jpg`,
      originalFilename: `demo-image-${i}.jpg`,
      gcsPath: `/demo/media/demo-image-${i}.jpg`,
      mediaType: 'image',
      fileSize: 1024000 + (i * 100000),
      caption: `Demo image ${i}`,
      description: `This is a demo image for testing purposes`,
      aiTags: ['demo', 'test', 'image'],
      isPostReady: i % 2 === 0,
      status: 'uploaded',
      uploadDate: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }
  
  await batch.commit();
  console.log('✅ Created 5 demo media items');
}

async function main() {
  try {
    console.log('🚀 Starting offline migration to Firebase emulators...');
    
    // Check if SQLite database exists
    const fs = require('fs');
    const hasDatabase = fs.existsSync(SQLITE_DB_PATH);
    
    if (hasDatabase) {
      console.log(`📁 Found SQLite database at: ${SQLITE_DB_PATH}`);
      
      // Open SQLite database
      const sqliteDb = await openDatabase();
      console.log('✅ Connected to SQLite database');

      // Migrate data
      const userIdMap = await migrateUsers(sqliteDb);
      await migrateMedia(sqliteDb, userIdMap);
      
      await sqliteDb.close();
    } else {
      console.log('⚠️  No SQLite database found, creating demo data...');
      const userIdMap = await createDemoUser();
      await createDemoMedia(userIdMap);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('🔗 Open Emulator UI: http://localhost:4000');
    console.log('🌐 Open your app: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}

module.exports = { main }; 