import { useState } from 'react';
import { api } from '@/lib/api';

export interface MediaSearchResult {
  raw_photos: string[];
  raw_videos: string[];
  finished_posts: string[];
}

export interface GalleryGenerationRequest {
  media_paths: string[];
  prompt: string;
  enhance_photos?: boolean;
}

export interface CaptionGenerationRequest {
  media_paths: string[];
  tone_prompt?: string;
}

export interface SavedGallery {
  id: string;
  name: string;
  media_paths: string[];
  caption: string;
  created_at: string;
}

export function useCrowsEye() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMedia = async (query: string): Promise<MediaSearchResult> => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll use the gallery API to search for media
      // In the future, this could be a dedicated search endpoint
      const response = await api.listGalleries(100, 0);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Mock search results based on query
      const mockResult: MediaSearchResult = {
        raw_photos: [
          '/images/bread-1.jpg',
          '/images/bread-2.jpg',
          '/images/bakery-interior.jpg'
        ].filter(path => 
          query.toLowerCase().includes('bread') || 
          query.toLowerCase().includes('bakery') ||
          query === ''
        ),
        raw_videos: [
          '/videos/baking-process.mp4',
          '/videos/bakery-tour.mp4'
        ].filter(path => 
          query.toLowerCase().includes('baking') || 
          query.toLowerCase().includes('video') ||
          query === ''
        ),
        finished_posts: response.data?.galleries.map(g => g.media_items).flat() || []
      };
      
      return mockResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search media');
      // Return empty result on error
      return {
        raw_photos: [],
        raw_videos: [],
        finished_posts: []
      };
    } finally {
      setLoading(false);
    }
  };

  const generateGallery = async (request: GalleryGenerationRequest): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the gallery creation API
      const response = await api.createGallery({
        name: `Gallery for: ${request.prompt}`,
        description: `AI-generated gallery based on prompt: ${request.prompt}`,
        media_selection_criteria: {
          prompt: request.prompt,
          media_paths: request.media_paths,
          enhance_photos: request.enhance_photos
        }
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        return response.data.media_items;
      }
      
      // Fallback: return a subset of the input media based on the prompt
      const keywords = request.prompt.toLowerCase().split(' ');
      const selectedMedia = request.media_paths.filter(path => {
        const filename = path.toLowerCase();
        return keywords.some(keyword => filename.includes(keyword));
      });
      
      // If no matches, return first few items
      return selectedMedia.length > 0 ? selectedMedia.slice(0, 5) : request.media_paths.slice(0, 3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate gallery');
      // Fallback: return first few items
      return request.media_paths.slice(0, 3);
    } finally {
      setLoading(false);
    }
  };

  const generateCaption = async (request: CaptionGenerationRequest): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the story creation API to generate captions
      const response = await api.createStory({
        title: 'Caption Generation',
        content_brief: `Generate a caption for media files: ${request.media_paths.join(', ')}`,
        target_platforms: ['instagram', 'facebook'],
        tone: request.tone_prompt || 'professional',
        include_media: true
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        return response.data.content;
      }
      
      // Fallback: generate a simple caption
      const tone = request.tone_prompt || 'professional';
      const mediaCount = request.media_paths.length;
      
      const fallbackCaptions = {
        professional: `Showcasing our latest work with ${mediaCount} carefully selected pieces. Each image tells a story of quality and craftsmanship.`,
        casual: `Check out these ${mediaCount} awesome shots! 📸 Love how they turned out!`,
        creative: `A visual journey through ${mediaCount} moments of inspiration. Art speaks where words fall short.`,
        promotional: `🌟 Featured Collection: ${mediaCount} stunning pieces that showcase our best work. Don't miss out!`
      };
      
      return fallbackCaptions[tone as keyof typeof fallbackCaptions] || fallbackCaptions.professional;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate caption');
      // Fallback caption
      return `Beautiful collection of ${request.media_paths.length} images showcasing our work.`;
    } finally {
      setLoading(false);
    }
  };

  const saveGallery = async (
    name: string, 
    mediaPaths: string[], 
    caption: string
  ): Promise<SavedGallery> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.createGallery({
        name,
        description: caption,
        media_selection_criteria: {
          media_paths: mediaPaths,
          caption
        }
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        return {
          id: response.data.id,
          name: response.data.name,
          media_paths: response.data.media_items,
          caption: response.data.description,
          created_at: response.data.created_at
        };
      }
      
      throw new Error('No data returned from gallery save');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save gallery');
      // Fallback: create a mock saved gallery
      return {
        id: Date.now().toString(),
        name,
        media_paths: mediaPaths,
        caption,
        created_at: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  };

  const getSavedGalleries = async (): Promise<SavedGallery[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.listGalleries(100, 0);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        return response.data.galleries.map(gallery => ({
          id: gallery.id,
          name: gallery.name,
          media_paths: gallery.media_items,
          caption: gallery.description,
          created_at: gallery.created_at
        }));
      }
      
      return [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved galleries');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAllMedia = async (): Promise<MediaSearchResult> => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all media from different sources
      const [mediaResponse, galleryResponse] = await Promise.all([
        api.listMedia(100, 0),
        api.listGalleries(100, 0)
      ]);
      
      const rawPhotos: string[] = [];
      const rawVideos: string[] = [];
      const finishedPosts: string[] = [];
      
      // Process media library
      if (mediaResponse.data) {
        mediaResponse.data.media.forEach(item => {
          if (item.content_type.startsWith('image/')) {
            rawPhotos.push(item.url);
          } else if (item.content_type.startsWith('video/')) {
            rawVideos.push(item.url);
          }
        });
      }
      
      // Process galleries as finished posts
      if (galleryResponse.data) {
        galleryResponse.data.galleries.forEach(gallery => {
          finishedPosts.push(...gallery.media_items);
        });
      }
      
      return {
        raw_photos: rawPhotos,
        raw_videos: rawVideos,
        finished_posts: finishedPosts
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all media');
      return {
        raw_photos: [],
        raw_videos: [],
        finished_posts: []
      };
    } finally {
      setLoading(false);
    }
  };

  const addMediaItem = async (
    mediaPath: string, 
    caption: string = '', 
    isPostReady: boolean = false
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // This would typically involve uploading the media file
      // For now, we'll simulate success
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add media item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeMediaItem = async (mediaPath: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Extract media ID from path and delete
      const mediaId = mediaPath.split('/').pop()?.split('.')[0] || '';
      const response = await api.deleteMedia(mediaId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove media item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    searchMedia,
    generateGallery,
    generateCaption,
    saveGallery,
    getSavedGalleries,
    getAllMedia,
    addMediaItem,
    removeMediaItem
  };
} 