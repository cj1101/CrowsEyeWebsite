import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import type { User } from 'firebase/auth';
import { storage, auth } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';

export interface UploadToStorageOptions {
  file: File;
  userId?: string; // Defaults to current authenticated user
  folder?: string; // Defaults to 'media'
  maxRetries?: number; // Defaults to 3
  onProgress?: (progressPercent: number) => void; // Optional progress callback
}

export interface UploadToStorageResult {
  url: string;
  path: string;
}

// Sanitize filenames to avoid invalid characters for GCS paths
const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

// Exponential back-off helper
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Wait for auth state to be resolved
const waitForAuth = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!auth) {
      console.error('🚫 Firebase auth is not initialized');
      resolve(false);
      return;
    }

    if (auth.currentUser) {
      resolve(true);
      return;
    }

    // Wait for auth state to resolve
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      clearTimeout(timeoutId); // Clear the timeout
      unsubscribe();
      resolve(!!user);
    });

    // Timeout after 5 seconds
    const timeoutId = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, 5000);
  });
};

/**
 * Upload a file to Firebase Cloud Storage with automatic retries and progress updates.
 * Throws if storage is not initialized or if the user is not authenticated.
 */
export async function uploadFileToStorage(options: UploadToStorageOptions): Promise<UploadToStorageResult> {
  const {
    file,
    userId = auth?.currentUser?.uid,
    folder = 'media',
    maxRetries = 3,
    onProgress,
  } = options;

  // Comprehensive pre-flight checks
  if (!storage) {
    throw new Error('Cloud Storage is not initialized. Please check your Firebase configuration.');
  }
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  if (!file) {
    throw new Error('No file provided');
  }

  // Check if user is authenticated with Firebase Auth
  console.log('🔍 Checking Firebase Auth state...');
  
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user found. Please sign in and try again.');
  }

  const finalUserId = userId || currentUser.uid;
  if (!finalUserId) {
    throw new Error('Could not determine user ID for upload.');
  }

  console.log('✅ Authentication verified. User ID:', finalUserId);

  // Verify the user's ID token is still valid
  try {
    await currentUser.getIdToken(true); // Force refresh
    console.log('✅ User token verified and refreshed');
  } catch (tokenError) {
    console.error('❌ Token verification failed:', tokenError);
    throw new Error('Authentication token is invalid. Please sign in again.');
  }

  const timestamp = Date.now();
  const fileId = uuidv4();
  const safeName = sanitizeFilename(file.name);
  const fullPath = `${folder}/${finalUserId}/${timestamp}_${fileId}_${safeName}`;

  console.log('📤 Uploading to path:', fullPath);

  const attemptUpload = async (attempt: number): Promise<UploadToStorageResult> => {
    const metadata = {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        uploadedBy: finalUserId,
        originalName: file.name,
        uploadTimestamp: timestamp.toString(),
      },
    };

    const storageRef = ref(storage, fullPath);
    const task: UploadTask = uploadBytesResumable(storageRef, file, metadata);

    return new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(pct);
          }
        },
        async (error: any) => {
          console.error('🛑 Firebase Storage raw error object:', JSON.stringify(error, null, 2));
          
          // Enhanced error logging
          if (error?.serverResponse) {
            try {
              const parsed = JSON.parse(error.serverResponse);
              console.error('🛑 Firebase Storage error payload:', parsed);
            } catch {
              console.error('🛑 Firebase Storage raw error response:', error.serverResponse);
            }
          }

          // Log additional context
          console.error('🛑 Upload context:', {
            attempt: attempt + 1,
            maxRetries,
            userId: finalUserId,
            path: fullPath,
            fileName: file.name,
            fileSize: file.size,
            errorCode: error.code,
            errorMessage: error.message,
          });

          if (attempt < maxRetries) {
            const waitMs = 500 * Math.pow(2, attempt) + Math.random() * 500;
            console.warn(
              `⚠️ Upload attempt ${attempt + 1} failed (${error.code}). Retrying in ${waitMs}ms…`
            );
            await delay(waitMs);
            try {
              const result = await attemptUpload(attempt + 1);
              resolve(result);
            } catch (err) {
              reject(err);
            }
          } else {
            // Enhanced error messages
            let enhancedError = error;
            if (error.code === 'storage/unauthorized') {
              enhancedError = new Error(
                'Upload unauthorized. This could be due to: ' +
                '1) Storage security rules, ' +
                '2) Authentication issues, ' +
                '3) Incorrect bucket configuration. ' +
                'Please check your Firebase project settings and try signing in again.'
              );
              enhancedError.code = error.code;
            }
            reject(enhancedError);
          }
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            console.log('✅ Upload successful. Download URL obtained:', url);
            resolve({ url, path: fullPath });
          } catch (err) {
            console.error('❌ Failed to get download URL:', err);
            reject(err);
          }
        }
      );
    });
  };

  return attemptUpload(0);
} 