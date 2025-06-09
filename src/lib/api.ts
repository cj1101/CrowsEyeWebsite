/**
 * Crow's Eye API Client - FastAPI Backend Implementation
 * Connects to the FastAPI backend running on localhost:8000
 */

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : 'http://localhost:8000'; // Update this for production

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  upload_date: string;
  url: string;
}

export interface AudioItem {
  id: string;
  filename: string;
  name: string;
  description?: string;
  duration: number;
  format: string;
  size: number;
  sample_rate: number;
  channels: number;
  tags: string[];
  created_at: string;
  url: string;
  waveform_url?: string;
}

export interface AnalyticsData {
  period: string;
  total_posts: number;
  total_engagement: number;
  avg_engagement_rate: number;
  top_performing_content: Array<{
    id: string;
    type: string;
    engagement: number;
    engagement_rate: number;
    platform: string;
  }>;
  platform_breakdown: Record<string, { posts: number; engagement: number }>;
  growth_metrics: Record<string, number>;
}

export interface StoryData {
  id: string;
  title: string;
  content: string;
  media_urls: string[];
  created_at: string;
  platform_specs: Record<string, any>;
}

export interface HighlightReel {
  id: string;
  title: string;
  description: string;
  media_items: string[];
  duration: number;
  created_at: string;
  thumbnail_url?: string;
}

export interface GalleryItem {
  id: string;
  name: string;
  description: string;
  media_items: string[];
  created_at: string;
  thumbnail_url?: string;
}

// Authentication token storage
const TOKEN_STORAGE_KEY = 'crow-eye-auth-token';

// Utility functions
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.warn('Failed to save auth token:', error);
  }
}

function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear auth token:', error);
  }
}

class CrowsEyeAPI {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.authToken = getAuthToken();
  }

  setAuthToken(token: string) {
    this.authToken = token;
    setAuthToken(token);
  }

  // Try to get Firebase auth token for API requests
  private async getFirebaseToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    
    try {
      // Try to get Firebase auth if available
      const { auth } = await import('@/lib/firebase');
      if (auth?.currentUser) {
        return await auth.currentUser.getIdToken();
      }
    } catch (error) {
      // Firebase not available or user not logged in
      console.debug('Firebase auth not available:', error);
    }
    
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Try to get auth token (either stored API token or Firebase token)
    let token = this.authToken;
    if (!token) {
      token = await this.getFirebaseToken();
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Reduced timeout for better UX

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: response.statusText };
        }
        
        // For authentication errors, provide a more helpful message
        if (response.status === 401 || response.status === 403) {
          return {
            error: 'Authentication required - running in demo mode',
          };
        }
        
        return {
          error: errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { error: 'Request timeout - API may not be available' };
        }
        // Check if it's a network error (API not running)
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          return { error: 'API not available - running in demo mode' };
        }
        return { error: error.message };
      }
      return { error: 'Network error - API may not be available' };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ access_token: string; user: any }>> {
    const formData = new FormData();
    formData.append('username', email); // FastAPI OAuth2 expects 'username'
    formData.append('password', password);

    return this.request('/token', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async register(email: string, password: string, name: string): Promise<ApiResponse<{ access_token: string; user: any }>> {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        name: name 
      }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/users/me');
  }

  // Media endpoints
  async uploadMedia(file: File): Promise<ApiResponse<MediaItem>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async getMedia(mediaId: string): Promise<ApiResponse<MediaItem>> {
    return this.request(`/media/${mediaId}`);
  }

  async listMedia(limit: number = 50, offset: number = 0): Promise<ApiResponse<{ media: MediaItem[]; total: number }>> {
    return this.request(`/media/?limit=${limit}&skip=${offset}`);
  }

  async deleteMedia(mediaId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/media/${mediaId}`, {
      method: 'DELETE',
    });
  }

  // Audio endpoints
  async importAudio(file: File, options: any = {}): Promise<ApiResponse<AudioItem>> {
    const formData = new FormData();
    formData.append('file', file);
    if (options.name) formData.append('name', options.name);
    if (options.description) formData.append('description', options.description);
    if (options.tags) formData.append('tags', JSON.stringify(options.tags));

    return this.request('/media/upload-audio', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async listAudio(limit: number = 50, offset: number = 0): Promise<ApiResponse<{ audio_files: AudioItem[]; total: number }>> {
    return this.request(`/media/audio?limit=${limit}&skip=${offset}`);
  }

  // Gallery endpoints
  async listGalleries(limit: number = 50, offset: number = 0): Promise<ApiResponse<{ galleries: GalleryItem[]; total: number }>> {
    return this.request(`/galleries/?limit=${limit}&skip=${offset}`);
  }

  async createGallery(request: any): Promise<ApiResponse<GalleryItem>> {
    return this.request('/galleries/', {
      method: 'POST',
      body: JSON.stringify({
        name: request.name,
        description: request.description,
        media_selection_criteria: request.maxItems ? { max_items: request.maxItems } : {}
      }),
    });
  }

  async getGallery(galleryId: string): Promise<ApiResponse<GalleryItem>> {
    return this.request(`/galleries/${galleryId}`);
  }

  async updateGallery(galleryId: string, updates: Partial<GalleryItem>): Promise<ApiResponse<GalleryItem>> {
    return this.request(`/galleries/${galleryId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteGallery(galleryId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/galleries/${galleryId}`, {
      method: 'DELETE',
    });
  }

  // Story endpoints
  async createStory(request: any): Promise<ApiResponse<StoryData>> {
    return this.request('/ai/generate-story', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async listStories(limit: number = 50, offset: number = 0): Promise<ApiResponse<{ stories: StoryData[]; total: number }>> {
    return this.request(`/ai/stories?limit=${limit}&skip=${offset}`);
  }

  // Analytics endpoints
  async getAnalytics(period: string = '30d'): Promise<ApiResponse<AnalyticsData>> {
    return this.request(`/ai/analytics?period=${period}`);
  }

  // Highlight reels endpoints
  async listHighlightReels(limit: number = 50, offset: number = 0): Promise<ApiResponse<{ highlight_reels: HighlightReel[]; total: number }>> {
    return this.request(`/ai/highlights?limit=${limit}&skip=${offset}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }

  // Placeholder methods for endpoints that might not be implemented yet
  async getAudio(audioId: string): Promise<ApiResponse<AudioItem>> {
    return this.request(`/media/audio/${audioId}`);
  }

  async editAudio(audioId: string, operations: any[], outputFormat: string = 'mp3'): Promise<ApiResponse<AudioItem>> {
    return this.request(`/media/audio/${audioId}/edit`, {
      method: 'POST',
      body: JSON.stringify({ operations, output_format: outputFormat }),
    });
  }

  async deleteAudio(audioId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/media/audio/${audioId}`, {
      method: 'DELETE',
    });
  }

  async listAudioEffects(): Promise<ApiResponse<any[]>> {
    return this.request('/media/audio/effects');
  }

  async analyzeAudio(audioId: string): Promise<ApiResponse<any>> {
    return this.request(`/media/audio/${audioId}/analyze`);
  }

  async exportAnalytics(request: any): Promise<ApiResponse<any>> {
    return this.request('/ai/analytics/export', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getInsights(): Promise<ApiResponse<any>> {
    return this.request('/ai/insights');
  }

  async getCompetitorAnalysis(): Promise<ApiResponse<any>> {
    return this.request('/ai/competitors');
  }

  async getSummaryReport(period: string = '30d'): Promise<ApiResponse<any>> {
    return this.request(`/ai/reports/summary?period=${period}`);
  }

  async getStory(storyId: string): Promise<ApiResponse<StoryData>> {
    return this.request(`/ai/stories/${storyId}`);
  }

  async updateStory(storyId: string, updates: Partial<StoryData>): Promise<ApiResponse<StoryData>> {
    return this.request(`/ai/stories/${storyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteStory(storyId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/ai/stories/${storyId}`, {
      method: 'DELETE',
    });
  }

  async createHighlightReel(request: any): Promise<ApiResponse<HighlightReel>> {
    return this.request('/ai/highlights', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getHighlightReel(highlightId: string): Promise<ApiResponse<HighlightReel>> {
    return this.request(`/ai/highlights/${highlightId}`);
  }

  async updateHighlightReel(highlightId: string, updates: Partial<HighlightReel>): Promise<ApiResponse<HighlightReel>> {
    return this.request(`/ai/highlights/${highlightId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteHighlightReel(highlightId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/ai/highlights/${highlightId}`, {
      method: 'DELETE',
    });
  }

  async renderHighlightReel(highlightId: string, options: any = {}): Promise<ApiResponse<{ render_job_id: string }>> {
    return this.request(`/ai/highlights/${highlightId}/render`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async getHighlightRenderStatus(jobId: string): Promise<ApiResponse<any>> {
    return this.request(`/ai/highlights/render-status/${jobId}`);
  }

  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.request('/admin/stats');
  }

  async listAllUsers(limit: number = 50, offset: number = 0): Promise<ApiResponse<{ users: any[]; total: number }>> {
    return this.request(`/admin/users?limit=${limit}&skip=${offset}`);
  }

  async getUserDetails(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${userId}`);
  }

  async updateUserSubscription(userId: string, subscriptionData: any): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${userId}/subscription`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData),
    });
  }

  async getSystemLogs(limit: number = 100, level?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (level) params.append('level', level);
    return this.request(`/admin/logs?${params}`);
  }
}

// Export singleton instance
export const crowsEyeAPI = new CrowsEyeAPI();
export default crowsEyeAPI; 