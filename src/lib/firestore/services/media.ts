import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FirestoreService } from '../base';
import { MediaDocument, COLLECTIONS } from '../types';
import { storage, auth } from '../../firebase';

export class MediaService {
  private static collection = COLLECTIONS.MEDIA;

  // Upload file to Cloud Storage
  static async uploadFile(
    userId: string,
    file: File,
    folder: string = 'media'
  ): Promise<{ url: string; path: string }> {
    if (!storage) {
      throw new Error('Cloud Storage is not initialized');
    }

    // Validate file before upload
    if (!file || file.size === 0) {
      throw new Error('Invalid file: File is empty or corrupted');
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error('File too large: Maximum file size is 100MB');
    }

    console.log('📤 Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId,
      lastModified: file.lastModified
    });

    // Check authentication status
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      console.error('❌ No authenticated user found');
      throw new Error('Upload failed: You must be signed in to upload files');
    }

    // Log auth token status
    const token = await currentUser.getIdToken(true).catch((e: any) => {
      console.error('❌ Failed to get auth token:', e);
      return null;
    });
    
    console.log('🔐 Auth status:', {
      uid: currentUser.uid,
      email: currentUser.email,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenExpiry: token ? 'valid' : 'invalid'
    });

    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${userId}/${timestamp}-${sanitizedFilename}`;
    
    console.log('📂 Upload path:', path);
    console.log('🔒 Storage bucket:', storage.app.options.storageBucket);
    
    try {
      const storageRef = ref(storage, path);
      console.log('🚀 Uploading to Firebase Storage...');
      console.log('📦 Storage ref details:', {
        bucket: storageRef.bucket,
        fullPath: storageRef.fullPath,
        name: storageRef.name,
        root: storageRef.root.toString()
      });
      
      // Add metadata for proper content type handling
      const metadata = {
        contentType: file.type || 'application/octet-stream',
        cacheControl: 'public, max-age=31536000',
        customMetadata: {
          uploadedBy: userId,
          originalName: file.name,
          uploadTimestamp: timestamp.toString(),
          fileSize: file.size.toString()
        }
      };
      
      console.log('📋 Upload metadata:', metadata);
      
      const snapshot = await uploadBytes(storageRef, file, metadata);
      console.log('✅ Upload successful, getting download URL...');
      console.log('📊 Upload snapshot:', {
        bytesTransferred: snapshot.metadata.size,
        contentType: snapshot.metadata.contentType,
        fullPath: snapshot.metadata.fullPath
      });
      
      const url = await getDownloadURL(snapshot.ref);
      console.log('🔗 Download URL obtained:', url);

      return { url, path };
    } catch (error: any) {
      console.error('❌ Upload failed with error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        customData: error.customData,
        serverResponse: error.serverResponse,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 5).join('\n')
      });
      
      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('Upload failed: You are not authorized to upload files. Please sign in again.');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Upload failed: Storage quota exceeded. Please free up space or upgrade your plan.');
      } else if (error.code === 'storage/unknown' && error.serverResponse === '') {
        throw new Error('Upload failed: This is likely a CORS or authentication issue. Please make sure you are signed in and try again.');
      } else if (error.message?.includes('CORS')) {
        throw new Error('Upload failed: CORS configuration issue. Please try again in a few minutes.');
      } else if (error.message?.includes('400')) {
        throw new Error('Upload failed: Bad request. This might be a file format issue or temporary server problem.');
      } else {
        throw new Error(`Upload failed: ${error.message || 'Unknown error occurred'}`);
      }
    }
  }

  // Delete file from Cloud Storage
  static async deleteFile(path: string): Promise<void> {
    if (!storage) {
      throw new Error('Cloud Storage is not initialized');
    }

    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw - file might already be deleted
    }
  }

  // Create media item
  static async createMedia(
    data: Omit<MediaDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MediaDocument> {
    return FirestoreService.create<MediaDocument>(this.collection, { ...data } as MediaDocument);
  }

  // Get media item by ID
  static async getMedia(mediaId: string): Promise<MediaDocument | null> {
    return FirestoreService.get<MediaDocument>(this.collection, mediaId);
  }

  // Update media item
  static async updateMedia(mediaId: string, data: Partial<MediaDocument>): Promise<void> {
    return FirestoreService.update(this.collection, mediaId, data);
  }

  // Delete media item (also deletes from storage)
  static async deleteMedia(mediaId: string): Promise<void> {
    const media = await this.getMedia(mediaId);
    if (!media) return;

    // Delete from storage
    await this.deleteFile(media.gcsPath);
    if (media.thumbnailPath) {
      await this.deleteFile(media.thumbnailPath);
    }

    // Delete from Firestore
    return FirestoreService.delete(this.collection, mediaId);
  }

  // List user's media
  static async listUserMedia(
    userId: string,
    options: {
      mediaType?: MediaDocument['mediaType'];
      status?: MediaDocument['status'];
      limit?: number;
      startAfterId?: string;
    } = {}
  ): Promise<{ data: MediaDocument[]; lastDoc: string | null }> {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];

    if (options.mediaType) {
      constraints.push(where('mediaType', '==', options.mediaType));
    }

    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }

    constraints.push(orderBy('uploadDate', 'desc'));

    return FirestoreService.list<MediaDocument>(this.collection, {
      userId,
      orderByField: 'uploadDate',
      orderDirection: 'desc',
      limitCount: options.limit || 20,
      startAfterId: options.startAfterId,
    });
  }

  // Upload media with metadata
  static async uploadMedia(
    userId: string,
    file: File,
    metadata: Partial<MediaDocument>
  ): Promise<MediaDocument> {
    // Upload file to storage
    const { url, path } = await this.uploadFile(userId, file);

    // Create media document
    const mediaData: Omit<MediaDocument, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      filename: file.name,
      originalFilename: file.name,
      gcsPath: path,
      mediaType: file.type.startsWith('image/') ? 'image' : 
                 file.type.startsWith('video/') ? 'video' : 'audio',
      fileSize: file.size,
      isPostReady: false,
      status: 'draft',
      uploadDate: new Date(),
      ...metadata,
    };

    return this.createMedia(mediaData);
  }

  // Generate thumbnail for video
  static async generateVideoThumbnail(
    videoUrl: string,
    time: number = 1
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.crossOrigin = 'anonymous';
      video.currentTime = time;

      video.addEventListener('loadeddata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        }, 'image/jpeg');
      });

      video.addEventListener('error', reject);
      video.src = videoUrl;
    });
  }

  // Get media by Google Photos ID
  static async getMediaByGooglePhotosId(
    userId: string,
    googlePhotosId: string
  ): Promise<MediaDocument | null> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('googlePhotosId', '==', googlePhotosId),
    ];

    const results = await FirestoreService.query<MediaDocument>(this.collection, constraints);
    return results.length > 0 ? results[0] : null;
  }

  // Batch update media items
  static async batchUpdateMedia(
    updates: Array<{ id: string; data: Partial<MediaDocument> }>
  ): Promise<void> {
    return FirestoreService.batchUpdate(this.collection, updates);
  }

  // Mark media as post-ready
  static async markAsPostReady(mediaId: string): Promise<void> {
    return this.updateMedia(mediaId, { isPostReady: true });
  }

  // Update media platforms
  static async updatePlatforms(mediaId: string, platforms: string[]): Promise<void> {
    return this.updateMedia(mediaId, { platforms });
  }

  // Search media by tags
  static async searchByTags(
    userId: string,
    tags: string[]
  ): Promise<MediaDocument[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('aiTags', 'array-contains-any', tags),
      orderBy('uploadDate', 'desc'),
    ];

    return FirestoreService.query<MediaDocument>(this.collection, constraints);
  }
} 