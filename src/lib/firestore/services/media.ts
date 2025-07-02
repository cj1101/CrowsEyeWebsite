import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FirestoreService } from '../base';
import { MediaDocument, COLLECTIONS } from '../types';
import { storage } from '../../firebase';

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

    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${userId}/${timestamp}-${sanitizedFilename}`;
    
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return { url, path };
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