/**
 * Centralized API Configuration for Crow's Eye Platform
 * Handles all API endpoints, authentication, and request configurations
 */

// API Configuration
export const API_CONFIG = {
  // Base URLs
  CROW_EYE_API: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8001' 
    : 'https://crow-eye-api-605899951231.us-central1.run.app',
  
  // API Endpoints
  ENDPOINTS: {
    // Health & Status
    HEALTH: '/health',
    
    // Authentication
    AUTH: {
      LOGIN: '/api/auth/login',
      ME: '/api/auth/me',
      LOGOUT: '/api/auth/logout',
    },
    
    // Media Management
    MEDIA: {
      BASE: '/api/media/',
      UPLOAD: '/api/media/',
      DELETE: (id: string) => `/api/media/${id}`,
      GET: (id: string) => `/api/media/${id}`,
      DOWNLOAD: (id: string) => `/api/media/${id}/download`,
      GENERATE_CAPTION: '/api/media/generate-caption',
      EDIT: '/api/media/edit',
      BATCH: '/api/media/batch',
    },
    
    // Smart Galleries
    GALLERY: {
      BASE: '/api/gallery/',
      CREATE: '/api/gallery/',
      GET: (id: string) => `/api/gallery/${id}`,
      UPDATE: (id: string) => `/api/gallery/${id}`,
      DELETE: (id: string) => `/api/gallery/${id}`,
    },
    
    // Story Formatting
    STORIES: {
      BASE: '/api/stories/',
      CREATE: '/api/stories/',
      GET: (id: string) => `/api/stories/${id}`,
      DELETE: (id: string) => `/api/stories/${id}`,
      TEMPLATES: '/api/stories/templates/',
    },
    
    // Highlight Reels
    HIGHLIGHTS: {
      BASE: '/api/highlights/',
      CREATE: '/api/highlights/',
      STATUS: (id: string) => `/api/highlights/${id}/status`,
      STYLES: '/api/highlights/styles/',
    },
    
    // Audio Import
    AUDIO: {
      BASE: '/api/audio/',
      IMPORT: '/api/audio/',
      EDIT: (id: string) => `/api/audio/${id}/edit`,
      ANALYZE: (id: string) => `/api/audio/${id}/analyze`,
      EFFECTS: '/api/audio/effects/',
    },
    
    // Analytics
    ANALYTICS: {
      BASE: '/api/analytics/',
      EXPORT: '/api/analytics/export',
      INSIGHTS: '/api/analytics/insights/',
      COMPETITORS: '/api/analytics/competitors/',
      SUMMARY: '/api/analytics/summary/',
    },
    
    // Admin
    ADMIN: {
      ACCOUNTS: '/api/admin/accounts/',
      ACCOUNT: (id: string) => `/api/admin/accounts/${id}`,
    },
  },
  
  // Request Configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Authentication
  TOKEN_STORAGE_KEY: 'crow-eye-api-token',
  CONFIG_STORAGE_KEY: 'crow-eye-api-config',
  
  // Request Timeouts
  TIMEOUT: {
    DEFAULT: 30000, // 30 seconds
    UPLOAD: 300000, // 5 minutes
    DOWNLOAD: 120000, // 2 minutes
  },
} as const;

// Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

// Error Types
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utility function to build API URLs
export function buildApiUrl(endpoint: string, baseUrl?: string): string {
  const base = baseUrl || API_CONFIG.CROW_EYE_API;
  return `${base}${endpoint}`;
}

// Utility function to get stored auth token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

// Utility function to store auth token
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, token);
  } catch {
    // Handle storage errors silently
  }
}

// Utility function to clear auth token
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
  } catch {
    // Handle storage errors silently
  }
} 