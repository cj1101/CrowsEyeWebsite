import { useState, useEffect } from 'react';
import { crowsEyeAPI, GalleryItem as ApiGalleryItem } from '@/lib/api';

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  createdAt: string;
  thumbnailUrl?: string;
}

function mapApiGalleryToGalleryItem(apiGallery: ApiGalleryItem): GalleryItem {
  return {
    id: apiGallery.id,
    title: apiGallery.name,
    description: apiGallery.description,
    images: apiGallery.media_items,
    createdAt: apiGallery.created_at,
    thumbnailUrl: apiGallery.thumbnail_url
  };
}

export function useGallery() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await crowsEyeAPI.listGalleries(100, 0);
      
      if (response.error) {
        setError(response.error);
        // Fallback to mock data if API fails
        const mockGalleries: GalleryItem[] = [
          {
            id: '1',
            title: 'Product Showcase',
            description: 'A showcase of our best products',
            images: ['/images/placeholder-1.jpg', '/images/placeholder-2.jpg'],
            createdAt: '2024-01-15T10:30:00Z'
          }
        ];
        setGalleries(mockGalleries);
      } else if (response.data) {
        const mappedGalleries = response.data.galleries.map(mapApiGalleryToGalleryItem);
        setGalleries(mappedGalleries);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch galleries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const createGallery = async (
    name: string,
    description: string,
    mediaSelectionCriteria: any,
    organizationStyle?: string
  ): Promise<GalleryItem> => {
    try {
      const response = await crowsEyeAPI.createGallery({
        name,
        description,
        media_selection_criteria: mediaSelectionCriteria,
        organization_style: organizationStyle
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const newGallery = mapApiGalleryToGalleryItem(response.data);
        setGalleries(prev => [newGallery, ...prev]);
        return newGallery;
      }
      
      throw new Error('No data returned from gallery creation');
    } catch (err) {
      // Fallback to mock creation if API fails
      const newGallery: GalleryItem = {
        id: Date.now().toString(),
        title: name,
        description,
        images: [],
        createdAt: new Date().toISOString()
      };
      setGalleries(prev => [newGallery, ...prev]);
      return newGallery;
    }
  };

  const updateGallery = async (galleryId: string, updates: Partial<GalleryItem>): Promise<GalleryItem> => {
    try {
      const response = await crowsEyeAPI.updateGallery(galleryId, {
        name: updates.title,
        description: updates.description,
        media_items: updates.images
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const updatedGallery = mapApiGalleryToGalleryItem(response.data);
        setGalleries(prev => prev.map(gallery => gallery.id === galleryId ? updatedGallery : gallery));
        return updatedGallery;
      }
      
      throw new Error('No data returned from gallery update');
    } catch (err) {
      // Fallback to local update if API fails
      const gallery = galleries.find(g => g.id === galleryId);
      if (gallery) {
        const updatedGallery = { ...gallery, ...updates };
        setGalleries(prev => prev.map(g => g.id === galleryId ? updatedGallery : g));
        return updatedGallery;
      }
      throw err;
    }
  };

  const deleteGallery = async (galleryId: string): Promise<void> => {
    try {
      const response = await crowsEyeAPI.deleteGallery(galleryId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setGalleries(prev => prev.filter(gallery => gallery.id !== galleryId));
    } catch (err) {
      // Fallback to local deletion if API fails
      setGalleries(prev => prev.filter(gallery => gallery.id !== galleryId));
      throw err;
    }
  };

  const getGallery = async (galleryId: string): Promise<GalleryItem> => {
    try {
      const response = await crowsEyeAPI.getGallery(galleryId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        return mapApiGalleryToGalleryItem(response.data);
      }
      
      throw new Error('No data returned from gallery fetch');
    } catch (err) {
      throw err;
    }
  };

  return { 
    galleries, 
    loading, 
    error,
    createGallery,
    updateGallery,
    deleteGallery,
    getGallery,
    refetch: fetchGalleries
  };
} 