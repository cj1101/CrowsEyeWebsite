import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App | null = null;

// Initialize Firebase Admin SDK
function getFirebaseAdmin(): App {
  if (adminApp) {
    return adminApp;
  }

  try {
    // Check if already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0];
      return adminApp;
    }

    // Initialize with service account credentials from environment
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccount) {
      console.log('🔑 Initializing Firebase Admin with service account');
      const credentials = JSON.parse(serviceAccount);
      
      adminApp = initializeApp({
        credential: cert(credentials),
        projectId: credentials.project_id
      });
    } else {
      // Use default credentials (for Google Cloud environments)
      console.log('🔑 Initializing Firebase Admin with default credentials');
      adminApp = initializeApp();
    }

    console.log('✅ Firebase Admin SDK initialized successfully');
    return adminApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

// Get access token for Google Cloud APIs using Firebase Admin
export async function getGoogleCloudAccessToken(): Promise<string> {
  try {
    const app = getFirebaseAdmin();
    const auth = getAuth(app);
    
    // Get the service account access token
    const accessToken = await auth.app.options.credential?.getAccessToken();
    
    if (!accessToken?.access_token) {
      throw new Error('No access token received from Firebase Admin');
    }

    console.log('✅ Successfully obtained access token via Firebase Admin');
    return accessToken.access_token;
  } catch (error) {
    console.error('❌ Failed to get access token via Firebase Admin:', error);
    throw error;
  }
}

export { getFirebaseAdmin }; 