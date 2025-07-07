import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Guaranteed Singleton Pattern
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const originalGetStorage = getStorage;

const getStorageWithLogs = (app, bucketUrl) => {
  const finalBucketUrl = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || bucketUrl;
  console.log(`[Firebase Storage] Initializing with bucket URL: ${finalBucketUrl}`);
  
  try {
    const storageInstance = originalGetStorage(app, finalBucketUrl);
    console.log('[Firebase Storage] Successfully initialized.');
    return storageInstance;
  } catch (error) {
    console.error(`[Firebase Storage] Error initializing with bucket URL: ${finalBucketUrl}`, error);
    
    const fallbackBucketUrl = 'crows-eye-website.firebasestorage.app';
    console.warn(`[Firebase Storage] Falling back to default bucket URL: ${fallbackBucketUrl}`);
    try {
      const fallbackStorageInstance = originalGetStorage(app, fallbackBucketUrl);
      console.log('[Firebase Storage] Successfully initialized with fallback bucket.');
      return fallbackStorageInstance;
    } catch (fallbackError) {
      console.error(`[Firebase Storage] Error initializing with fallback bucket URL: ${fallbackBucketUrl}`, fallbackError);
      throw fallbackError; // Re-throw if fallback also fails
    }
  }
};

// Replace the original getStorage with the enhanced version
const storageWithLogs = getStorageWithLogs(app);
const googleProvider = new GoogleAuthProvider();

let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storageWithLogs as storage, googleProvider, analytics }; 