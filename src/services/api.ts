import axios from 'axios';

const API_BASE_URL = 'https://crow-eye-api-dot-crows-eye-website.uc.r.appspot.com/api/v1';
const DEVELOPMENT_FALLBACK = process.env.NODE_ENV === 'development';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduced timeout for faster fallback
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for fallback
const mockData = {
  media: [
    {
      id: '1',
      name: 'sample-image.jpg',
      content_type: 'image/jpeg',
      url: '/images/placeholder-image.jpg',
      file_size: 245760,
      created_at: '2024-01-15T10:30:00Z',
      tags: ['sample', 'demo'],
      platforms: ['instagram', 'facebook']
    },
    {
      id: '2',
      name: 'demo-video.mp4',
      content_type: 'video/mp4',
      url: '/videos/placeholder-video.mp4',
      thumbnail_url: '/images/video-thumb.jpg',
      file_size: 15728640,
      created_at: '2024-01-14T14:20:00Z',
      tags: ['video', 'demo'],
      platforms: ['youtube', 'tiktok']
    }
  ],
  health: { status: 'ok', timestamp: new Date().toISOString() }
};

// Helper function to create mock responses
const mockResponse = (data: any, delay: number = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, status: 200, statusText: 'OK' });
    }, delay);
  });
};

// Helper function to handle API calls with fallback
const apiWithFallback = async (apiCall: () => Promise<any>, mockResponseData: any) => {
  console.log('🔄 apiWithFallback called, DEVELOPMENT_FALLBACK:', DEVELOPMENT_FALLBACK);
  
  if (!DEVELOPMENT_FALLBACK) {
    console.log('🚀 Production mode - making direct API call');
    return apiCall();
  }
  
  try {
    console.log('🔧 Development mode - attempting API call first');
    const result = await apiCall();
    console.log('✅ API call succeeded in development mode:', result?.status);
    
    // Check if API indicates it's not fully implemented
    if (result?.data?.status === 'available' && result?.data?.note?.includes('coming soon')) {
      console.log('⚠️ API endpoint exists but is not fully implemented, using mock data');
      const mockResult = await mockResponse(mockResponseData);
      console.log('🎭 Returning mock response due to unimplemented API:', mockResult);
      return mockResult;
    }
    
    return result;
  } catch (error: any) {
    console.warn('❌ API call failed, using mock data:', error?.message || 'Unknown error');
    console.log('📊 Error details:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: error?.config?.url
    });
    const mockResult = await mockResponse(mockResponseData);
    console.log('🎭 Returning mock response:', mockResult);
    return mockResult;
  }
};

// Request interceptor for authentication
api.interceptors.request.use(async (config) => {
  try {
    // Try to get Firebase auth token first
    const { auth } = await import('@/lib/firebase');
    if (auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback to localStorage token
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    // Continue without token
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Store current path for redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/auth/signin' && currentPath !== '/auth/signup') {
        localStorage.setItem('redirectAfterLogin', currentPath);
      }
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health checks
  healthCheck: () => apiWithFallback(() => api.get('/health'), mockData.health),
  apiHealthCheck: () => apiWithFallback(() => api.get('/health'), mockData.health),

  // === AI CONTENT GENERATION (Updated to match backend) ===
  
  // AI Caption Generation (Updated to match new backend naming)
  generateCaptionsFromMedia: (data: {
    media_ids: number[];
    style: 'engaging' | 'professional' | 'casual' | 'funny';
    platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube';
    auto_apply?: boolean;
  }) => apiWithFallback(() => api.post('/ai/captions/generate-from-media', data), { 
    captions: ['🌟 Amazing content coming your way! #exciting #demo'] 
  }),

  generateCustomCaptions: (data: {
    content: string;
    tone: string;
    platform: string;
    audience?: string;
    brand_voice?: string;
  }) => apiWithFallback(() => api.post('/ai/captions/generate-custom', data), {
    captions: ['✨ Custom caption generated for your content! #AI #creative']
  }),

  // AI Hashtag Generation (Updated to match new backend naming)
  generateHashtags: (data: {
    content: string;
    platforms?: string[];
    niche?: string;
    count?: number;
    trending?: boolean;
  }) => apiWithFallback(() => api.post('/ai/hashtags/generate', data), {
    hashtags: ['#content', '#social', '#marketing', '#demo', '#AI']
  }),

  // AI Content Suggestions (Updated to match new backend naming)
  generateContentSuggestions: (data: {
    content: string;
    platform?: string;
    variation_count?: number;
    improvement_focus?: string;
  }) => apiWithFallback(() => api.post('/ai/content/suggestions', data), {
    suggestions: ['Try adding more emojis!', 'Consider a call-to-action', 'Include trending hashtags']
  }),

  // AI Content Ideas (Updated to match new backend naming)
  generateContentIdeas: (data: {
    topic?: string;
    platform?: string;
    content_type?: string;
    audience?: string;
    brand_voice?: string;
    count?: number;
  }) => apiWithFallback(() => api.post('/ai/content/ideas', data), {
    ideas: ['Behind-the-scenes content', 'User-generated content campaign', 'Tutorial series']
  }),

  // Imagen 3 Image Generation (Updated to match backend)
  generateImages: (data: {
    prompt: string;
    style: 'photorealistic' | 'artistic' | 'cartoon';
    aspect_ratio: '1:1' | '16:9' | '4:5';
    quality: 'standard' | 'hd';
    count?: number;
  }) => apiWithFallback(() => api.post('/ai/images/generate', data), {
    images: [{ url: '/images/placeholder-image.jpg', id: 'generated-1' }]
  }),

  // Veo Video Generation (Updated to match backend)
  generateVideos: (data: {
    prompt: string;
    duration?: number;
    style?: string;
    aspect_ratio?: string;
    fps?: number;
  }) => apiWithFallback(() => api.post('/ai/videos/generate', data), {
    videos: [{ url: '/videos/placeholder-video.mp4', id: 'generated-video-1' }]
  }),

  // Highlight Reel Generation (Updated to match backend)
  generateHighlights: (data: {
    media_ids: number[];
    duration: number;
    highlight_type: string;
    style: string;
    include_text: boolean;
    include_music: boolean;
    context_padding?: number;
    content_instructions?: string;
    example?: {
      start_time?: number;
      end_time?: number;
      description?: string;
    };
  }) => apiWithFallback(() => api.post('/ai/highlights/generate', data), {
    highlight: { url: '/videos/highlight-reel.mp4', id: 'highlight-1' }
  }),

  // === MEDIA PROCESSING (Updated to match backend) ===
  
  // Media Upload (Updated to match backend)
  uploadMedia: async (formData: FormData, onProgress?: (progress: number) => void) => {
    console.log('🚀 uploadMedia called in API service');
    console.log('📝 Development fallback mode:', DEVELOPMENT_FALLBACK);
    console.log('🌐 API Base URL:', API_BASE_URL);
    
    const uploadCall = () => {
      console.log('📤 Making actual API call to /media/upload');
      return api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 second timeout for uploads
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('📊 Upload progress:', progress + '%');
            onProgress(progress);
          }
        },
      });
    };

    // Mock response that matches the expected format
    const mockUploadResponse = {
      data: {
        id: Date.now().toString(),
        name: (formData.get('name') as string) || 'uploaded-file.jpg',
        content_type: 'image/jpeg', // Would be determined by backend
        url: '/images/placeholder-image.jpg',
        thumbnail_url: '/images/placeholder-image.jpg',
        file_size: 1024000,
        created_at: new Date().toISOString(),
        tags: ['uploaded', 'media', 'local-storage'],
        platforms: [],
        _isLocalOnly: true // Flag to indicate this is not actually stored on server
      }
    };

    // Simulate upload progress for mock data
    if (DEVELOPMENT_FALLBACK && onProgress) {
      console.log('🎭 Using simulated upload progress');
      return new Promise((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          onProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            console.log('✅ Simulated progress complete, calling apiWithFallback');
            // Try API first, fallback to mock
            apiWithFallback(uploadCall, mockUploadResponse)
              .then((result) => {
                console.log('🎯 apiWithFallback result:', result);
                resolve(result);
              })
              .catch((error) => {
                console.error('❌ apiWithFallback error:', error);
                reject(error);
              });
          }
        }, 200);
      });
    }

    console.log('⚡ Calling apiWithFallback directly (no progress simulation)');
    return apiWithFallback(uploadCall, mockUploadResponse)
      .then((result) => {
        console.log('🎯 Direct apiWithFallback result:', result);
        return result;
      })
      .catch((error) => {
        console.error('❌ Direct apiWithFallback error:', error);
        throw error;
      });
  },

  // Get Media (Updated to match backend)
  getMedia: (mediaId: string) => apiWithFallback(() => api.get(`/media/${mediaId}`), 
    mockData.media.find(m => m.id === mediaId) || mockData.media[0]
  ),
  
  // Get All Media/Library (New method)
  getMediaLibrary: () => apiWithFallback(() => api.get('/media'), mockData.media),

  // Video Processing (Updated to match backend)
  processVideo: (data: {
    video_id: string;
    operations: Array<{
      type: 'trim' | 'resize' | 'add_captions' | 'compress' | 'extract_audio' | 'add_effects';
      [key: string]: any;
    }>;
    output_format: 'mp4' | 'webm' | 'mov';
    quality?: string;
  }) => api.post('/media/video/process', data),

  // Media Tags Generation (Updated to match new backend naming)
  generateMediaTags: (mediaId: string, data?: {
    auto_detect?: boolean;
    custom_tags?: string[];
    confidence_threshold?: number;
  }) => api.post(`/ai/media/${mediaId}/tags/generate`, data),

  // Bulk Media Tags Generation (Updated to match new backend naming)
  generateBulkMediaTags: (data: {
    media_ids: string[];
    auto_detect?: boolean;
    custom_tags?: string[];
    confidence_threshold?: number;
  }) => api.post('/ai/media/tags/bulk-generate', data),

  // Thumbnail Generation (Updated to match backend)
  generateThumbnails: (data: {
    video_id: string;
    timestamp?: number;
    count?: number;
    style?: 'auto' | 'cinematic' | 'bright';
  }) => api.post('/media/thumbnails/generate', data),

  // === ANALYTICS & PERFORMANCE (Updated to match backend) ===
  
  // Performance Analytics (Updated to match backend)
  getPerformanceAnalytics: (params?: {
    start_date?: string;
    end_date?: string;
    metrics?: string;
    platform?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.metrics) queryParams.append('metrics', params.metrics);
    if (params?.platform) queryParams.append('platform', params.platform);
    
    const endpoint = params?.platform 
      ? `/analytics/performance/${params.platform}`
      : '/analytics/performance';
    
    return api.get(`${endpoint}?${queryParams.toString()}`);
  },

  // Track Analytics (Updated to match backend)
  trackAnalytics: (data: {
    event_type: string;
    platform: string;
    content_id?: string;
    engagement_type?: string;
    timestamp?: string;
  }) => api.post('/analytics/track', data),

  // === BULK OPERATIONS (Updated to match backend) ===
  
  // Bulk Upload (Updated to match backend)
  bulkUpload: (data: {
    files: Array<{
      filename: string;
      size: number;
      type: string;
    }>;
    folder_path?: string;
    auto_process?: boolean;
    processing_options?: Record<string, any>;
  }) => api.post('/bulk/upload', data),

  // Bulk Schedule (Updated to match backend)
  bulkSchedule: (data: {
    posts: Array<{
      id: string;
      scheduled_time: string;
    }>;
    schedule_options?: {
      timezone?: string;
      auto_optimize?: boolean;
    };
    platforms?: string[];
  }) => api.post('/bulk/schedule', data),

  // Bulk Job Status (Updated to match backend)
  getBulkJobStatus: (jobId: string) => api.get(`/bulk/status/${jobId}`),

  // === PLATFORM PREVIEWS (Updated to match backend) ===
  
  // Generate Previews (Updated to match backend)
  generatePreviews: (data: {
    content: {
      caption: string;
      hashtags?: string[];
      media_url?: string;
      media_type?: string;
    };
    platforms: string[];
    preview_type?: 'post' | 'story';
  }) => api.post('/previews/generate', data),

  // Get Preview (Updated to match backend)
  getPreview: (previewId: string, platform?: string) => {
    const params = platform ? `?platform=${platform}` : '';
    return api.get(`/previews/${previewId}${params}`);
  },

  // === LEGACY ENDPOINTS (keeping for backward compatibility) ===
  
  // Post management (existing functionality)
  createPost: (post: any) => api.post('/posts', post),
  getPosts: (params?: { page?: number; limit?: number; status?: string; platform?: string }) => 
    api.get('/posts', { params }),
  updatePost: (id: string, updates: any) => api.patch(`/posts/${id}`, updates),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  schedulePost: (id: string, scheduledFor: Date) => 
    api.post(`/posts/${id}/schedule`, { scheduledFor }),
  publishPost: (id: string) => api.post(`/posts/${id}/publish`),

  // Platform integrations (existing functionality)
  connectPlatform: (platform: string, credentials: any) => 
    api.post(`/integrations/${platform}/connect`, credentials),
  disconnectPlatform: (platform: string) => 
    api.delete(`/integrations/${platform}`),
  getPlatformStatus: () => api.get('/integrations/status'),

  // User settings (existing functionality)
  getUserSettings: () => api.get('/settings'),
  updateUserSettings: (settings: any) => api.patch('/settings', settings),

  // === COMPLIANCE & PLATFORM REQUIREMENTS ===
  
  // Comprehensive Compliance Audit
  comprehensiveComplianceCheck: () => api.get('/compliance/compliance/comprehensive-check'),

  // Platform-specific Requirements
  getPlatformRequirements: (platformId: string) => api.get(`/compliance/compliance/platform/${platformId}`),

  // All Platforms Compliance Overview
  getPlatformsSummary: () => api.get('/compliance/compliance/platforms/summary'),

  // Rate Limiting Information
  getRateLimits: () => api.get('/compliance/compliance/rate-limits'),

  // Authentication Requirements
  getAuthRequirements: () => api.get('/compliance/compliance/authentication-requirements'),

  // Content Policies
  getContentPolicies: () => api.get('/compliance/compliance/content-policies'),

  // Privacy Requirements
  getPrivacyRequirements: () => api.get('/compliance/compliance/privacy-requirements'),

  // Content Validation
  validateContent: (data: {
    content: string;
    platform: string;
    content_type: 'text' | 'image' | 'video' | 'story';
    media_urls?: string[];
    metadata?: Record<string, any>;
  }) => api.post('/compliance/compliance/validate-content', data),

  // Compliance System Health Check
  complianceHealthCheck: () => api.get('/compliance/compliance/health-check'),

  // === UTILITY FUNCTIONS ===
  
  // Check if backend is responsive
  ping: () => api.get('/ping'),
  
  // Get API version info
  getVersion: () => api.get('/version'),
  
  // Real-time features (WebSocket would be handled separately)
  subscribeToUpdates: (callback: (data: any) => void) => {
    // WebSocket implementation would go here
    console.log('WebSocket subscription not implemented yet');
  }
};

export default api; 