import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
};

// Check if we have a valid Firebase configuration
const isValidConfig = firebaseConfig.apiKey !== 'demo-api-key' && 
                     firebaseConfig.projectId !== 'demo-project';

// Initialize Firebase only if we have valid config
let app: FirebaseApp | null = null;
try {
  if (isValidConfig) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase not configured - using demo configuration. Please set up your Firebase environment variables.');
    console.log('Current config:', {
      apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = app ? getAuth(app) : null;

// Initialize Cloud Firestore and get a reference to the service
export const db = app ? getFirestore(app) : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Add debugging information
if (typeof window !== 'undefined') {
  console.log('🔧 Firebase Debug Info:', {
    hasApp: !!app,
    hasAuth: !!auth,
    hasDb: !!db,
    isValidConfig,
    environment: process.env.NODE_ENV
  });
}

export default app; 