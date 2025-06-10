import { useState } from 'react';
import { apiService } from '../../services/api';
import type {
  CaptionGenerationRequest,
  CaptionGenerationResponse,
  HashtagGenerationRequest,
  HashtagGenerationResponse,
  ContentIdeasRequest,
  ContentIdeasResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
  VideoGenerationRequest,
  VideoGenerationResponse,
  HighlightGenerationRequest,
  HighlightGenerationResponse
} from '../../types/api';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Caption Generation (Updated for backend)
  const generateCaptions = async (data: CaptionGenerationRequest): Promise<CaptionGenerationResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.generateCaptions(data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate captions');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // AI Hashtag Generation (Updated for backend)
  const generateHashtags = async (data: HashtagGenerationRequest): Promise<HashtagGenerationResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.generateHashtags(data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate hashtags');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // AI Content Ideas (Updated for backend)
  const generateContentIdeas = async (data: ContentIdeasRequest): Promise<ContentIdeasResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.generateContentIdeas(data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate content ideas');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Imagen 3 Image Generation (Updated for backend)
  const generateImages = async (data: ImageGenerationRequest): Promise<ImageGenerationResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.generateImages(data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate images');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Veo Video Generation (Updated for backend)
  const generateVideos = async (data: VideoGenerationRequest): Promise<VideoGenerationResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.generateVideos(data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate videos');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Highlight Reel Generation (Updated for backend)
  const generateHighlights = async (data: HighlightGenerationRequest): Promise<HighlightGenerationResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.generateHighlights(data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate highlights');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateCaptions,
    generateHashtags,
    generateContentIdeas,
    generateImages,
    generateVideos,
    generateHighlights
  };
} 