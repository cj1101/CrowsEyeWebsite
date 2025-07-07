import admin from 'firebase-admin';
import 'server-only';

// This file should only be used on the server-side.
// It initializes the Firebase Admin SDK with service account credentials.

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_PRIVATE_KEY;
    if (!serviceAccountJson) {
      throw new Error('The FIREBASE_PRIVATE_KEY environment variable is not set. It should contain the full JSON of your service account key.');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log('Firebase Admin SDK initialized successfully (firebaseAdmin.ts).');

  } catch (error) {
    console.error('Firebase admin initialization error:', error.stack);
    // We throw the error to make it clear that initialization failed.
    throw new Error('Failed to initialize Firebase Admin SDK. Check your FIREBASE_PRIVATE_KEY variable.');
  }
}

export default admin;
