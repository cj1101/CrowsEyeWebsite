import { useState, useCallback, useEffect } from 'react';
import { crowsEyeAPI } from '../lib/api';

// Simplified hook for API configuration
export function useAPIConfig() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    try {
      const response = await crowsEyeAPI.healthCheck();
      if (response.data) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
        setError(response.error || 'Connection failed');
      }
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsChecking(false);
    }
  }, []);

  const updateConfig = useCallback((baseUrl: string, apiKey?: string) => {
    console.log('Config update requested:', { baseUrl, apiKey });
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

// Simplified hook for media management
export function useMediaLibrary() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await crowsEyeAPI.listMedia();
      if (response.data) {
        setMedia(response.data.media || []);
      } else {
        setError(response.error || 'Failed to fetch media');
        setMedia([]);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch media');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const response = await crowsEyeAPI.uploadMedia(file);
      if (response.data) {
        setMedia(prev => [response.data, ...prev]);
        return response.data;
      } else {
        throw new Error(response.error || 'Upload failed');
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
    try {
      setError(null);
      const response = await crowsEyeAPI.deleteMedia(id);
      if (response.data) {
        setMedia(prev => prev.filter(file => file?.id !== id));
      } else {
        throw new Error(response.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return {
    media,
    loading,
    uploading,
    error,
    uploadFile,
    deleteFile,
    refetch: fetchMedia,
  };
}

// Simplified hook for smart galleries
export function useSmartGalleries() {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGalleries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await crowsEyeAPI.listGalleries();
      if (response.data) {
        setGalleries(response.data.galleries || []);
      } else {
        setError(response.error || 'Failed to fetch galleries');
        setGalleries([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch galleries');
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGallery = useCallback(async (request: any) => {
    setCreating(true);
    setError(null);
    try {
      const response = await crowsEyeAPI.createGallery(request);
      if (response.data) {
        setGalleries(prev => [response.data, ...prev]);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create gallery');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gallery');
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  const deleteGallery = useCallback(async (id: string) => {
    try {
      const response = await crowsEyeAPI.deleteGallery(id);
      if (response.data) {
        setGalleries(prev => prev.filter(gallery => gallery.id !== id));
      } else {
        throw new Error(response.error || 'Delete failed');
      }
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

// Simplified hook for story formatting
export function useStoryFormatting() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await crowsEyeAPI.listStories();
      if (response.data) {
        setStories(response.data.stories || []);
      } else {
        // Don't show error for demo mode - just use empty array
        setStories([]);
        if (!response.error?.includes('Not Found') && !response.error?.includes('demo mode') && !response.error?.includes('not available')) {
          setError(response.error || 'Failed to fetch stories');
        }
      }
    } catch (err) {
      // Don't show error for demo mode
      setStories([]);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stories';
      if (!errorMessage.includes('Not Found') && !errorMessage.includes('demo mode') && !errorMessage.includes('not available')) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createStory = useCallback(async (request: any) => {
    setCreating(true);
    setError(null);
    try {
      const response = await crowsEyeAPI.createStory(request);
      if (response.data) {
        setStories(prev => [response.data, ...prev]);
        return response.data;
      } else {
        // In demo mode, create a mock story
        const mockStory = {
          id: Date.now().toString(),
          title: request.title,
          content: `${request.content_brief} (optimized for ${request.target_platforms.join(', ')} with ${request.tone} tone)`,
          createdAt: new Date().toISOString(),
          media: []
        };
        setStories(prev => [mockStory, ...prev]);
        return mockStory;
      }
    } catch (err) {
      // In demo mode, still create a mock story instead of showing error
      const mockStory = {
        id: Date.now().toString(),
        title: request.title,
        content: `${request.content_brief} (optimized for ${request.target_platforms.join(', ')} with ${request.tone} tone)`,
        createdAt: new Date().toISOString(),
        media: []
      };
      setStories(prev => [mockStory, ...prev]);
      return mockStory;
    } finally {
      setCreating(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return {
    stories,
    loading,
    creating,
    error,
    createStory,
    refetch: fetchStories,
  };
}

// Simplified hook for highlight reels
export function useHighlightReels() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await crowsEyeAPI.listHighlightReels();
      if (response.data) {
        setReels(response.data.highlight_reels || []);
      } else {
        setError(response.error || 'Failed to fetch highlight reels');
        setReels([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch highlight reels');
      setReels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  return {
    reels,
    loading,
    error,
    refetch: fetchReels,
  };
}

// Simplified hook for audio import
export function useAudioImport() {
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAudio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await crowsEyeAPI.listAudio();
      if (response.data) {
        setAudioFiles(response.data.audio_files || []);
      } else {
        setError(response.error || 'Failed to fetch audio files');
        setAudioFiles([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audio files');
      setAudioFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const importAudio = useCallback(async (file: File, options: any = {}) => {
    setImporting(true);
    setError(null);
    try {
      const response = await crowsEyeAPI.importAudio(file, options);
      if (response.data) {
        setAudioFiles(prev => [response.data, ...prev]);
        return response.data;
      } else {
        throw new Error(response.error || 'Import failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      throw err;
    } finally {
      setImporting(false);
    }
  }, []);

  useEffect(() => {
    fetchAudio();
  }, [fetchAudio]);

  return {
    audioFiles,
    loading,
    importing,
    error,
    importAudio,
    refetch: fetchAudio,
  };
}

// Simplified hook for analytics
export function useAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (period: string = '30d') => {
    setLoading(true);
    setError(null);
    try {
      const response = await crowsEyeAPI.getAnalytics(period);
      if (response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Failed to fetch analytics');
        setAnalytics(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
} 