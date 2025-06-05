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
  const type = apiMedia.content_type.startsWith('image/') ? 'image' : 
               apiMedia.content_type.startsWith('video/') ? 'video' : 'audio';
  
  return {
    id: apiMedia.id,
    name: apiMedia.filename,
    type,
    url: apiMedia.url,
    size: apiMedia.size,
    createdAt: apiMedia.upload_date,
    tags: [] // Tags would need to be added to the API response
  };
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
      } else if (response.data) {
        const mappedMedia = response.data.media.map(mapApiMediaToMediaItem);
        setMedia(mappedMedia);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const uploadMedia = async (file: File): Promise<MediaItem> => {
    try {
      const response = await api.uploadMedia(file);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const newItem = mapApiMediaToMediaItem(response.data);
        setMedia(prev => [newItem, ...prev]);
        return newItem;
      }
      
      throw new Error('No data returned from upload');
    } catch (err) {
      // Fallback to mock upload if API fails
      const newItem: MediaItem = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'audio',
        url: URL.createObjectURL(file),
        size: file.size,
        createdAt: new Date().toISOString(),
        tags: []
      };
      setMedia(prev => [newItem, ...prev]);
      return newItem;
    }
  };

  const deleteMedia = async (id: string): Promise<void> => {
    try {
      const response = await api.deleteMedia(id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setMedia(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      // Fallback to local deletion if API fails
      setMedia(prev => prev.filter(item => item.id !== id));
      throw err;
    }
  };

  return { 
    media, 
    loading, 
    error,
    uploadMedia, 
    deleteMedia, 
    refetch: fetchMedia 
  };
} 