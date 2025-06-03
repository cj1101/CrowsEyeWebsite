import { useState, useEffect } from 'react';

export interface GalleryItem {
  id: string;
  title: string;
  images: string[];
  createdAt: string;
}

export function useGallery() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mockGalleries: GalleryItem[] = [
      {
        id: '1',
        title: 'Product Showcase',
        images: ['/images/placeholder-1.jpg', '/images/placeholder-2.jpg'],
        createdAt: '2024-01-15T10:30:00Z'
      }
    ];

    setTimeout(() => {
      setGalleries(mockGalleries);
      setLoading(false);
    }, 300);
  }, []);

  return { galleries, loading, error };
} 