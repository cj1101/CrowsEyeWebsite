import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  StorageReference,
  UploadTaskSnapshot
} from 'firebase/storage';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { firebaseAuthService } from './firebase-auth';

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  size: number;
  createdAt: string;
  tags: string[];
  // Additional metadata
  filename?: string;
  file_size?: number;
  width?: number;
  height?: number;
  duration?: number;
  caption?: string;
  ai_tags?: string[];
  is_post_ready?: boolean;
  upload_date?: string;
  user_id?: string;
  description?: string;
  status?: 'draft' | 'completed' | 'published' | 'processing';
  post_metadata?: any;
}

export interface Gallery {
  id: string;
  title: string;
  images: string[];
  createdAt: string;
  user_id: string;
  description?: string;
}

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

const storage = getStorage(app);
const db = getFirestore(app);

// Helper function to get file type from MIME type
const getFileType = (mimeType: string): 'image' | 'video' | 'audio' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'image'; // default
};

// Generate unique filename
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
};

export class FirebaseStorageService {
  // Upload media file
  async uploadMedia(
    file: File,
    tags: string[] = [],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; mediaItem?: MediaItem; error?: string }> {
    try {
      const currentUser = await firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const filename = generateUniqueFilename(file.name);
      const storageRef = ref(storage, `media/${currentUser.id}/${filename}`);

      // Start upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes
              });
            }
          },
          (error) => {
            console.error('Upload error:', error);
            resolve({ success: false, error: error.message });
          },
          async () => {
            try {
              // Upload completed successfully
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Create media item metadata
              const mediaItem: MediaItem = {
                id: doc(collection(db, 'media')).id,
                name: file.name,
                type: getFileType(file.type),
                url: downloadURL,
                size: file.size,
                createdAt: new Date().toISOString(),
                tags,
                filename: filename,
                file_size: file.size,
                user_id: currentUser.id,
                status: 'completed',
                upload_date: new Date().toISOString(),
                is_post_ready: true,
              };

              // Save metadata to Firestore
              await setDoc(doc(db, 'media', mediaItem.id), {
                ...mediaItem,
                created_at: Timestamp.fromDate(new Date()),
              });

              resolve({ success: true, mediaItem });
            } catch (error: any) {
              console.error('Error saving media metadata:', error);
              resolve({ success: false, error: error.message });
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Upload media error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get media library for current user
  async getMediaLibrary(): Promise<{ success: boolean; media?: MediaItem[]; error?: string }> {
    try {
      const currentUser = await firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const mediaQuery = query(
        collection(db, 'media'),
        where('user_id', '==', currentUser.id),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(mediaQuery);
      const media: MediaItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        media.push({
          ...data,
          id: doc.id,
          createdAt: data.created_at?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        } as MediaItem);
      });

      return { success: true, media };
    } catch (error: any) {
      console.error('Get media library error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete media item
  async deleteMedia(mediaId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get media item to get storage path
      const mediaDoc = await getDoc(doc(db, 'media', mediaId));
      if (!mediaDoc.exists()) {
        return { success: false, error: 'Media item not found' };
      }

      const mediaData = mediaDoc.data();
      
      // Verify ownership
      if (mediaData.user_id !== currentUser.id) {
        return { success: false, error: 'Not authorized to delete this media' };
      }

      // Delete from storage
      if (mediaData.filename) {
        const storageRef = ref(storage, `media/${currentUser.id}/${mediaData.filename}`);
        await deleteObject(storageRef);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'media', mediaId));

      return { success: true };
    } catch (error: any) {
      console.error('Delete media error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search media
  async searchMedia(searchQuery: string): Promise<{ success: boolean; media?: MediaItem[]; error?: string }> {
    try {
      const currentUser = await firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get all user's media (Firestore doesn't support text search natively)
      const mediaQuery = query(
        collection(db, 'media'),
        where('user_id', '==', currentUser.id)
      );

      const querySnapshot = await getDocs(mediaQuery);
      const allMedia: MediaItem[] = [];

              querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          allMedia.push({
            ...data,
            id: doc.id,
            createdAt: data.created_at?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          } as MediaItem);
        });

      // Filter by query (simple text search)
      const filteredMedia = allMedia.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      return { success: true, media: filteredMedia };
    } catch (error: any) {
      console.error('Search media error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create gallery
  async createGallery(title: string, description?: string): Promise<{ success: boolean; gallery?: Gallery; error?: string }> {
    try {
      const currentUser = await firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const galleryId = doc(collection(db, 'galleries')).id;
      const gallery: Gallery = {
        id: galleryId,
        title,
        images: [],
        createdAt: new Date().toISOString(),
        user_id: currentUser.id,
        description,
      };

      await setDoc(doc(db, 'galleries', galleryId), {
        ...gallery,
        created_at: Timestamp.fromDate(new Date()),
      });

      return { success: true, gallery };
    } catch (error: any) {
      console.error('Create gallery error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get galleries
  async getGalleries(): Promise<{ success: boolean; galleries?: Gallery[]; error?: string }> {
    try {
      const currentUser = await firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const galleriesQuery = query(
        collection(db, 'galleries'),
        where('user_id', '==', currentUser.id),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(galleriesQuery);
      const galleries: Gallery[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        galleries.push({
          ...data,
          id: doc.id,
          createdAt: data.created_at?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        } as Gallery);
      });

      return { success: true, galleries };
    } catch (error: any) {
      console.error('Get galleries error:', error);
      return { success: false, error: error.message };
    }
  }

  // Add media to gallery
  async addMediaToGallery(galleryId: string, mediaIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const galleryDoc = await getDoc(doc(db, 'galleries', galleryId));
      if (!galleryDoc.exists()) {
        return { success: false, error: 'Gallery not found' };
      }

      const galleryData = galleryDoc.data() as any;
      if (galleryData.user_id !== currentUser.id) {
        return { success: false, error: 'Not authorized to modify this gallery' };
      }

      const currentImages = galleryData.images || [];
      const updatedImages = [...new Set([...currentImages, ...mediaIds])]; // Remove duplicates

      await updateDoc(doc(db, 'galleries', galleryId), {
        images: updatedImages,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Add media to gallery error:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove media from gallery
  async removeMediaFromGallery(galleryId: string, mediaIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const galleryDoc = await getDoc(doc(db, 'galleries', galleryId));
      if (!galleryDoc.exists()) {
        return { success: false, error: 'Gallery not found' };
      }

      const galleryData = galleryDoc.data() as any;
      if (galleryData.user_id !== currentUser.id) {
        return { success: false, error: 'Not authorized to modify this gallery' };
      }

      const currentImages = galleryData.images || [];
      const updatedImages = currentImages.filter((id: string) => !mediaIds.includes(id));

      await updateDoc(doc(db, 'galleries', galleryId), {
        images: updatedImages,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Remove media from gallery error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get media item by ID
  async getMediaItem(mediaId: string): Promise<{ success: boolean; mediaItem?: MediaItem; error?: string }> {
    try {
      const mediaDoc = await getDoc(doc(db, 'media', mediaId));
      if (!mediaDoc.exists()) {
        return { success: false, error: 'Media item not found' };
      }

      const data = mediaDoc.data() as any;
      const mediaItem: MediaItem = {
        ...data,
        id: mediaDoc.id,
        createdAt: data.created_at?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
      } as MediaItem;

      return { success: true, mediaItem };
    } catch (error: any) {
      console.error('Get media item error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const firebaseStorageService = new FirebaseStorageService(); 