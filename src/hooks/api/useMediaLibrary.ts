import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  size: number;
  createdAt: string;
  tags: string[];
  platforms: string[];
  dimensions?: { width: number; height: number };
  duration?: number;
  status?: 'completed' | 'processing' | 'draft';
  isProcessed?: boolean;
  subtype?: 'reel' | 'short' | 'story' | 'post';
}

export function useMediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching media library...');
      
      // Load local uploads from localStorage
      const localUploads = JSON.parse(localStorage.getItem('localMediaLibrary') || '[]');
      console.log('Found', localUploads.length, 'local uploads in localStorage');
      
      // Convert stored metadata back to MediaItem format
      // Note: Object URLs are lost on page refresh, so these will show as placeholders
      const localMedia: MediaItem[] = localUploads.map((upload: any) => ({
        id: upload.id,
        name: upload.name,
        type: upload.type,
        url: upload.url || '/images/placeholder-image.jpg', // Fallback for lost object URLs
        thumbnail: upload.type === 'image' ? (upload.url || '/images/placeholder-image.jpg') : undefined,
        size: upload.size,
        createdAt: upload.createdAt,
        tags: upload.tags || ['local-storage', 'raw-media'],
        platforms: upload.platforms || [],
        dimensions: upload.dimensions,
        duration: upload.duration,
        status: upload.status || 'draft',
        isProcessed: upload.isProcessed || false
      }));

      // Combine only local uploads; remove demo/mock media
      const combinedMedia = [...localMedia];
      setMedia(combinedMedia);
      console.log('Loaded media library with', localMedia.length, 'local uploads');
    } catch (err) {
      console.error('Error fetching media:', err);
      setError('Failed to load media library');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const uploadMedia = async (file: File): Promise<MediaItem> => {
    try {
      if (!file || !file.name) {
        throw new Error('Invalid file provided');
      }

      console.log('📁 Processing media file locally:', file.name, 'Size:', file.size);
      
      // Create object URL for immediate display
      const objectUrl = URL.createObjectURL(file);
      
      // Generate thumbnail based on file type
      let thumbnail: string | undefined = undefined;
      let dimensions: { width: number; height: number } | undefined = undefined;
      
      if (file.type.startsWith('image/')) {
        thumbnail = objectUrl;
        dimensions = await getImageDimensions(file);
      } else if (file.type.startsWith('video/')) {
        thumbnail = await generateVideoThumbnail(file);
        dimensions = await getVideoDimensions(file);
      }
      
      // Always use local storage for raw media files
      // Only finished/published posts should be stored on server
      const uploadedItem: MediaItem = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: (file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'audio') as 'image' | 'video' | 'audio',
        url: objectUrl,
        thumbnail: thumbnail,
        size: file.size,
        createdAt: new Date().toISOString(),
        tags: ['local-storage', 'raw-media'],
        platforms: [],
        status: 'draft',
        isProcessed: false,
        dimensions: dimensions
      };

      // Store metadata in localStorage (without the heavy file data)
      try {
        const localUploads = JSON.parse(localStorage.getItem('localMediaLibrary') || '[]');
        const localUploadData = {
          id: uploadedItem.id,
          name: uploadedItem.name,
          type: uploadedItem.type,
          size: uploadedItem.size,
          createdAt: uploadedItem.createdAt,
          tags: uploadedItem.tags,
          platforms: uploadedItem.platforms,
          status: uploadedItem.status,
          isProcessed: uploadedItem.isProcessed,
          dimensions: uploadedItem.dimensions,
          uploadedAt: new Date().toISOString()
        };
        
        localUploads.unshift(localUploadData);
        // Keep only last 50 items to prevent localStorage overflow
        localStorage.setItem('localMediaLibrary', JSON.stringify(localUploads.slice(0, 50)));
        
        console.log('✅ Media metadata saved to local library:', uploadedItem.name);
      } catch (storageError) {
        console.warn('⚠️ localStorage full, continuing without persistence:', storageError);
        // Continue without localStorage - file will still work in current session
      }
      
      // Add to local state immediately for instant feedback
      setMedia(prev => {
        // Check if item already exists to avoid duplicates
        const exists = prev.find(item => item.id === uploadedItem.id);
        if (exists) {
          return prev;
        }
        return [uploadedItem, ...prev];
      });
      
      return uploadedItem;
    } catch (err) {
      console.error('❌ Upload error:', err);
      throw err;
    }
  };

  // Helper function to get image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve({ width: 0, height: 0 });
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Helper function to get video dimensions
  const getVideoDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('video/')) {
        resolve({ width: 0, height: 0 });
        return;
      }
      
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth, height: video.videoHeight });
      };
      video.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      video.src = URL.createObjectURL(file);
    });
  };

  // Helper function to generate video thumbnail
  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('video/')) {
        resolve('/images/video-thumb.jpg');
        return;
      }
      
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadeddata = () => {
        // Set video to middle of the video for thumbnail
        video.currentTime = Math.min(video.duration / 2, 2);
      };
      
      video.onseeked = () => {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnailUrl);
        } catch (error) {
          console.error('Error generating video thumbnail:', error);
          resolve('/images/video-thumb.jpg');
        }
      };
      
      video.onerror = () => {
        resolve('/images/video-thumb.jpg');
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const deleteMedia = async (id: string): Promise<void> => {
    try {
      if (!id) {
        throw new Error('Invalid media ID provided');
      }
      
      // If it's a local upload, remove from localStorage
      if (id.startsWith('local-')) {
        const localUploads = JSON.parse(localStorage.getItem('localMediaLibrary') || '[]');
        const updatedUploads = localUploads.filter((upload: any) => upload.id !== id);
        localStorage.setItem('localMediaLibrary', JSON.stringify(updatedUploads));
        console.log('Removed local upload from localStorage:', id);
      }
      
      // Remove from local state
      setMedia(prev => prev.filter(item => item.id !== id));
      console.log('Removed media from library:', id);
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  };

  const processMedia = async (mediaId: string, instructions: string): Promise<void> => {
    try {
      console.log(`Processing media ${mediaId} with instructions: ${instructions}`);
      
      // Simulate processing by updating the media item
      setMedia(prev => prev.map(item => 
        item.id === mediaId 
          ? { ...item, tags: [...item.tags, 'ai-processed'] }
          : item
      ));
    } catch (err) {
      console.error('Process media error:', err);
      throw err;
    }
  };

  return { 
    media,
    loading, 
    error,
    uploadMedia, 
    deleteMedia,
    processMedia,
    refetch: fetchMedia
  };
} 