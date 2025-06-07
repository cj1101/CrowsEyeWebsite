/**
 * Unified Crow's Eye API Hook
 * Combines all API functionality in one comprehensive hook
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { crowEyeAPI } from '../lib/api/crow-eye-api';
import type {
  MediaFile,
  Gallery,
  Story,
  HighlightReel,
  AudioFile,
  AnalyticsData,
  AuthResponse,
  User,
  UploadProgress,
} from '../types/api';

// Hook state interfaces
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UploadState {
  uploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
}

// Main hook interface
interface UseCrowEyeReturn {
  // Authentication
  auth: {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
  };
  
  // Media Management
  media: {
    items: MediaFile[];
    loading: boolean;
    error: string | null;
    upload: (file: File) => Promise<MediaFile | null>;
    delete: (id: string) => Promise<boolean>;
    refresh: () => Promise<void>;
    uploadState: UploadState;
  };
  
  // Galleries
  galleries: {
    items: Gallery[];
    loading: boolean;
    error: string | null;
    create: (prompt: string, maxItems?: number, generateCaption?: boolean) => Promise<Gallery | null>;
    update: (id: string, data: Partial<Gallery>) => Promise<Gallery | null>;
    delete: (id: string) => Promise<boolean>;
    refresh: () => Promise<void>;
  };
  
  // Utils
  utils: {
    healthCheck: () => Promise<boolean>;
    isOnline: boolean;
  };
}

export function useCrowEye(): UseCrowEyeReturn {
  // Authentication State
  const [authState, setAuthState] = useState<ApiState<User>>({
    data: null,
    loading: false,
    error: null,
  });
  
  // Media State
  const [mediaState, setMediaState] = useState<ApiState<MediaFile[]>>({
    data: [],
    loading: false,
    error: null,
  });
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: null,
    error: null,
  });
  
  // Gallery State
  const [galleryState, setGalleryState] = useState<ApiState<Gallery[]>>({
    data: [],
    loading: false,
    error: null,
  });
  
  // Utility State
  const [isOnline, setIsOnline] = useState(true);
  
  // Generic error handler
  const handleError = useCallback((error: any, setter: React.Dispatch<React.SetStateAction<any>>) => {
    const errorMessage = error?.message || 'An unexpected error occurred';
    setter((prev: any) => ({
      ...prev,
      loading: false,
      error: errorMessage,
    }));
  }, []);
  
  // Authentication Methods
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await crowEyeAPI.login(email, password);
      const user = response.user as User;
      setAuthState({ data: user, loading: false, error: null });
      return true;
    } catch (error) {
      handleError(error, setAuthState);
      return false;
    }
  }, [handleError]);
  
  const logout = useCallback(() => {
    crowEyeAPI.logout();
    setAuthState({ data: null, loading: false, error: null });
  }, []);
  
  // Media Methods
  const refreshMedia = useCallback(async () => {
    setMediaState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const items = await crowEyeAPI.getMediaFiles();
      setMediaState({ data: items, loading: false, error: null });
    } catch (error) {
      handleError(error, setMediaState);
    }
  }, [handleError]);
  
  const uploadMedia = useCallback(async (file: File): Promise<MediaFile | null> => {
    setUploadState({ uploading: true, progress: null, error: null });
    
    try {
      const mediaFile = await crowEyeAPI.uploadMedia(file);
      
      // Update media list
      setMediaState(prev => ({
        ...prev,
        data: prev.data ? [mediaFile, ...prev.data] : [mediaFile],
      }));
      
      setUploadState({ uploading: false, progress: null, error: null });
      return mediaFile;
    } catch (error) {
      setUploadState({ 
        uploading: false, 
        progress: null, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      });
      return null;
    }
  }, []);
  
  const deleteMedia = useCallback(async (id: string): Promise<boolean> => {
    try {
      await crowEyeAPI.deleteMedia(id);
      setMediaState(prev => ({
        ...prev,
        data: prev.data?.filter(item => item.id !== id) || [],
      }));
      return true;
    } catch (error) {
      handleError(error, setMediaState);
      return false;
    }
  }, [handleError]);
  
  // Gallery Methods
  const refreshGalleries = useCallback(async () => {
    setGalleryState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const items = await crowEyeAPI.getGalleries();
      setGalleryState({ data: items, loading: false, error: null });
    } catch (error) {
      handleError(error, setGalleryState);
    }
  }, [handleError]);
  
  const createGallery = useCallback(async (
    prompt: string, 
    maxItems = 5, 
    generateCaption = true
  ): Promise<Gallery | null> => {
    try {
      const gallery = await crowEyeAPI.createGallery(prompt, maxItems, generateCaption);
      setGalleryState(prev => ({
        ...prev,
        data: prev.data ? [gallery, ...prev.data] : [gallery],
      }));
      return gallery;
    } catch (error) {
      handleError(error, setGalleryState);
      return null;
    }
  }, [handleError]);
  
  const updateGallery = useCallback(async (
    id: string, 
    data: Partial<Gallery>
  ): Promise<Gallery | null> => {
    try {
      const updatedGallery = await crowEyeAPI.updateGallery(id, data);
      setGalleryState(prev => ({
        ...prev,
        data: prev.data?.map(item => item.id === id ? updatedGallery : item) || [],
      }));
      return updatedGallery;
    } catch (error) {
      handleError(error, setGalleryState);
      return null;
    }
  }, [handleError]);
  
  const deleteGallery = useCallback(async (id: string): Promise<boolean> => {
    try {
      await crowEyeAPI.deleteGallery(id);
      setGalleryState(prev => ({
        ...prev,
        data: prev.data?.filter(item => item.id !== id) || [],
      }));
      return true;
    } catch (error) {
      handleError(error, setGalleryState);
      return false;
    }
  }, [handleError]);
  
  // Utility Methods
  const healthCheck = useCallback(async (): Promise<boolean> => {
    try {
      const result = await crowEyeAPI.healthCheck();
      const online = result.status === 'healthy';
      setIsOnline(online);
      return online;
    } catch (error) {
      setIsOnline(false);
      return false;
    }
  }, []);
  
  // Initialize on mount
  useEffect(() => {
    if (crowEyeAPI.isAuthenticated()) {
      // Load initial data if authenticated
      refreshMedia();
      refreshGalleries();
    }
  }, [refreshMedia, refreshGalleries]);
  
  // Return unified interface
  return {
    auth: {
      user: authState.data,
      loading: authState.loading,
      error: authState.error,
      login,
      logout,
      isAuthenticated: crowEyeAPI.isAuthenticated(),
    },
    
    media: {
      items: mediaState.data || [],
      loading: mediaState.loading,
      error: mediaState.error,
      upload: uploadMedia,
      delete: deleteMedia,
      refresh: refreshMedia,
      uploadState,
    },
    
    galleries: {
      items: galleryState.data || [],
      loading: galleryState.loading,
      error: galleryState.error,
      create: createGallery,
      update: updateGallery,
      delete: deleteGallery,
      refresh: refreshGalleries,
    },
    
    utils: {
      healthCheck,
      isOnline,
    },
  };
} 