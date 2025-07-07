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

    const serviceAccountJson = process.env.FIREBASE_PRIVATE_KEY;
    if (!serviceAccountJson) {
      throw new Error('The FIREBASE_PRIVATE_KEY environment variable is not set. It should contain the full JSON of your service account key.');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    console.log('🔑 Initializing Firebase Admin with service account from FIREBASE_PRIVATE_KEY (firebase-admin.ts)');
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

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