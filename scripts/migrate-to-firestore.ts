#!/usr/bin/env node

/**
 * Migration script to move data from SQLite to Firestore
 * 
 * Usage:
 * 1. Ensure you have the SQLite database file available
 * 2. Set up Firebase Admin SDK credentials
 * 3. Run: npx ts-node scripts/migrate-to-firestore.ts
 */

import * as admin from 'firebase-admin';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Firebase Admin SDK
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const storage = admin.storage();

// SQLite database path
const SQLITE_DB_PATH = path.join(__dirname, '..', 'crow_eye_local.db');

interface SQLiteUser {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  hashed_password: string;
  is_active: boolean;
  subscription_tier: string;
  created_at: string;
}

interface SQLiteMedia {
  id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  gcs_path: string;
  thumbnail_path?: string;
  media_type: string;
  file_size: number;
  width?: number;
  height?: number;
  duration?: number;
  caption?: string;
  description?: string;
  ai_tags?: string;
  is_post_ready: boolean;
  status: string;
  post_metadata?: string;
  platforms?: string;
  google_photos_id?: string;
  google_photos_metadata?: string;
  import_source?: string;
  import_date?: string;
  upload_date: string;
  updated_date: string;
}

interface SQLitePost {
  id: number;
  user_id: number;
  title: string;
  content?: string;
  image_path?: string;
  video_path?: string;
  description?: string;
  tags?: string;
  platforms?: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

interface SQLiteGallery {
  id: number;
  user_id: number;
  name: string;
  caption?: string;
  created_date: string;
  updated_date: string;
}

async function openDatabase(): Promise<Database> {
  return open({
    filename: SQLITE_DB_PATH,
    driver: sqlite3.Database,
  });
}

async function migrateUsers(sqliteDb: Database) {
  console.log('🔄 Migrating users...');
  
  const users = await sqliteDb.all('SELECT * FROM users') as SQLiteUser[];
  const batch = db.batch();
  const userIdMap = new Map<number, string>();

  for (const user of users) {
    // Create Firebase Auth user
    try {
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
    } catch (error: any) {
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

async function migrateMedia(sqliteDb: Database, userIdMap: Map<number, string>) {
  console.log('🔄 Migrating media items...');
  
  const mediaItems = await sqliteDb.all('SELECT * FROM media_items') as SQLiteMedia[];
  const batch = db.batch();
  const mediaIdMap = new Map<number, string>();

  for (const media of mediaItems) {
    const userId = userIdMap.get(media.user_id);
    if (!userId) {
      console.warn(`⚠️  Skipping media ${media.id} - user not found`);
      continue;
    }

    const mediaRef = db.collection('media').doc();
    mediaIdMap.set(media.id, mediaRef.id);

    const mediaData: any = {
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
      aiTags: media.ai_tags ? JSON.parse(media.ai_tags) : [],
      isPostReady: media.is_post_ready,
      status: media.status,
      postMetadata: media.post_metadata ? JSON.parse(media.post_metadata) : {},
      platforms: media.platforms ? JSON.parse(media.platforms) : [],
      googlePhotosId: media.google_photos_id,
      googlePhotosMetadata: media.google_photos_metadata ? JSON.parse(media.google_photos_metadata) : {},
      importSource: media.import_source,
      importDate: media.import_date ? admin.firestore.Timestamp.fromDate(new Date(media.import_date)) : null,
      uploadDate: admin.firestore.Timestamp.fromDate(new Date(media.upload_date)),
      createdAt: admin.firestore.Timestamp.fromDate(new Date(media.upload_date)),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date(media.updated_date)),
    };

    batch.set(mediaRef, mediaData);
    
    // Commit batch in smaller chunks to avoid memory issues
    if (mediaItems.indexOf(media) % 100 === 0 && mediaItems.indexOf(media) > 0) {
      await batch.commit();
      console.log('📦 Batch committed');
    }
  }

  await batch.commit();
  console.log(`✅ Migrated ${mediaItems.length} media items`);
  
  return mediaIdMap;
}

async function migratePosts(sqliteDb: Database, userIdMap: Map<number, string>) {
  console.log('🔄 Migrating posts...');
  
  const posts = await sqliteDb.all('SELECT * FROM posts') as SQLitePost[];
  const batch = db.batch();

  for (const post of posts) {
    const userId = userIdMap.get(post.user_id);
    if (!userId) {
      console.warn(`⚠️  Skipping post ${post.id} - user not found`);
      continue;
    }

    const postRef = db.collection('posts').doc();
    
    const postData: any = {
      userId,
      title: post.title,
      content: post.content,
      imagePath: post.image_path,
      videoPath: post.video_path,
      description: post.description,
      tags: post.tags ? post.tags.split(',').map((t: string) => t.trim()) : [],
      platforms: post.platforms ? JSON.parse(post.platforms) : [],
      status: post.status,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(post.created_at)),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date(post.updated_at)),
      publishedAt: post.published_at ? admin.firestore.Timestamp.fromDate(new Date(post.published_at)) : null,
    };

    batch.set(postRef, postData);
  }

  await batch.commit();
  console.log(`✅ Migrated ${posts.length} posts`);
}

async function migrateGalleries(sqliteDb: Database, userIdMap: Map<number, string>, mediaIdMap: Map<number, string>) {
  console.log('🔄 Migrating galleries...');
  
  const galleries = await sqliteDb.all('SELECT * FROM galleries') as SQLiteGallery[];
  const batch = db.batch();

  for (const gallery of galleries) {
    const userId = userIdMap.get(gallery.user_id);
    if (!userId) {
      console.warn(`⚠️  Skipping gallery ${gallery.id} - user not found`);
      continue;
    }

    const galleryRef = db.collection('galleries').doc();
    
    const galleryData: any = {
      userId,
      name: gallery.name,
      caption: gallery.caption,
      mediaItems: [], // Will be populated if there's a gallery_media_items table
      createdAt: admin.firestore.Timestamp.fromDate(new Date(gallery.created_date)),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date(gallery.updated_date)),
    };

    batch.set(galleryRef, galleryData);
  }

  await batch.commit();
  console.log(`✅ Migrated ${galleries.length} galleries`);
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

    // Migrate data
    const userIdMap = await migrateUsers(sqliteDb);
    const mediaIdMap = await migrateMedia(sqliteDb, userIdMap);
    await migratePosts(sqliteDb, userIdMap);
    await migrateGalleries(sqliteDb, userIdMap, mediaIdMap);

    // Close SQLite database
    await sqliteDb.close();
    console.log('✅ SQLite database closed');

    console.log('🎉 Migration completed successfully!');
    console.log('📋 Summary:');
    console.log(`   - Users: ${userIdMap.size}`);
    console.log(`   - Media: ${mediaIdMap.size}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Deploy Firestore security rules');
    console.log('2. Deploy Firestore indexes');
    console.log('3. Update frontend to use Firestore');
    console.log('4. Test the application');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main(); 