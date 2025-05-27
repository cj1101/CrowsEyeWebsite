import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration interface for type safety
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Get Firebase configuration from environment variables
const getFirebaseConfig = (): FirebaseConfig => {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
  };
};

// Check if we have a valid Firebase configuration
const isValidFirebaseConfig = (config: FirebaseConfig): boolean => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const demoValues = ['demo-api-key', 'demo-project.firebaseapp.com', 'demo-project', 'demo-project.appspot.com', '123456789', 'demo-app-id'];
  
  // Check if all required fields are present and not demo values
  return requiredFields.every(field => {
    const value = config[field as keyof FirebaseConfig];
    return value && typeof value === 'string' && value.trim() !== '' && !demoValues.includes(value);
  });
};

// Initialize Firebase app (idempotent)
const initializeFirebaseApp = (): FirebaseApp | null => {
  try {
    // Check if Firebase app is already initialized (idempotency)
    const existingApps = getApps();
    if (existingApps.length > 0) {
      console.log('🔄 Firebase app already initialized, reusing existing instance');
      return existingApps[0];
    }

    const config = getFirebaseConfig();
    const isValid = isValidFirebaseConfig(config);

    if (!isValid) {
      console.warn('⚠️ Firebase configuration incomplete or using demo values');
      console.warn('📋 Current config status:', {
        apiKey: config.apiKey.substring(0, 10) + '...',
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId.substring(0, 10) + '...',
        isValid
      });
      console.warn('🔧 Please set up your Firebase environment variables in .env.local');
      return null;
    }

    // Initialize Firebase app
    const app = initializeApp(config);
    console.log('✅ Firebase app initialized successfully');
    console.log('🔧 Firebase config loaded:', {
      projectId: config.projectId,
      authDomain: config.authDomain,
      environment: process.env.NODE_ENV
    });

    return app;
  } catch (error) {
    console.error('❌ Firebase app initialization failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
    }
    return null;
  }
};

// Initialize Firebase services
const initializeFirebaseServices = (app: FirebaseApp | null) => {
  if (!app) {
    console.log('🎭 Running in demo mode - Firebase services not available');
    return {
      auth: null,
      db: null,
      googleProvider: new GoogleAuthProvider()
    };
  }

  try {
    // Initialize Firebase Authentication
    const auth = getAuth(app);
    console.log('🔐 Firebase Authentication initialized');

    // Initialize Cloud Firestore
    const db = getFirestore(app);
    console.log('🗄️ Cloud Firestore initialized');

    // Configure Google Auth Provider
    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    console.log('🔍 Google Auth Provider configured');

    // Connect to emulators in development if needed
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('🧪 Connected to Firebase emulators');
      } catch (emulatorError) {
        console.warn('⚠️ Could not connect to Firebase emulators (this is normal if not running)');
      }
    }

    return { auth, db, googleProvider };
  } catch (error) {
    console.error('❌ Firebase services initialization failed:', error);
    return {
      auth: null,
      db: null,
      googleProvider: new GoogleAuthProvider()
    };
  }
};

// Initialize Firebase
const firebaseApp = initializeFirebaseApp();
const { auth, db, googleProvider } = initializeFirebaseServices(firebaseApp);

// Export Firebase services
export { auth, db, googleProvider };

// Export configuration status for debugging
export const isFirebaseConfigured = (): boolean => {
  return firebaseApp !== null;
};

// Export configuration details for debugging
export const getFirebaseDebugInfo = () => {
  const config = getFirebaseConfig();
  return {
    hasApp: !!firebaseApp,
    hasAuth: !!auth,
    hasDb: !!db,
    isConfigured: isFirebaseConfigured(),
    projectId: config.projectId,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
};

// Client-side debug logging
if (typeof window !== 'undefined') {
  console.log('🔧 Firebase Debug Info:', getFirebaseDebugInfo());
}

export default firebaseApp; 