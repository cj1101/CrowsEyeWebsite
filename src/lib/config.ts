// Centralized configuration for cross-platform compatibility

// Helper function to safely get environment variables
export const getEnvVar = (name: string, fallback: string = ''): string => {
  // Check for Next.js runtime environment variables first
  if (typeof window !== 'undefined') {
    // Client-side: check window object for runtime env vars
    return (window as any).__ENV__?.[name] || process.env[name] || fallback;
  }
  // Server-side: use process.env
  return process.env[name] || fallback;
};

// Environment detection
export const isProduction = () => getEnvVar('NODE_ENV', 'production') === 'production';
export const isDevelopment = () => getEnvVar('NODE_ENV', 'production') === 'development';
export const isClient = () => typeof window !== 'undefined';
export const isServer = () => typeof window === 'undefined';

// Firebase Configuration
export const firebaseConfig = {
  apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

// API Configuration
export const apiConfig = {
  baseUrl: getEnvVar('NEXT_PUBLIC_API_URL') || (
    isProduction() 
      ? 'https://us-central1-crows-eye-website.cloudfunctions.net'
      : 'http://localhost:5001/crows-eye-website/us-central1'
  ),
  timeout: 10000,
  retries: 3,
};

// App Configuration
export const appConfig = {
  name: 'Crows Eye',
  description: 'AI-Powered Marketing Automation for Visionary Creators',
  version: '1.0.0',
  supportEmail: 'help@crowseye.tech',
  domain: isProduction() ? 'https://crowseyeapp.com' : 'http://localhost:3000',
};

// Feature Flags
export const features = {
  enableFirebaseEmulator: getEnvVar('NEXT_PUBLIC_USE_FIREBASE_EMULATOR') === 'true' && isDevelopment(),
  enableAnalytics: isProduction(),
  enableErrorReporting: isProduction(),
  enableMockData: isDevelopment(),
};

// Debug configuration status
export const getConfigDebug = () => {
  if (!isDevelopment()) return null;
  
  return {
    environment: getEnvVar('NODE_ENV', 'production'),
    isClient: isClient(),
    isServer: isServer(),
    firebase: {
      hasApiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== '',
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    },
    api: {
      baseUrl: apiConfig.baseUrl,
      timeout: apiConfig.timeout,
    },
    features,
    timestamp: new Date().toISOString(),
  };
};

// Log configuration in development
if (isDevelopment() && isClient()) {
  console.log('🔧 App Configuration:', getConfigDebug());
}

export default {
  firebase: firebaseConfig,
  api: apiConfig,
  app: appConfig,
  features,
  getEnvVar,
  isProduction,
  isDevelopment,
  isClient,
  isServer,
  getConfigDebug,
}; 