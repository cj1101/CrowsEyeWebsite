import { useState, useCallback, useEffect } from 'react';
import { crowEyeAPI, type MediaFile, type Gallery, type Story, type HighlightReel, type AudioFile } from '../lib/api/crow-eye-api';

// Hook for API configuration
export function useAPIConfig() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    try {
      await crowEyeAPI.healthCheck();
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsChecking(false);
    }
  }, []);

  const updateConfig = useCallback((baseUrl: string, apiKey?: string) => {
    crowEyeAPI.updateConfig({ baseUrl, apiKey });
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    isChecking,
    error,
    checkConnection,
    updateConfig,
  };
}

// Hook for media management
export function useMediaLibrary() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const mediaFiles = await crowEyeAPI.getMediaFiles();
      // Ensure we always set an array, even if the API returns something unexpected
      if (Array.isArray(mediaFiles)) {
        setMedia(mediaFiles);
      } else {
        console.warn('API returned non-array media files:', mediaFiles);
        setMedia([]);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch media';
      setError(errorMessage);
      // Set fallback empty array to prevent map errors
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (!file) {
      const error = new Error('No file provided');
      setError(error.message);
      throw error;
    }

    setUploading(true);
    setError(null);
    try {
      const uploadedFile = await crowEyeAPI.uploadMedia(file);
      if (uploadedFile) {
        setMedia(prev => {
          const currentMedia = Array.isArray(prev) ? prev : [];
          return [uploadedFile, ...currentMedia];
        });
        return uploadedFile;
      } else {
        throw new Error('Upload returned no data');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteFile = useCallback(async (id: string) => {
    if (!id) {
      const error = new Error('No file ID provided');
      setError(error.message);
      throw error;
    }

    try {
      setError(null);
      await crowEyeAPI.deleteMedia(id);
      setMedia(prev => {
        const currentMedia = Array.isArray(prev) ? prev : [];
        return currentMedia.filter(file => file?.id !== id);
      });
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchMedia().catch((err) => {
      console.error('Error in fetchMedia useEffect:', err);
      setLoading(false);
      setError('Failed to initialize media library');
      setMedia([]);
    });
  }, [fetchMedia]);

  return {
    media: Array.isArray(media) ? media : [], // Triple ensure media is always an array
    loading,
    uploading,
    error,
    uploadFile,
    deleteFile,
    refetch: fetchMedia,
  };
}

// Hook for smart galleries
export function useSmartGalleries() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGalleries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const galleryList = await crowEyeAPI.getGalleries();
      setGalleries(Array.isArray(galleryList) ? galleryList : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch galleries');
      // Set fallback empty array to prevent map errors
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGallery = useCallback(async (prompt: string, maxItems: number = 5) => {
    setCreating(true);
    setError(null);
    try {
      const newGallery = await crowEyeAPI.createGallery(prompt, maxItems, true);
      setGalleries(prev => [newGallery, ...prev]);
      return newGallery;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gallery');
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  const deleteGallery = useCallback(async (id: string) => {
    try {
      await crowEyeAPI.deleteGallery(id);
      setGalleries(prev => prev.filter(gallery => gallery.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  return {
    galleries,
    loading,
    creating,
    error,
    createGallery,
    deleteGallery,
    refetch: fetchGalleries,
  };
}

// Hook for story formatting
export function useStoryFormatting() {
  const [stories, setStories] = useState<Story[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storyList, templateList] = await Promise.all([
        crowEyeAPI.getStories(),
        crowEyeAPI.getStoryTemplates(),
      ]);
      setStories(storyList);
      setTemplates(templateList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStory = useCallback(async (title: string, content: string, platform: string, templateId?: string) => {
    setCreating(true);
    setError(null);
    try {
      const newStory = await crowEyeAPI.createStory(title, content, platform, templateId);
      setStories(prev => [newStory, ...prev]);
      return newStory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  const deleteStory = useCallback(async (id: string) => {
    try {
      await crowEyeAPI.deleteStory(id);
      setStories(prev => prev.filter(story => story.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return {
    stories,
    templates,
    loading,
    creating,
    error,
    createStory,
    deleteStory,
    refetch: fetchStories,
  };
}

// Hook for highlight reels
export function useHighlightReels() {
  const [reels, setReels] = useState<HighlightReel[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reelList, styleList] = await Promise.all([
        crowEyeAPI.getHighlightReels(),
        crowEyeAPI.getHighlightStyles(),
      ]);
      setReels(reelList);
      setStyles(styleList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch highlight reels');
    } finally {
      setLoading(false);
    }
  }, []);

  const createReel = useCallback(async (mediaIds: string[], duration: number = 30, style: string = 'dynamic') => {
    setCreating(true);
    setError(null);
    try {
      const newReel = await crowEyeAPI.createHighlightReel(mediaIds, duration, style);
      setReels(prev => [newReel, ...prev]);
      return newReel;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create highlight reel');
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  const checkStatus = useCallback(async (id: string) => {
    try {
      return await crowEyeAPI.getHighlightReelStatus(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  return {
    reels,
    styles,
    loading,
    creating,
    error,
    createReel,
    checkStatus,
    refetch: fetchReels,
  };
}

// Hook for audio import
export function useAudioImport() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [effects, setEffects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAudio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [audioList, effectList] = await Promise.all([
        crowEyeAPI.getAudioFiles(),
        crowEyeAPI.getAudioEffects(),
      ]);
      setAudioFiles(audioList);
      setEffects(effectList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audio files');
    } finally {
      setLoading(false);
    }
  }, []);

  const importAudio = useCallback(async (file: File) => {
    setImporting(true);
    setError(null);
    try {
      const audioFile = await crowEyeAPI.importAudio(file);
      setAudioFiles(prev => [audioFile, ...prev]);
      return audioFile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio import failed');
      throw err;
    } finally {
      setImporting(false);
    }
  }, []);

  const editAudio = useCallback(async (id: string, command: string) => {
    try {
      const editedAudio = await crowEyeAPI.editAudio(id, command);
      setAudioFiles(prev => prev.map(audio => audio.id === id ? editedAudio : audio));
      return editedAudio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio edit failed');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAudio();
  }, [fetchAudio]);

  return {
    audioFiles,
    effects,
    loading,
    importing,
    error,
    importAudio,
    editAudio,
    refetch: fetchAudio,
  };
}

// Hook for analytics
export function useAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, insightsData] = await Promise.all([
        crowEyeAPI.getAnalytics(),
        crowEyeAPI.getInsights(),
      ]);
      setAnalytics(analyticsData);
      setInsights(insightsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (format: 'csv' | 'json' = 'json') => {
    try {
      const blob = await crowEyeAPI.exportAnalytics(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    insights,
    loading,
    error,
    exportData,
    refetch: fetchAnalytics,
  };
} 