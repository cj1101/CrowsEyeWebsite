/**
 * Unified Crow's Eye API Hook
 * Simplified version that works with the mock API
 */

import { useState, useCallback, useEffect } from 'react';
import { crowsEyeAPI } from '../lib/api';

// Simplified hook interface
interface UseCrowEyeReturn {
  // Authentication
  auth: {
    user: any | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
  };
  
  // Media Management
  media: {
    items: any[];
    loading: boolean;
    error: string | null;
    upload: (file: File) => Promise<any | null>;
    delete: (id: string) => Promise<boolean>;
    refresh: () => Promise<void>;
    uploading: boolean;
  };
  
  // Galleries
  galleries: {
    items: any[];
    loading: boolean;
    error: string | null;
    create: (request: any) => Promise<any | null>;
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
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Media State
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Gallery State
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  
  // Utility State
  const [isOnline, setIsOnline] = useState(true);
  
  // Authentication Methods
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await crowsEyeAPI.login(email, password);
      if (response.data) {
        setUser(response.data.user);
        return true;
      } else {
        setAuthError(response.error || 'Login failed');
        return false;
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);
  
  const logout = useCallback(() => {
    setUser(null);
    setAuthError(null);
  }, []);
  
  // Media Methods
  const refreshMedia = useCallback(async () => {
    setMediaLoading(true);
    setMediaError(null);
    try {
      const response = await crowsEyeAPI.listMedia();
      if (response.data) {
        setMediaItems(response.data.media || []);
      } else {
        setMediaError(response.error || 'Failed to fetch media');
      }
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Failed to fetch media');
    } finally {
      setMediaLoading(false);
    }
  }, []);
  
  const uploadMedia = useCallback(async (file: File): Promise<any | null> => {
    setUploading(true);
    try {
      const response = await crowsEyeAPI.uploadMedia(file);
      if (response.data) {
        setMediaItems(prev => [response.data, ...prev]);
        return response.data;
      } else {
        setMediaError(response.error || 'Upload failed');
        return null;
      }
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);
  
  const deleteMedia = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await crowsEyeAPI.deleteMedia(id);
      if (response.data) {
        setMediaItems(prev => prev.filter(item => item.id !== id));
        return true;
      } else {
        setMediaError(response.error || 'Delete failed');
        return false;
      }
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Delete failed');
      return false;
    }
  }, []);
  
  // Gallery Methods
  const refreshGalleries = useCallback(async () => {
    setGalleryLoading(true);
    setGalleryError(null);
    try {
      const response = await crowsEyeAPI.listGalleries();
      if (response.data) {
        setGalleryItems(response.data.galleries || []);
      } else {
        setGalleryError(response.error || 'Failed to fetch galleries');
      }
    } catch (error) {
      setGalleryError(error instanceof Error ? error.message : 'Failed to fetch galleries');
    } finally {
      setGalleryLoading(false);
    }
  }, []);
  
  const createGallery = useCallback(async (request: any): Promise<any | null> => {
    try {
      const response = await crowsEyeAPI.createGallery(request);
      if (response.data) {
        setGalleryItems(prev => [response.data, ...prev]);
        return response.data;
      } else {
        setGalleryError(response.error || 'Failed to create gallery');
        return null;
      }
    } catch (error) {
      setGalleryError(error instanceof Error ? error.message : 'Failed to create gallery');
      return null;
    }
  }, []);
  
  const deleteGallery = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await crowsEyeAPI.deleteGallery(id);
      if (response.data) {
        setGalleryItems(prev => prev.filter(item => item.id !== id));
        return true;
      } else {
        setGalleryError(response.error || 'Delete failed');
        return false;
      }
    } catch (error) {
      setGalleryError(error instanceof Error ? error.message : 'Delete failed');
      return false;
    }
  }, []);
  
  // Utility Methods
  const healthCheck = useCallback(async (): Promise<boolean> => {
    try {
      const response = await crowsEyeAPI.healthCheck();
      const online = !!response.data;
      setIsOnline(online);
      return online;
    } catch (error) {
      setIsOnline(false);
      return false;
    }
  }, []);
  
  // Initialize on mount
  useEffect(() => {
    healthCheck();
    refreshMedia();
    refreshGalleries();
  }, [healthCheck, refreshMedia, refreshGalleries]);
  
  return {
    auth: {
      user,
      loading: authLoading,
      error: authError,
      login,
      logout,
      isAuthenticated: !!user,
    },
    
    media: {
      items: mediaItems,
      loading: mediaLoading,
      error: mediaError,
      upload: uploadMedia,
      delete: deleteMedia,
      refresh: refreshMedia,
      uploading,
    },
    
    galleries: {
      items: galleryItems,
      loading: galleryLoading,
      error: galleryError,
      create: createGallery,
      delete: deleteGallery,
      refresh: refreshGalleries,
    },
    
    utils: {
      healthCheck,
      isOnline,
    },
  };
} 