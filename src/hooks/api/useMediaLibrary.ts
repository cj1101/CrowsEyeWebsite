import { useState, useEffect, useCallback } from 'react';
import { MediaService, GalleryService } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import type { MediaDocument } from '@/lib/firestore/types';
import type { MediaItem } from '@/types/api';
import { MediaConversions } from '@/types/api';
import { waitForAuth } from '@/utils/waitForAuth';

// Gallery interface for frontend use
export interface Gallery {
  id: string;
  name: string;
  caption?: string;
  createdAt: string;
  mediaItems: MediaItem[];
  // Backend fields
  created_date?: string;
  user_id?: string;
}

// Utility – safely normalize any value into a hashtag-prefixed string.
// • Converts numbers/booleans/etc. to strings.
// • Trims surrounding whitespace.
// • Adds leading '#' if missing.
// • Returns null for nullish / empty values so callers can filter them out.
const normalizeTag = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;
  return str.startsWith('#') ? str : `#${str}`;
};

// Transform Firestore document to MediaItem using unified conversion utility
const transformMediaItem = (mediaDoc: MediaDocument): MediaItem => {
  return MediaConversions.documentToItem(mediaDoc);
};

// Transform Firestore document to MediaItem with authenticated URLs
const transformMediaItemAsync = async (mediaDoc: MediaDocument): Promise<MediaItem> => {
  return MediaConversions.documentToItemAsync(mediaDoc);
};

export const useMediaLibrary = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await waitForAuth();
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const { data } = await MediaService.listUserMedia(user.uid);
      
      // Use async conversion to get authenticated URLs
      const mediaItems = await Promise.all(
        data.map(transformMediaItemAsync)
      );
      
      setMedia(mediaItems);
    } catch (error: any) {
      console.error('Failed to fetch media:', error);
      setError(error.message || 'Failed to fetch media');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize to prevent identity change on each render which caused repeated useEffect executions
  const fetchGalleries = useCallback(async () => {
    try {
      console.log('🔍 Fetching galleries from Firestore...');
      
      const user = auth.currentUser;
      if (!user) {
        console.error('❌ No authenticated user found for galleries');
        setGalleries([]);
        return;
      }
      
      try {
        const response = await GalleryService.listUserGalleries(user.uid);
        const galleryDocs = response.data || [];
        
        if (galleryDocs.length > 0) {
          // Fetch media items for each gallery
          const galleryData: Gallery[] = await Promise.all(
            galleryDocs.map(async (galleryDoc) => {
              // Fetch media items for this gallery
              const mediaItems: MediaItem[] = [];
              
              if (galleryDoc.mediaIds && galleryDoc.mediaIds.length > 0) {
                const mediaPromises = galleryDoc.mediaIds.map(async (mediaId) => {
                  try {
                    const mediaDoc = await MediaService.getMedia(mediaId);
                    return mediaDoc ? await transformMediaItemAsync(mediaDoc) : null;
                  } catch (error) {
                    console.warn(`Failed to fetch media ${mediaId}:`, error);
                    return null;
                  }
                });
                
                const mediaResults = await Promise.all(mediaPromises);
                mediaItems.push(...mediaResults.filter((item): item is MediaItem => item !== null));
              }
              
              return {
                id: galleryDoc.id || '',
                name: galleryDoc.name,
                caption: galleryDoc.caption,
                createdAt: galleryDoc.createdDate instanceof Date 
                  ? galleryDoc.createdDate.toISOString()
                  : galleryDoc.createdDate?.toDate?.()?.toISOString() || new Date().toISOString(),
                mediaItems,
                // Keep some backend compatibility fields
                created_date: galleryDoc.createdDate instanceof Date 
                  ? galleryDoc.createdDate.toISOString()
                  : galleryDoc.createdDate?.toDate?.()?.toISOString() || new Date().toISOString(),
                user_id: galleryDoc.userId,
              };
            })
          );
          
          setGalleries(galleryData);
          console.log('✅ Loaded', galleryData.length, 'galleries from Firestore');
        } else {
          console.log('📭 No galleries found in Firestore');
          setGalleries([]);
        }
      } catch (err: any) {
        console.warn('⚠️ Error fetching galleries, treating as no galleries:', err);
        setGalleries([]);
      }
    } catch (err: any) {
      console.error('❌ Error in fetchGalleries:', err);
      setGalleries([]);
    }
  }, []);

  const uploadMedia = async (
    files: FileList | File[],
    metadata?: Partial<MediaDocument>
  ): Promise<MediaItem[]> => {
    const user = await waitForAuth();
    if (!user) {
      throw new Error('User must be authenticated to upload media');
    }

    // Force refresh the authentication token once before the batch upload
    try {
      console.log('🔄 Refreshing authentication token before upload...');
      await user.getIdToken(true);
      console.log('✅ Authentication token refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh authentication token:', error);
      throw new Error('Failed to authenticate. Please sign in again.');
    }

    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(async (file) => {
      try {
        console.log(`📤 Uploading file: ${file.name}`);
        const result = await MediaService.uploadMedia(user.uid, file, metadata || {});
        console.log(`✅ Successfully uploaded: ${file.name}`);
        return result;
      } catch (error) {
        console.error(`❌ Failed to upload ${file.name}:`, error);
        throw error;
      }
    });

    const uploadedDocs = await Promise.all(uploadPromises);
    const newItems = await Promise.all(
      uploadedDocs.map(doc => transformMediaItemAsync(doc))
    );
    
    // Add new items to the media list
    setMedia(prev => [...newItems, ...prev]);
    
    return newItems;
  };

  const updateMedia = async (id: string, updates: Partial<MediaItem>): Promise<void> => {
    // Convert MediaItem updates to MediaDocument format
    const docUpdates: Partial<MediaDocument> = {
      caption: updates.caption,
      description: updates.description,
      platforms: updates.platforms,
      isPostReady: updates.isPostReady,
      status: updates.status as 'draft' | 'published' | 'scheduled',
      postMetadata: updates.postMetadata,
    };
    
    await MediaService.updateMedia(id, docUpdates);
    
    setMedia(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: new Date() }
        : item
    ));
  };

  const deleteMedia = async (id: string): Promise<void> => {
    await MediaService.deleteMedia(id);
    
    setMedia(prev => prev.filter(item => item.id !== id));
  };

  // Load media on mount and when auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchMedia();
        fetchGalleries();
      } else {
        setMedia([]);
        setGalleries([]);
      }
    });

    return () => unsubscribe();
  }, [fetchMedia, fetchGalleries]);

  return {
    media,
    galleries,
    loading,
    error,
    fetchMedia,
    uploadMedia,
    updateMedia,
    deleteMedia,
    fetchGalleries,
  };
}; 