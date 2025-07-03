import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration interface for type safety
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Robust environment variable checker
const getEnvVar = (name: string, fallback: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use window object for environment variables
    return (window as any).__ENV__?.[name] || process.env[name] || fallback;
  }
  // Server-side: use process.env
  return process.env[name] || fallback;
};

// Get Firebase configuration from environment variables with enhanced error handling
const getFirebaseConfig = (): FirebaseConfig => {
  // Prefer compile-time injected env vars (
  // process.env.NEXT_PUBLIC_*) when available (Next.js replaces these with
  // literal strings). Fallback to the dynamic helper for non-Next runtimes.
  const config: FirebaseConfig = {
    apiKey:
      (process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string | undefined) ||
      getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY', 'demo-api-key'),
    authDomain:
      (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string | undefined) ||
      getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'demo-project.firebaseapp.com'),
    projectId:
      (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string | undefined) ||
      getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'demo-project'),
    storageBucket:
      (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string | undefined) ||
      getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'demo-project.appspot.com'),
    messagingSenderId:
      (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string | undefined) ||
      getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', '123456789'),
    appId:
      (process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string | undefined) ||
      getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID', 'demo-app-id'),
  };

  // Log configuration status for debugging (without exposing sensitive data)
  if (typeof window !== 'undefined') {
    console.log('🔧 Firebase Config Debug:', {
      hasApiKey: !!config.apiKey && config.apiKey !== 'demo-api-key',
      authDomain: config.authDomain,
      projectId: config.projectId,
      environment: getEnvVar('NODE_ENV', 'production'),
    });
  }

  return config;
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

// Global variable to track initialization state
let firebaseInitialized = false;
let firebaseApp: FirebaseApp | null = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let googleProvider: GoogleAuthProvider | null = null;

// Initialize Firebase app (idempotent and cross-platform compatible)
const initializeFirebaseApp = (): FirebaseApp | null => {
  // Prevent multiple initializations
  if (firebaseInitialized && firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if Firebase app is already initialized (idempotency)
    const existingApps = getApps();
    if (existingApps.length > 0) {
      console.log('🔄 Firebase app already initialized, reusing existing instance');
      firebaseApp = existingApps[0];
      firebaseInitialized = true;
      return firebaseApp;
    }

    const config = getFirebaseConfig();
    const isValid = isValidFirebaseConfig(config);

    if (!isValid) {
      console.warn('⚠️ Firebase configuration incomplete or using demo values');
      console.warn('📋 Please set up your Firebase environment variables');
      console.warn('🔧 Initializing with demo config for development');
      
      // Initialize with demo config to prevent "no-app" errors
      firebaseApp = initializeApp(config, 'demo-app');
      firebaseInitialized = true;
      return firebaseApp;
    }

    // Initialize Firebase app
    firebaseApp = initializeApp(config);
    firebaseInitialized = true;
    
    console.log('✅ Firebase app initialized successfully');
    console.log('🔧 Firebase config loaded:', {
      projectId: config.projectId,
      authDomain: config.authDomain,
      environment: getEnvVar('NODE_ENV', 'production')
    });

    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase app initialization failed:', error);
    firebaseInitialized = true; // Prevent retry loops
    
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
    }
    
    // Try to initialize with minimal config to prevent "no-app" errors
    try {
      const fallbackConfig = {
        apiKey: 'demo-api-key',
        authDomain: 'demo-project.firebaseapp.com',
        projectId: 'demo-project',
        storageBucket: 'demo-project.appspot.com',
        messagingSenderId: '123456789',
        appId: 'demo-app-id',
      };
      firebaseApp = initializeApp(fallbackConfig, 'fallback-app');
      console.log('🎭 Initialized Firebase with fallback configuration');
      return firebaseApp;
    } catch (fallbackError) {
      console.error('❌ Fallback Firebase initialization also failed:', fallbackError);
      return null;
    }
  }
};

// Initialize Firebase services with enhanced error handling
const initializeFirebaseServices = (app: FirebaseApp | null) => {
  if (!app) {
    console.log('🎭 Running in demo mode - Firebase services not available');
    return {
      auth: null,
      db: null,
      storage: null,
      googleProvider: null
    };
  }

  try {
    // Initialize Firebase Authentication
    if (!auth) {
      auth = getAuth(app);
      console.log('🔐 Firebase Authentication initialized');
    }

    // Initialize Google Auth Provider
    if (!googleProvider) {
      googleProvider = new GoogleAuthProvider();
      // Add scopes if needed
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      console.log('🔍 Google Auth Provider initialized');
    }

    // Initialize Cloud Firestore
    if (!db) {
      db = getFirestore(app);
      console.log('🗄️ Cloud Firestore initialized');
    }

    // Initialize Cloud Storage
    if (!storage) {
      storage = getStorage(app);
      console.log('📦 Cloud Storage initialized');
    }

    // Connect to emulators in development if needed (only if explicitly enabled)
    const useEmulator = getEnvVar('NEXT_PUBLIC_USE_FIREBASE_EMULATOR') === 'true';
    const isDevelopment = getEnvVar('NODE_ENV') === 'development';
    
    if (isDevelopment && useEmulator && typeof window !== 'undefined') {
      try {
        // Only connect if not already connected
        if (!auth._delegate._config.emulator) {
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        }
        if (!db._delegate._databaseId.database.includes('localhost')) {
          connectFirestoreEmulator(db, 'localhost', 8080);
        }
        if (!storage._delegate._bucket.includes('localhost')) {
          connectStorageEmulator(storage, 'localhost', 9199);
        }
        console.log('🧪 Connected to Firebase emulators');
      } catch (emulatorError) {
        console.warn('⚠️ Could not connect to Firebase emulators (this is normal if not running)');
      }
    }

    return { auth, db, storage, googleProvider };
  } catch (error) {
    console.error('❌ Firebase services initialization failed:', error);
    return {
      auth: null,
      db: null,
      storage: null,
      googleProvider: null
    };
  }
};

// Initialize Firebase on first import (safe for both server and client)
try {
  firebaseApp = initializeFirebaseApp();
  const services = initializeFirebaseServices(firebaseApp);
  auth = services.auth;
  db = services.db;
  storage = services.storage;
  googleProvider = services.googleProvider;
} catch (error) {
  console.error('❌ Failed to initialize Firebase on import:', error);
  firebaseApp = null;
  auth = null;
  db = null;
  storage = null;
  googleProvider = null;
}

// Export Firebase services
export { auth, db, storage, googleProvider };

// Export configuration status for debugging
export const isFirebaseConfigured = (): boolean => {
  return firebaseApp !== null && auth !== null && db !== null;
};

// Export configuration details for debugging
export const getFirebaseDebugInfo = () => {
  const config = getFirebaseConfig();
  return {
    hasApp: !!firebaseApp,
    hasAuth: !!auth,
    hasDb: !!db,
    hasStorage: !!storage,
    hasGoogleProvider: !!googleProvider,
    isConfigured: isFirebaseConfigured(),
    projectId: config.projectId,
    environment: getEnvVar('NODE_ENV', 'production'),
    timestamp: new Date().toISOString(),
    initialized: firebaseInitialized
  };
};

// Client-side debug logging (safe check)
if (typeof window !== 'undefined') {
  // Delay debug info to allow proper initialization
  setTimeout(() => {
    console.log('🔧 Firebase Debug Info:', getFirebaseDebugInfo());
  }, 100);
}

export default firebaseApp; 