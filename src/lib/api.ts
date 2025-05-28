import useSWR, { SWRConfiguration } from 'swr';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.crowseye.tech';

// Types for API responses
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface MediaItem {
  id: string;
  filename: string;
  type: 'image' | 'video' | 'audio';
  size: number;
  uploadedAt: string;
  url?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

export interface Gallery {
  id: string;
  prompt: string;
  mediaItems: MediaItem[];
  createdAt: string;
  status: 'processing' | 'completed' | 'failed';
}

export interface Story {
  id: string;
  fileId: string;
  caption: string;
  content: string;
  createdAt: string;
  status: 'processing' | 'completed' | 'failed';
}

export interface HighlightReel {
  id: string;
  videoId: string;
  options: Record<string, any>;
  outputUrl?: string;
  createdAt: string;
  status: 'processing' | 'completed' | 'failed';
}

export interface AnalyticsData {
  totalMedia: number;
  totalGalleries: number;
  totalStories: number;
  totalHighlights: number;
  storageUsed: number;
  lastUpdated: string;
}

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = (): string | null => {
  return authToken;
};

// Fetch wrapper with authentication
export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`,
        data: undefined,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      data: undefined,
    };
  }
};

// SWR fetcher function
export const swrFetcher = async (url: string) => {
  const response = await apiFetch(url);
  if (!response.success) {
    throw new Error(response.error || 'API request failed');
  }
  return response.data;
};

// Custom hook for SWR with API integration
export const useApiSWR = <T = any>(
  endpoint: string | null,
  config?: SWRConfiguration
) => {
  return useSWR<T>(endpoint, swrFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    ...config,
  });
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  
  // Media
  MEDIA: '/media',
  MEDIA_UPLOAD: '/media/upload',
  
  // Gallery
  GALLERY: '/gallery',
  
  // Stories
  STORIES: '/stories',
  
  // Highlights (Creator+ only)
  HIGHLIGHTS: '/highlights',
  
  // Audio Import (Creator+ only)
  AUDIO_IMPORT: '/audio/import',
  
  // Analytics (Pro+ only)
  ANALYTICS: '/analytics',
  ANALYTICS_EXPORT: '/analytics/export',
} as const;

export default apiFetch; 