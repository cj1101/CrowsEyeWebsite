/**
 * Crow's Eye API Client
 * Comprehensive client library for connecting to the crow_eye_api backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

class CrowsEyeAPI {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
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

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ access_token: string; user: any }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<ApiResponse<{ access_token: string; user: any }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/auth/me');
  }

  // Media endpoints
  async uploadMedia(file: File): Promise<ApiResponse<MediaItem>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/media/', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async getMedia(mediaId: string): Promise<ApiResponse<MediaItem>> {
    return this.request(`/media/${mediaId}`);
  }

  async listMedia(limit: number = 50, offset: number = 0): Promise<ApiResponse<{ media: MediaItem[]; total: number }>> {
    return this.request(`/media/?limit=${limit}&offset=${offset}`);
  }

  async deleteMedia(mediaId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/media/${mediaId}`, {
      method: 'DELETE',
    });
  }

  // Audio endpoints
  async importAudio(
    file: File,
    options: {
      name?: string;
      description?: string;
      tags?: string[];
      auto_enhance?: boolean;
      normalize_volume?: boolean;
    } = {}
  ): Promise<ApiResponse<AudioItem>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('request', JSON.stringify(options));

    return this.request('/audio/import', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async getAudio(audioId: string): Promise<ApiResponse<AudioItem>> {
    return this.request(`/audio/${audioId}`);
  }

  async listAudio(
    limit: number = 50,
    offset: number = 0,
    tags?: string
  ): Promise<ApiResponse<{ audio_files: AudioItem[]; total: number }>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (tags) params.append('tags', tags);

    return this.request(`/audio/?${params}`);
  }

  async editAudio(
    audioId: string,
    operations: any[],
    outputFormat: string = 'mp3'
  ): Promise<ApiResponse<AudioItem>> {
    return this.request('/audio/edit', {
      method: 'POST',
      body: JSON.stringify({
        audio_id: audioId,
        operations,
        output_format: outputFormat,
      }),
    });
  }

  async deleteAudio(audioId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/audio/${audioId}`, {
      method: 'DELETE',
    });
  }

  async listAudioEffects(): Promise<ApiResponse<any[]>> {
    return this.request('/audio/effects/');
  }

  async analyzeAudio(audioId: string): Promise<ApiResponse<any>> {
    return this.request(`/audio/${audioId}/analyze`);
  }

  // Analytics endpoints
  async getAnalytics(
    period: string = '30d',
    platform?: string
  ): Promise<ApiResponse<AnalyticsData>> {
    const params = new URLSearchParams({ period });
    if (platform) params.append('platform', platform);

    return this.request(`/analytics/?${params}`);
  }

  async exportAnalytics(request: {
    start_date: string;
    end_date: string;
    platforms?: string[];
    metrics?: string[];
    format?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/analytics/export', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getInsights(): Promise<ApiResponse<any>> {
    return this.request('/analytics/insights');
  }

  async getCompetitorAnalysis(): Promise<ApiResponse<any>> {
    return this.request('/analytics/competitors');
  }

  async getSummaryReport(period: string = '30d'): Promise<ApiResponse<any>> {
    return this.request(`/analytics/reports/summary?period=${period}`);
  }

  // Stories endpoints
  async createStory(request: {
    title: string;
    content_brief: string;
    target_platforms: string[];
    tone?: string;
    include_media?: boolean;
  }): Promise<ApiResponse<StoryData>> {
    return this.request('/stories/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getStory(storyId: string): Promise<ApiResponse<StoryData>> {
    return this.request(`/stories/${storyId}`);
  }

  async listStories(
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<{ stories: StoryData[]; total: number }>> {
    return this.request(`/stories/?limit=${limit}&offset=${offset}`);
  }

  async updateStory(
    storyId: string,
    updates: Partial<StoryData>
  ): Promise<ApiResponse<StoryData>> {
    return this.request(`/stories/${storyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteStory(storyId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/stories/${storyId}`, {
      method: 'DELETE',
    });
  }

  // Highlights endpoints
  async createHighlightReel(request: {
    title: string;
    description: string;
    media_selection_criteria: any;
    duration_preference?: string;
    style_preferences?: any;
  }): Promise<ApiResponse<HighlightReel>> {
    return this.request('/highlights/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getHighlightReel(highlightId: string): Promise<ApiResponse<HighlightReel>> {
    return this.request(`/highlights/${highlightId}`);
  }

  async listHighlightReels(
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<{ highlight_reels: HighlightReel[]; total: number }>> {
    return this.request(`/highlights/?limit=${limit}&offset=${offset}`);
  }

  async updateHighlightReel(
    highlightId: string,
    updates: Partial<HighlightReel>
  ): Promise<ApiResponse<HighlightReel>> {
    return this.request(`/highlights/${highlightId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteHighlightReel(highlightId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/highlights/${highlightId}`, {
      method: 'DELETE',
    });
  }

  async renderHighlightReel(
    highlightId: string,
    options: any = {}
  ): Promise<ApiResponse<{ render_job_id: string }>> {
    return this.request(`/highlights/${highlightId}/render`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async getHighlightRenderStatus(jobId: string): Promise<ApiResponse<any>> {
    return this.request(`/highlights/render-status/${jobId}`);
  }

  // Gallery endpoints
  async createGallery(request: {
    name: string;
    description: string;
    media_selection_criteria: any;
    organization_style?: string;
  }): Promise<ApiResponse<GalleryItem>> {
    return this.request('/gallery/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getGallery(galleryId: string): Promise<ApiResponse<GalleryItem>> {
    return this.request(`/gallery/${galleryId}`);
  }

  async listGalleries(
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<{ galleries: GalleryItem[]; total: number }>> {
    return this.request(`/gallery/?limit=${limit}&offset=${offset}`);
  }

  async updateGallery(
    galleryId: string,
    updates: Partial<GalleryItem>
  ): Promise<ApiResponse<GalleryItem>> {
    return this.request(`/gallery/${galleryId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteGallery(galleryId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/gallery/${galleryId}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints (for admin users)
  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.request('/admin/stats');
  }

  async listAllUsers(
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<{ users: any[]; total: number }>> {
    return this.request(`/admin/users?limit=${limit}&offset=${offset}`);
  }

  async getUserDetails(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${userId}`);
  }

  async updateUserSubscription(
    userId: string,
    subscriptionData: any
  ): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${userId}/subscription`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData),
    });
  }

  async getSystemLogs(
    limit: number = 100,
    level?: string
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (level) params.append('level', level);

    return this.request(`/admin/logs?${params}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

// Create and export singleton instance
export const api = new CrowsEyeAPI();
export default api; 