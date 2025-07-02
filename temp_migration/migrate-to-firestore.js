#!/usr/bin/env node
"use strict";
/**
 * Migration script to move data from SQLite to Firestore
 *
 * Usage:
 * 1. Ensure you have the SQLite database file available
 * 2. Set up Firebase Admin SDK credentials
 * 3. Run: npx ts-node scripts/migrate-to-firestore.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const sqlite3_1 = require("sqlite3");
const sqlite_1 = require("sqlite");
const path = require("path");
const dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)();
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
async function openDatabase() {
    return (0, sqlite_1.open)({
        filename: SQLITE_DB_PATH,
        driver: sqlite3_1.default.Database,
    });
}
async function migrateUsers(sqliteDb) {
    console.log('🔄 Migrating users...');
    const users = await sqliteDb.all('SELECT * FROM users');
    const batch = db.batch();
    const userIdMap = new Map();
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
        }
        catch (error) {
            if (error.code === 'auth/email-already-exists') {
                // Get existing user
                const existingUser = await admin.auth().getUserByEmail(user.email);
                userIdMap.set(user.id, existingUser.uid);
                console.log(`⚠️  User already exists: ${user.email}`);
            }
            else {
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
    const batch = db.batch();
    const mediaIdMap = new Map();
    for (const media of mediaItems) {
        const userId = userIdMap.get(media.user_id);
        if (!userId) {
            console.warn(`⚠️  Skipping media ${media.id} - user not found`);
            continue;
        }
        const mediaRef = db.collection('media').doc();
        mediaIdMap.set(media.id, mediaRef.id);
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
async function migratePosts(sqliteDb, userIdMap) {
    console.log('🔄 Migrating posts...');
    const posts = await sqliteDb.all('SELECT * FROM posts');
    const batch = db.batch();
    for (const post of posts) {
        const userId = userIdMap.get(post.user_id);
        if (!userId) {
            console.warn(`⚠️  Skipping post ${post.id} - user not found`);
            continue;
        }
        const postRef = db.collection('posts').doc();
        const postData = {
            userId,
            title: post.title,
            content: post.content,
            imagePath: post.image_path,
            videoPath: post.video_path,
            description: post.description,
            tags: post.tags ? post.tags.split(',').map((t) => t.trim()) : [],
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
async function migrateGalleries(sqliteDb, userIdMap, mediaIdMap) {
    console.log('🔄 Migrating galleries...');
    const galleries = await sqliteDb.all('SELECT * FROM galleries');
    const batch = db.batch();
    for (const gallery of galleries) {
        const userId = userIdMap.get(gallery.user_id);
        if (!userId) {
            console.warn(`⚠️  Skipping gallery ${gallery.id} - user not found`);
            continue;
        }
        const galleryRef = db.collection('galleries').doc();
        const galleryData = {
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
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}
// Run migration
main();
