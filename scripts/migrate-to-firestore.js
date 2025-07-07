#!/usr/bin/env node

/**
 * Migration script to move data from SQLite to Firestore
 */

const admin = require('firebase-admin');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : require('../firebase-service-account.json');
} catch (error) {
  console.error('❌ Firebase service account configuration not found');
  console.log('Please set FIREBASE_SERVICE_ACCOUNT_KEY environment variable or create firebase-service-account.json');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();

// SQLite database path
const SQLITE_DB_PATH = path.join(__dirname, '..', 'crow_eye_local.db');

async function openDatabase() {
  return open({
    filename: SQLITE_DB_PATH,
    driver: sqlite3.Database,
  });
}

async function migrateUsers(sqliteDb) {
  console.log('🔄 Migrating users...');
  
  const users = await sqliteDb.all('SELECT * FROM users');
  const batch = db.batch();
  const userIdMap = new Map();

  for (const user of users) {
    try {
      // Create Firebase Auth user
      const authUser = await admin.auth().createUser({
        email: user.email,
        displayName: user.full_name || user.username,
        disabled: !user.is_active,
      });

      userIdMap.set(user.id, authUser.uid);

      // Create Firestore user document
      const userRef = db.collection('users').doc(authUser.uid);
      batch.set(userRef, {
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        isActive: user.is_active,
        subscriptionTier: user.subscription_tier || 'free',
        createdAt: admin.firestore.Timestamp.fromDate(new Date(user.created_at)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(user.created_at)),
      });

      console.log(`✅ Migrated user: ${user.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        // Get existing user
        const existingUser = await admin.auth().getUserByEmail(user.email);
        userIdMap.set(user.id, existingUser.uid);
        console.log(`⚠️  User already exists: ${user.email}`);
      } else {
        console.error(`❌ Failed to migrate user ${user.email}:`, error);
      }
    }
  }

  await batch.commit();
  console.log(`✅ Migrated ${users.length} users`);
  
  return userIdMap;
}

async function migrateMedia(sqliteDb, userIdMap) {
  console.log('🔄 Migrating media items...');
  
  const mediaItems = await sqliteDb.all('SELECT * FROM media_items');
  let batch = db.batch();
  const mediaIdMap = new Map();
  let batchCount = 0;

  for (const media of mediaItems) {
    const userId = userIdMap.get(media.user_id);
    if (!userId) {
      console.warn(`⚠️  Skipping media ${media.id} - user not found`);
      continue;
    }

    const mediaRef = db.collection('media').doc();
    mediaIdMap.set(media.id, mediaRef.id);

    let aiTags = [];
    try {
      aiTags = media.ai_tags ? JSON.parse(media.ai_tags) : [];
    } catch (e) {
      console.warn(`Warning: Could not parse ai_tags for media ${media.id}`);
    }

    let postMetadata = {};
    try {
      postMetadata = media.post_metadata ? JSON.parse(media.post_metadata) : {};
    } catch (e) {
      console.warn(`Warning: Could not parse post_metadata for media ${media.id}`);
    }

    let platforms = [];
    try {
      platforms = media.platforms ? JSON.parse(media.platforms) : [];
    } catch (e) {
      console.warn(`Warning: Could not parse platforms for media ${media.id}`);
    }

    const mediaData = {
      userId,
      filename: media.filename,
      originalFilename: media.original_filename,
      gcsPath: media.gcs_path,
      thumbnailPath: media.thumbnail_path,
      mediaType: media.media_type,
      fileSize: media.file_size,
      width: media.width,
      height: media.height,
      duration: media.duration,
      caption: media.caption,
      description: media.description,
      aiTags: aiTags,
      isPostReady: media.is_post_ready,
      status: media.status,
      postMetadata: postMetadata,
      platforms: platforms,
      googlePhotosId: media.google_photos_id,
      googlePhotosMetadata: media.google_photos_metadata ? JSON.parse(media.google_photos_metadata || '{}') : {},
      importSource: media.import_source,
      importDate: media.import_date ? admin.firestore.Timestamp.fromDate(new Date(media.import_date)) : null,
      uploadDate: admin.firestore.Timestamp.fromDate(new Date(media.upload_date)),
      createdAt: admin.firestore.Timestamp.fromDate(new Date(media.upload_date)),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date(media.updated_date)),
    };

    batch.set(mediaRef, mediaData);
    batchCount++;
    
    // Commit batch every 100 items to avoid memory issues
    if (batchCount >= 100) {
      await batch.commit();
      console.log(`📦 Batch committed (${batchCount} items)`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit remaining items
  if (batchCount > 0) {
    await batch.commit();
    console.log(`📦 Final batch committed (${batchCount} items)`);
  }

  console.log(`✅ Migrated ${mediaItems.length} media items`);
  return mediaIdMap;
}

async function main() {
  try {
    console.log('🚀 Starting Firestore migration...');
    
    // Check if SQLite database exists
    const fs = require('fs');
    if (!fs.existsSync(SQLITE_DB_PATH)) {
      console.error(`❌ SQLite database not found at: ${SQLITE_DB_PATH}`);
      process.exit(1);
    }

    console.log(`📁 Found SQLite database at: ${SQLITE_DB_PATH}`);
    
    // Open SQLite database
    const sqliteDb = await openDatabase();
    console.log('✅ Connected to SQLite database');

    // Check if tables exist
    const tables = await sqliteDb.all(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    console.log('📊 Found tables:', tables.map(t => t.name).join(', '));

    // Migrate data
    const userIdMap = await migrateUsers(sqliteDb);
    const mediaIdMap = await migrateMedia(sqliteDb, userIdMap);

    // Close SQLite database
    await sqliteDb.close();
    console.log('✅ SQLite database closed');

    console.log('🎉 Migration completed successfully!');
    console.log('📋 Summary:');
    console.log(`   - Users: ${userIdMap.size}`);
    console.log(`   - Media: ${mediaIdMap.size}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Deploy Firestore security rules: firebase deploy --only firestore:rules');
    console.log('2. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
    console.log('3. Update frontend to use Firestore');
    console.log('4. Test the application');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main(); 