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
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching media library...');
      
      // Try to fetch from API first - try dedicated media endpoint
      try {
        const response = await apiService.getMediaLibrary();
        console.log('API response:', response);
        
        if (response.data && Array.isArray(response.data)) {
          const apiMedia = response.data.map((item: any) => ({
            id: item.id || item.media_id,
            name: item.name || item.filename || item.original_filename || `Media ${item.id}`,
            type: (item.content_type?.startsWith('image/') ? 'image' : 
                  item.content_type?.startsWith('video/') ? 'video' : 'audio') as 'image' | 'video' | 'audio',
            url: item.url || item.file_url,
            thumbnail: item.thumbnail_url || item.thumbnail,
            size: item.file_size || item.size || 0,
            createdAt: item.created_at || item.uploaded_at || new Date().toISOString(),
            tags: item.tags || [],
            platforms: item.platforms || [],
            dimensions: item.dimensions,
            duration: item.duration,
            status: item.status || 'draft',
            isProcessed: item.is_processed || false,
            subtype: item.subtype
          }));
          
          console.log('Processed API media:', apiMedia);
          setMedia([...apiMedia]);
          return;
        }
      } catch (apiError) {
        console.warn('Failed to fetch from API, using mock data:', apiError);
      }
      
      // Load local uploads from localStorage
      const localUploads = JSON.parse(localStorage.getItem('localUploads') || '[]');
      const localMedia: MediaItem[] = localUploads.map((upload: any) => ({
        id: upload.id,
        name: upload.name,
        type: upload.type,
        url: upload.fileData || upload.url, // Use base64 data if available
        thumbnail: upload.thumbnail,
        size: upload.size,
        createdAt: upload.createdAt,
        tags: upload.tags,
        platforms: upload.platforms,
        dimensions: upload.dimensions,
        duration: upload.duration
      }));

      // Fallback to mock data for demo purposes
      const mockMedia: MediaItem[] = [
        {
          id: '1',
          name: 'product-hero.jpg',
          type: 'image',
          url: '/images/placeholder-image.jpg',
          size: 245760,
          createdAt: '2024-01-15T10:30:00Z',
          tags: ['product', 'hero', 'marketing'],
          platforms: ['instagram', 'facebook'],
          dimensions: { width: 1920, height: 1080 }
        },
        {
          id: '2',
          name: 'demo-video.mp4',
          type: 'video',
          url: '/videos/placeholder-video.mp4',
          thumbnail: '/images/video-thumb.jpg',
          size: 15728640,
          createdAt: '2024-01-14T14:20:00Z',
          tags: ['demo', 'tutorial', 'video'],
          platforms: ['youtube', 'tiktok'],
          dimensions: { width: 1920, height: 1080 },
          duration: 120
        },
        {
          id: '3',
          name: 'background-music.mp3',
          type: 'audio',
          url: '/audio/placeholder-audio.mp3',
          size: 3145728,
          createdAt: '2024-01-13T09:15:00Z',
          tags: ['music', 'background', 'audio'],
          platforms: ['instagram', 'youtube'],
          duration: 180
        },
        {
          id: '4',
          name: 'social-campaign.png',
          type: 'image',
          url: '/images/placeholder-image.jpg',
          size: 189440,
          createdAt: '2024-01-12T16:45:00Z',
          tags: ['social', 'campaign', 'design'],
          platforms: ['instagram', 'facebook', 'twitter'],
          dimensions: { width: 1080, height: 1080 }
        },
        {
          id: '5',
          name: 'podcast-intro.mp3',
          type: 'audio',
          url: '/audio/placeholder-audio.mp3',
          size: 2097152,
          createdAt: '2024-01-11T11:30:00Z',
          tags: ['podcast', 'intro', 'audio'],
          platforms: ['youtube', 'spotify'],
          duration: 30
        }
      ];
      
      // Combine local uploads with mock data, with local uploads first
      const combinedMedia = [...localMedia, ...mockMedia];
      setMedia(combinedMedia);
      console.log('Loaded media library with', localMedia.length, 'local uploads and', mockMedia.length, 'mock items');
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

      console.log('Uploading file:', file.name, 'Size:', file.size);

      // Try to upload to API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('description', `Uploaded ${file.name}`);
      formData.append('tags', JSON.stringify(['uploaded', 'media']));
      
      let apiResponse = null;
      let uploadedItem: MediaItem | null = null;

      try {
        console.log('Attempting API upload to:', 'https://crow-eye-api-dot-crows-eye-website.uc.r.appspot.com/api/v1/media/upload');
        console.log('FormData contents:');
        for (let pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }
        
        apiResponse = await apiService.uploadMedia(formData);
        console.log('API upload successful:', apiResponse);
        console.log('API response data:', JSON.stringify(apiResponse.data, null, 2));
        
        // Create item from API response
        uploadedItem = {
          id: apiResponse.data.id,
          name: apiResponse.data.name || file.name,
          type: (apiResponse.data.content_type?.startsWith('image/') ? 'image' : 
                apiResponse.data.content_type?.startsWith('video/') ? 'video' : 'audio') as 'image' | 'video' | 'audio',
          url: apiResponse.data.url,
          thumbnail: apiResponse.data.thumbnail_url || apiResponse.data.thumbnail,
          size: apiResponse.data.file_size || file.size,
          createdAt: apiResponse.data.created_at || new Date().toISOString(),
          tags: apiResponse.data.tags || ['uploaded'],
          platforms: apiResponse.data.platforms || []
        };
      } catch (apiError) {
        console.warn('API upload failed, creating local item:', apiError);
        
        // Show user-friendly message about API status
        if (typeof window !== 'undefined') {
          console.log('ℹ️ Note: Files are being stored locally since the backend API is not fully implemented yet.');
        }
        
        // Create local item with object URL for preview
        uploadedItem = {
          id: `local-${Date.now()}`,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('video/') ? 'video' : 'audio',
          url: URL.createObjectURL(file),
          size: file.size,
          createdAt: new Date().toISOString(),
          tags: ['uploaded', 'local'],
          platforms: []
        };

        // Store local uploads in localStorage to persist across refreshes
        const localUploads = JSON.parse(localStorage.getItem('localUploads') || '[]');
        const localUploadData = {
          ...uploadedItem,
          fileData: await fileToBase64(file) // Convert file to base64 for storage
        };
        localUploads.unshift(localUploadData);
        localStorage.setItem('localUploads', JSON.stringify(localUploads.slice(0, 50))); // Keep only last 50
      }
      
      if (!uploadedItem) {
        throw new Error('Failed to create uploaded item');
      }

      // Add to local state immediately for instant feedback
      setMedia(prev => {
        // Check if item already exists to avoid duplicates
        const exists = prev.find(item => item.id === uploadedItem!.id);
        if (exists) {
          return prev;
        }
        return [uploadedItem!, ...prev];
      });
      
      console.log('Upload completed, item added to library:', uploadedItem.name);
      
      return uploadedItem;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const deleteMedia = async (id: string): Promise<void> => {
    try {
      if (!id) {
        throw new Error('Invalid media ID provided');
      }
      
      // If it's a local upload, remove from localStorage
      if (id.startsWith('local-')) {
        const localUploads = JSON.parse(localStorage.getItem('localUploads') || '[]');
        const updatedUploads = localUploads.filter((upload: any) => upload.id !== id);
        localStorage.setItem('localUploads', JSON.stringify(updatedUploads));
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