import { useState, useEffect } from 'react';

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

export function useMediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock media data for static site
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

    setTimeout(() => {
      setMedia(mockMedia);
      setLoading(false);
    }, 300);
  }, []);

  const uploadMedia = async (file: File) => {
    // Mock upload functionality
    return new Promise<MediaItem>((resolve) => {
      setTimeout(() => {
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
        resolve(newItem);
      }, 1000);
    });
  };

  const deleteMedia = async (id: string) => {
    setMedia(prev => prev.filter(item => item.id !== id));
  };

  return { media, loading, uploadMedia, deleteMedia };
} 