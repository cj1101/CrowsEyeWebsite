import { auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface FirebaseDebugInfo {
  timestamp: string;
  setup: {
    success: boolean;
    errors: string[];
    info: {
      auth: {
        isAuthenticated: boolean;
        userId?: string;
        email?: string;
      };
      storage: {
        isInitialized: boolean;
        bucket?: string;
      };
      configuration: {
        projectId?: string;
        authDomain?: string;
        storageBucket?: string;
        environmentSource: string;
        actualBucketFromConfig?: string;
      };
    };
  };
  upload?: {
    success: boolean;
    message: string;
    details?: any;
  };
  environment: {
    url: string;
    userAgent: string;
  };
}

// Test Firebase configuration and permissions
export async function testFirebaseSetup(): Promise<{
  success: boolean;
  info: FirebaseDebugInfo;
  errors: string[];
}> {
  const errors: string[] = [];
  
  // Test auth initialization
  const authInfo = {
    isInitialized: !!auth,
    currentUser: null as any,
    isAuthenticated: false,
  };

  if (auth) {
    authInfo.currentUser = auth.currentUser;
    authInfo.isAuthenticated = !!auth.currentUser;
  } else {
    errors.push('Firebase Auth is not initialized');
  }

  // Test storage initialization
  const storageInfo = {
    isInitialized: !!storage,
    bucket: null as string | null,
  };

  if (storage) {
    try {
      storageInfo.bucket = storage.app.options.storageBucket || null;
    } catch (error) {
      errors.push(`Could not get storage bucket info: ${error}`);
    }
  } else {
    errors.push('Firebase Storage is not initialized');
  }

  // Get configuration info
  const configInfo = {
    projectId: storage?.app.options.projectId || null,
    storageBucket: storage?.app.options.storageBucket || null,
  };

  // Construct minimal info object without strict typing to avoid interface mismatch
  const info = {
    auth: authInfo,
    storage: storageInfo,
    configuration: configInfo,
  } as any;

  return {
    success: errors.length === 0,
    info,
    errors,
  };
}

// Test file upload permissions
export async function testUploadPermissions(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    if (!auth?.currentUser) {
      return {
        success: false,
        message: 'No authenticated user found',
        details: { errorCode: 'auth/no-user' }
      };
    }

    if (!storage) {
      return {
        success: false,
        message: 'Storage not initialized',
        details: { errorCode: 'storage/not-initialized' }
      };
    }

    const user = auth.currentUser;
    const testFileName = `test_${Date.now()}.txt`;
    const testPath = `media/${user.uid}/${testFileName}`;
    const testData = new Blob(['Firebase upload test'], { type: 'text/plain' });

    console.log('📤 Testing upload to path:', testPath);
    console.log('🪣 Using storage bucket:', storage.app.options.storageBucket);

    // Attempt upload
    const testRef = ref(storage, testPath);
    await uploadBytes(testRef, testData);
    
    console.log('✅ Test upload successful, cleaning up...');
    
    // Clean up test file
    try {
      await deleteObject(testRef);
      console.log('🧹 Test file cleaned up successfully');
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean up test file (non-critical):', cleanupError);
    }

    return {
      success: true,
      message: 'Upload test passed successfully',
      details: { 
        testPath,
        userId: user.uid,
        bucket: storage.app.options.storageBucket
      }
    };
  } catch (error: any) {
    console.error('❌ Upload test failed:', error);
    
    const errorDetails = {
      errorCode: error.code || 'unknown',
      errorMessage: error.message || 'Unknown error',
      userId: auth?.currentUser?.uid
    };

    let message = 'Upload test failed: ';
    if (error.code === 'storage/unauthorized') {
      message += 'Unauthorized access. This could be due to storage rules or authentication issues.';
    } else if (error.code === 'storage/quota-exceeded') {
      message += 'Storage quota exceeded.';
    } else if (error.code === 'storage/invalid-format') {
      message += 'Invalid file format.';
    } else {
      message += error.message || 'Unknown error occurred.';
    }

    return {
      success: false,
      message,
      details: errorDetails
    };
  }
}

// Get comprehensive Firebase debug information
export async function getFirebaseDebugInfo(): Promise<FirebaseDebugInfo> {
  try {
    // Enhanced environment variable detection
    const getEnvVar = (name: string) => {
      if (typeof window !== 'undefined') {
        // Client-side detection
        const fromWindow = (window as any).__ENV__?.[name];
        const fromProcessEnv = process.env[name];
        console.log(`🔍 Environment variable ${name}:`, {
          fromWindow,
          fromProcessEnv,
          used: fromWindow || fromProcessEnv
        });
        return fromWindow || fromProcessEnv;
      }
      return process.env[name];
    };

    // Get configuration details with source tracking
    const apiKey = getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY');
    const authDomain = getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
    const projectId = getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    const storageBucket = getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
    const messagingSenderId = getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
    const appId = getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID');

    // Log the storage bucket configuration in detail
    console.log('🪣 Storage Bucket Configuration:', {
      fromEnvironment: storageBucket,
      expectedFormat: 'crows-eye-website.firebasestorage.app',
      isCorrectFormat: storageBucket?.endsWith('.firebasestorage.app'),
      fallbackFormat: 'crows-eye-website.firebasestorage.app'
    });

    // Initialize debug info structure
    const debugInfo: FirebaseDebugInfo = {
      timestamp: new Date().toISOString(),
      setup: {
        success: false,
        errors: [],
        info: {
          auth: { isAuthenticated: false },
          storage: { isInitialized: false },
          configuration: {
            projectId,
            authDomain,
            storageBucket,
            environmentSource: typeof window !== 'undefined' ? 'client' : 'server',
            actualBucketFromConfig: storageBucket
          }
        }
      },
      environment: {
        url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A'
      }
    };

    // Check Auth
    if (auth) {
      const user = auth.currentUser;
      debugInfo.setup.info.auth = {
        isAuthenticated: !!user,
        userId: user?.uid,
        email: user?.email || undefined
      };
      console.log('🔐 Auth status:', debugInfo.setup.info.auth);
    } else {
      debugInfo.setup.errors.push('Firebase Auth not initialized');
    }

    // Check Storage with enhanced bucket info
    if (storage) {
      debugInfo.setup.info.storage = {
        isInitialized: true,
        bucket: storage.app.options.storageBucket
      };
      
      // Log detailed storage information
      console.log('🗄️ Storage configuration:', {
        isInitialized: true,
        configuredBucket: storage.app.options.storageBucket,
        environmentBucket: storageBucket,
        bucketsMatch: storage.app.options.storageBucket === storageBucket
      });

      if (storage.app.options.storageBucket !== storageBucket) {
        debugInfo.setup.errors.push(`Storage bucket mismatch: configured=${storage.app.options.storageBucket}, environment=${storageBucket}`);
      }
    } else {
      debugInfo.setup.errors.push('Firebase Storage not initialized');
    }

    // Test upload permissions if authenticated
    if (auth?.currentUser && storage) {
      console.log('🧪 Testing upload permissions...');
      debugInfo.upload = await testUploadPermissions();
    }

    debugInfo.setup.success = debugInfo.setup.errors.length === 0;
    
    // Log complete debug info
    console.log('🔍 Complete Firebase Debug Info:', debugInfo);
    
    return debugInfo;
  } catch (error) {
    console.error('❌ Debug info generation failed:', error);
    
    return {
      timestamp: new Date().toISOString(),
      setup: {
        success: false,
        errors: [`Debug failed: ${error}`],
        info: {
          auth: { isAuthenticated: false },
          storage: { isInitialized: false },
          configuration: {
            environmentSource: 'error'
          }
        }
      },
      environment: {
        url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A'
      }
    };
  }
}

// Expose helper in browser for quick console access
if (typeof window !== 'undefined') {
  (window as any).getFirebaseDebugInfo = getFirebaseDebugInfo;
} 