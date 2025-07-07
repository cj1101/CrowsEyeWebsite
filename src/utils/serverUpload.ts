export interface ServerUploadOptions {
  file: File;
  userId: string;
  folder?: string; // Defaults to 'media'
  onProgress?: (progressPercent: number) => void; // Optional progress callback
}

export interface ServerUploadResult {
  url: string;
  path: string;
  fileName: string;
  size: number;
}

/**
 * Upload a file using the server-side API route
 * This bypasses Firebase Auth requirements by using Firebase Admin SDK on the server
 */
export async function uploadFileViaServer(options: ServerUploadOptions): Promise<ServerUploadResult> {
  const {
    file,
    userId,
    folder = 'media',
    onProgress,
  } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  if (!userId) {
    throw new Error('User ID is required for server upload');
  }

  console.log('📤 Uploading via server API...', {
    fileName: file.name,
    fileSize: file.size,
    userId,
    folder,
  });

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  // Get your app's authentication token
  // This depends on how your app handles authentication
  const authToken = await getAppAuthToken(userId);
  
  if (!authToken) {
    throw new Error('Authentication token not available. Please sign in again.');
  }

  try {
    // Upload to server API
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    console.log('✅ Server upload successful:', result);
    
    return {
      url: result.url,
      path: result.path,
      fileName: result.fileName,
      size: result.size,
    };

  } catch (error: any) {
    console.error('❌ Server upload failed:', error);
    throw new Error(`Server upload failed: ${error.message}`);
  }
}

/**
 * Get your app's authentication token
 * This retrieves the JWT token from localStorage
 */
async function getAppAuthToken(userId: string): Promise<string | null> {
  // Get the JWT token from localStorage (set by the auth bridge service)
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.warn('⚠️ No authentication token found in localStorage');
    return null;
  }
  
  console.log('✅ Retrieved authentication token from localStorage');
  return token;
}

/**
 * Alternative upload function that tries server upload first, falls back to client upload
 */
export async function uploadFileWithFallback(options: ServerUploadOptions): Promise<ServerUploadResult> {
  try {
    // Try server upload first
    console.log('🔄 Attempting server upload...');
    return await uploadFileViaServer(options);
  } catch (serverError: any) {
    console.warn('⚠️ Server upload failed, trying client upload:', serverError.message);
    
    // Fall back to client upload (requires Firebase Auth)
    const { uploadFileToStorage } = await import('./storageUpload');
    
    try {
      const clientResult = await uploadFileToStorage({
        file: options.file,
        userId: options.userId,
        folder: options.folder,
        onProgress: options.onProgress,
      });
      
      return {
        url: clientResult.url,
        path: clientResult.path,
        fileName: options.file.name,
        size: options.file.size,
      };
    } catch (clientError: any) {
      console.error('❌ Both server and client upload failed');
      throw new Error(`Upload failed: Server error - ${serverError.message}, Client error - ${clientError.message}`);
    }
  }
} 