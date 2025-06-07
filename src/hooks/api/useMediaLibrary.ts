import { useState, useEffect } from 'react';
import { api, MediaItem as ApiMediaItem } from '@/lib/api';

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  size: number;
  createdAt: string;
  tags: string[];
}

function mapApiMediaToMediaItem(apiMedia: ApiMediaItem): MediaItem {
  try {
    const type = apiMedia.content_type?.startsWith('image/') ? 'image' : 
                 apiMedia.content_type?.startsWith('video/') ? 'video' : 'audio';
    
    return {
      id: apiMedia.id || Date.now().toString(),
      name: apiMedia.filename || 'Unknown',
      type,
      url: apiMedia.url || '',
      size: apiMedia.size || 0,
      createdAt: apiMedia.upload_date || new Date().toISOString(),
      tags: [] // Tags would need to be added to the API response
    };
  } catch (error) {
    console.warn('Error mapping API media item:', error);
    // Return a safe fallback
    return {
      id: Date.now().toString(),
      name: 'Unknown',
      type: 'image',
      url: '',
      size: 0,
      createdAt: new Date().toISOString(),
      tags: []
    };
  }
}

export function useMediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.listMedia(100, 0);
      
      if (response.error) {
        setError(response.error);
        // Fallback to mock data if API fails
        const mockMedia: MediaItem[] = [
          {
            id: '1',
            name: 'product-hero.jpg',
            type: 'image',
            url: '/images/placeholder-image.jpg',
            size: 245760,
            createdAt: '2024-01-15T10:30:00Z',
            tags: ['product', 'hero', 'marketing']
          },
          {
            id: '2',
            name: 'demo-video.mp4',
            type: 'video',
            url: '/videos/placeholder-video.mp4',
            thumbnail: '/images/video-thumb.jpg',
            size: 15728640,
            createdAt: '2024-01-14T14:20:00Z',
            tags: ['demo', 'tutorial', 'video']
          },
          {
            id: '3',
            name: 'background-music.mp3',
            type: 'audio',
            url: '/audio/placeholder-audio.mp3',
            size: 3145728,
            createdAt: '2024-01-13T09:15:00Z',
            tags: ['music', 'background', 'audio']
          }
        ];
        setMedia(mockMedia);
      } else if (response.data && Array.isArray(response.data.media)) {
        try {
          const mappedMedia = response.data.media
            .filter((item): item is ApiMediaItem => item != null) // Filter out null/undefined items
            .map(mapApiMediaToMediaItem);
          setMedia(mappedMedia);
        } catch (mappingError) {
          console.error('Error mapping media items:', mappingError);
          setMedia([]);
          setError('Failed to process media data');
        }
      } else {
        console.warn('Unexpected API response format:', response);
        setMedia([]);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch media';
      setError(errorMessage);
      setMedia([]); // Ensure we don't leave media in an undefined state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia().catch((err) => {
      console.error('Error in fetchMedia useEffect:', err);
      setLoading(false);
      setError('Failed to initialize media library');
      setMedia([]);
    });
  }, []);

  const uploadMedia = async (file: File): Promise<MediaItem> => {
    try {
      if (!file || !file.name) {
        throw new Error('Invalid file provided');
      }

      const response = await api.uploadMedia(file);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const newItem = mapApiMediaToMediaItem(response.data);
        setMedia(prev => Array.isArray(prev) ? [newItem, ...prev] : [newItem]);
        return newItem;
      }
      
      throw new Error('No data returned from upload');
    } catch (err) {
      console.error('Upload error:', err);
      // Fallback to mock upload if API fails
      try {
        const newItem: MediaItem = {
          id: Date.now().toString(),
          name: file.name || 'uploaded-file',
          type: file.type?.startsWith('image/') ? 'image' : 
                file.type?.startsWith('video/') ? 'video' : 'audio',
          url: URL.createObjectURL(file),
          size: file.size || 0,
          createdAt: new Date().toISOString(),
          tags: []
        };
        setMedia(prev => Array.isArray(prev) ? [newItem, ...prev] : [newItem]);
        return newItem;
      } catch (fallbackError) {
        console.error('Fallback upload also failed:', fallbackError);
        throw err;
      }
    }
  };

  const deleteMedia = async (id: string): Promise<void> => {
    try {
      if (!id) {
        throw new Error('Invalid media ID provided');
      }

      const response = await api.deleteMedia(id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setMedia(prev => Array.isArray(prev) ? prev.filter(item => item?.id !== id) : []);
    } catch (err) {
      console.error('Delete error:', err);
      // Fallback to local deletion if API fails
      setMedia(prev => Array.isArray(prev) ? prev.filter(item => item?.id !== id) : []);
      throw err;
    }
  };

  return { 
    media: Array.isArray(media) ? media : [], // Ensure media is always an array
    loading, 
    error,
    uploadMedia, 
    deleteMedia, 
    refetch: fetchMedia 
  };
} 