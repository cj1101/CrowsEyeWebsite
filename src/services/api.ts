import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://crow-eye-api-dot-crows-eye-website.uc.r.appspot.com' 
  : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health checks
  healthCheck: () => api.get('/health'),
  apiHealthCheck: () => api.get('/api/v1/health'),

  // Media management
  uploadMedia: (files: FormData, onProgress?: (progress: number) => void) => 
    api.post('/api/v1/media/upload', files, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }),

  getMedia: (params?: { page?: number; limit?: number; type?: string; search?: string }) => 
    api.get('/api/v1/media', { params }),

  deleteMedia: (id: string) => api.delete(`/api/v1/media/${id}`),

  updateMediaMetadata: (id: string, metadata: any) => 
    api.patch(`/api/v1/media/${id}`, metadata),

  // Post management
  createPost: (post: any) => api.post('/api/v1/posts', post),
  
  getPosts: (params?: { page?: number; limit?: number; status?: string; platform?: string }) => 
    api.get('/api/v1/posts', { params }),

  updatePost: (id: string, updates: any) => api.patch(`/api/v1/posts/${id}`, updates),

  deletePost: (id: string) => api.delete(`/api/v1/posts/${id}`),

  schedulePost: (id: string, scheduledFor: Date) => 
    api.post(`/api/v1/posts/${id}/schedule`, { scheduledFor }),

  publishPost: (id: string) => api.post(`/api/v1/posts/${id}/publish`),

  // Bulk operations
  bulkUpdatePosts: (ids: string[], updates: any) => 
    api.patch('/api/v1/posts/bulk', { ids, updates }),

  bulkDeletePosts: (ids: string[]) => 
    api.delete('/api/v1/posts/bulk', { data: { ids } }),

  // AI Services
  generateHighlight: (mediaId: string, settings?: any) => 
    api.post('/api/v1/ai/generate-highlight', { mediaId, ...settings }),

  generateCaption: (content: string, platform?: string, tone?: string) => 
    api.post('/api/v1/ai/generate-caption', { content, platform, tone }),

  optimizeContent: (content: string, platform: string) => 
    api.post('/api/v1/ai/optimize-content', { content, platform }),

  generateHashtags: (content: string, count?: number) => 
    api.post('/api/v1/ai/generate-hashtags', { content, count }),

  analyzeContent: (mediaId: string) => 
    api.post('/api/v1/ai/analyze-content', { mediaId }),

  // Analytics
  getAnalytics: (params?: { 
    timeRange?: string; 
    platform?: string; 
    metrics?: string[] 
  }) => api.get('/api/v1/analytics', { params }),

  getPostAnalytics: (postId: string) => 
    api.get(`/api/v1/analytics/posts/${postId}`),

  getEngagementMetrics: (params?: { 
    startDate?: string; 
    endDate?: string; 
    platform?: string 
  }) => api.get('/api/v1/analytics/engagement', { params }),

  getTrendAnalysis: (params?: { 
    timeRange?: string; 
    contentType?: string 
  }) => api.get('/api/v1/analytics/trends', { params }),

  exportAnalytics: (format: 'pdf' | 'csv', params?: any) => 
    api.get(`/api/v1/analytics/export`, { 
      params: { format, ...params },
      responseType: 'blob'
    }),

  // Platform integrations
  connectPlatform: (platform: string, credentials: any) => 
    api.post(`/api/v1/integrations/${platform}/connect`, credentials),

  disconnectPlatform: (platform: string) => 
    api.delete(`/api/v1/integrations/${platform}`),

  getPlatformStatus: () => api.get('/api/v1/integrations/status'),

  // User settings
  getUserSettings: () => api.get('/api/v1/settings'),

  updateUserSettings: (settings: any) => 
    api.patch('/api/v1/settings', settings),

  // Real-time features (WebSocket would be handled separately)
  subscribeToUpdates: (callback: (data: any) => void) => {
    // WebSocket implementation would go here
    console.log('WebSocket subscription not implemented yet');
  }
};

export default api; 