import { useState, useEffect, useCallback } from 'react';
import { CrowsEyeAPI, type User, type PlatformConnection, type ScheduledPost, type AnalyticsOverview, type PostAnalytics, type ComplianceResult, type AIGenerationResponse } from '@/services/api';

interface APIHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface APIHookReturn<T> extends APIHookState<T> {
  refetch: () => Promise<void>;
  reset: () => void;
}

export const useAPI = () => {
  const [api] = useState(() => new CrowsEyeAPI());
  
  return api;
};

export const useAPICall = <T>(
  apiCall: () => Promise<{ data: T }>,
  dependencies: any[] = []
): APIHookReturn<T> => {
  const [state, setState] = useState<APIHookState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));
    
    try {
      const response = await apiCall();
      setState({
        data: response.data,
        loading: false,
        error: null,
        success: true
      });
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error?.message || 'An error occurred',
        success: false
      });
    }
  }, dependencies);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    refetch: execute,
    reset
  };
};

// Health Check Hooks
export const useHealthCheck = () => {
  const api = useAPI();
  return useAPICall(() => api.healthCheck());
};

export const useSystemHealth = () => {
  const api = useAPI();
  return useAPICall(() => api.getSystemHealth());
};

// Authentication Hooks
export const useCurrentUser = () => {
  const api = useAPI();
  return useAPICall<User>(() => 
    api.getCurrentUser().then(response => ({ data: response.data || {} as User }))
  );
};

export const useAuth = () => {
  const api = useAPI();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await api.login(credentials);
    if (response.data && response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      if (response.data.user) {
        setUser(response.data.user);
      }
      setIsAuthenticated(true);
    }
    return response;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (userData: { email: string; password: string; name: string }) => {
    const response = await api.register(userData);
    if (response.data && response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      if (response.data.user) {
        setUser(response.data.user);
      }
      setIsAuthenticated(true);
    }
    return response;
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.getCurrentUser()
        .then(response => {
          if (response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          }
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [api]);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register
  };
};

// Platform Integration Hooks
export const usePlatforms = () => {
  const api = useAPI();
  return useAPICall<PlatformConnection[]>(() => api.getPlatforms());
};

export const usePlatformStatus = (platform: string) => {
  const api = useAPI();
  return useAPICall<PlatformConnection>(() => api.getPlatformStatus(platform), [platform]);
};

export const usePlatformOperations = () => {
  const api = useAPI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectPlatform = async (platform: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.connectPlatform(platform);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnectPlatform = async (platform: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.disconnectPlatform(platform);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const postToPlatform = async (platform: string, postData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.postToPlatform(platform, postData);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    connectPlatform,
    disconnectPlatform,
    postToPlatform,
    loading,
    error
  };
};

// Google Photos Hooks
export const useGooglePhotosAuth = () => {
  const api = useAPI();
  return useAPICall(() => api.getGooglePhotosStatus());
};

export const useGooglePhotosAlbums = () => {
  const api = useAPI();
  return useAPICall(() => api.listGooglePhotosAlbums());
};

export const useGooglePhotosOperations = () => {
  const api = useAPI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectGooglePhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.connectGooglePhotos();
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchPhotos = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.searchGooglePhotos(query);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const importPhotos = async (albumId: string, mediaIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.importFromGooglePhotos(albumId, mediaIds);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    connectGooglePhotos,
    searchPhotos,
    importPhotos,
    loading,
    error
  };
};

// Media Management Hooks
export const useMediaLibrary = (page: number = 1, limit: number = 20) => {
  const api = useAPI();
  return useAPICall(() => api.getMediaLibrary(page, limit), [page, limit]);
};

export const useMediaOperations = () => {
  const api = useAPI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMedia = async (file: File, tags: string[] = []) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.uploadMedia(file, tags);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMedia = async (mediaId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.deleteMedia(mediaId);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchMedia = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.searchMedia(query);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadMedia,
    deleteMedia,
    searchMedia,
    loading,
    error
  };
};

// AI Content Generation Hooks
export const useAIContentGeneration = () => {
  const api = useAPI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCaption = async (request: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateCaption(request);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateHashtags = async (request: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateHashtags(request);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const optimizeContent = async (request: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.optimizeContent(request);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const enhanceImage = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.enhanceImage(file);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateCaption,
    generateHashtags,
    optimizeContent,
    enhanceImage,
    loading,
    error
  };
};

// Scheduling Hooks
export const useSchedules = () => {
  const api = useAPI();
  return useAPICall<ScheduledPost[]>(() => api.getSchedules());
};

export const useScheduleOperations = () => {
  const api = useAPI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSchedule = async (scheduleData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.createSchedule(scheduleData);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (scheduleId: string, scheduleData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.updateSchedule(scheduleId, scheduleData);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.deleteSchedule(scheduleId);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const publishPost = async (postData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.publishPost(postData);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    publishPost,
    loading,
    error
  };
};

// Analytics Hooks
export const useAnalyticsOverview = (dateRange?: { start: string; end: string }) => {
  const api = useAPI();
  return useAPICall<AnalyticsOverview>(() => api.getAnalyticsOverview(dateRange), [dateRange]);
};

export const usePostAnalytics = () => {
  const api = useAPI();
  return useAPICall<PostAnalytics[]>(() => api.getPostAnalytics());
};

export const usePlatformAnalytics = () => {
  const api = useAPI();
  return useAPICall(() => api.getPlatformAnalytics());
};

// Compliance Hooks
export const useComplianceOperations = () => {
  const api = useAPI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCompliance = async (checkData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.checkCompliance(checkData);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getComplianceRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getComplianceRules();
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkCompliance,
    getComplianceRules,
    loading,
    error
  };
};

// Video Processing Hooks
export const useVideoProcessing = () => {
  const api = useAPI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateHighlights = async (videoFile: File, options: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateHighlights(videoFile, options);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createStoryClips = async (videoFile: File, maxDuration: number = 60) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.createStoryClips(videoFile, maxDuration);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnails = async (videoFile: File, count: number = 5) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateThumbnails(videoFile, count);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateHighlights,
    createStoryClips,
    generateThumbnails,
    loading,
    error
  };
};

// Processing Jobs Hooks
export const useProcessingJobs = () => {
  const api = useAPI();
  return useAPICall(() => api.listProcessingJobs());
};

export const useProcessingJob = (jobId: string) => {
  const api = useAPI();
  return useAPICall(() => api.getProcessingJob(jobId), [jobId]);
}; 