#!/usr/bin/env node

/**
 * Creates or updates the test user `charlie@suarezhouse.net` in your production Firebase project.
 *
 * 1. If a user with this email already exists in Firebase Authentication, the script resets the
 *    password to the default test password so you always know the credentials.
 * 2. Ensures that a corresponding document exists in the `users` collection in Firestore so the
 *    app can load the user profile after sign-in.
 *
 * Usage:
 *   # Make sure the FIREBASE_SERVICE_ACCOUNT_KEY env variable is set to the JSON credentials
 *   node scripts/create_firebase_charlie_user.js
 */

require('dotenv').config();
const admin = require('firebase-admin');

// ---- Initialise Firebase Admin -------------------------------------------------
if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('🔑 Firebase Admin initialised with service account credentials');
  } else {
    // Will work when the script is executed in Cloud Shell or any environment that already has
    // application default credentials (e.g. Cloud Build).
    admin.initializeApp();
    console.log('🔑 Firebase Admin initialised with default credentials');
  }
}

const auth = admin.auth();
const db = admin.firestore();

// ---- Constants -----------------------------------------------------------------
const EMAIL = 'charlie@suarezhouse.net';
const PASSWORD = 'ProAccess123!';
const DISPLAY_NAME = 'Charlie Suarez';

async function ensureAuthUser() {
  try {
    const existing = await auth.getUserByEmail(EMAIL);
    console.log(`👤 User already exists in Firebase Auth (uid: ${existing.uid}) – resetting password…`);
    await auth.updateUser(existing.uid, { password: PASSWORD, displayName: DISPLAY_NAME });
    return existing;
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log('👤 User does not exist in Firebase Auth – creating…');
      return await auth.createUser({
        email: EMAIL,
        password: PASSWORD,
        displayName: DISPLAY_NAME,
        emailVerified: true,
      });
    }
    throw err; // propagate other errors
  }
}

async function ensureFirestoreUser(uid) {
  const userDocRef = db.collection('users').doc(uid);
  const snap = await userDocRef.get();

  const now = admin.firestore.Timestamp.now();

  if (snap.exists) {
    console.log('🗄️  Firestore user document already exists – ensuring required fields…');
    await userDocRef.set({
      email: EMAIL,
      username: 'charlie',
      fullName: DISPLAY_NAME,
      isActive: true,
      subscriptionTier: 'pro',
      updatedAt: now,
    }, { merge: true });
  } else {
    console.log('🗄️  Creating Firestore user document…');
    await userDocRef.set({
      email: EMAIL,
      username: 'charlie',
      fullName: DISPLAY_NAME,
      isActive: true,
      subscriptionTier: 'pro',
      createdAt: now,
      updatedAt: now,
    });
  }
}

async function main() {
  try {
    const userRecord = await ensureAuthUser();
    await ensureFirestoreUser(userRecord.uid);

    console.log('\n✅ Charlie test user is ready!');
    console.log(`   Email:    ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log(`   UID:      ${userRecord.uid}`);
  } catch (error) {
    console.error('❌ Failed to create/update Charlie user:', error);
    process.exitCode = 1;
  }
}

main(); 