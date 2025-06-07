/**
 * Crow's Eye Marketing Platform API Client
 * Clean, refactored version using centralized configuration
 */

// Import types and config from centralized locations
import type {
  MediaFile,
  AuthResponse,
  MediaSearchResponse,
  MediaUploadResponse,
  Gallery,
  Story,
  HighlightReel,
  AudioFile,
  ApiResponse,
  RequestOptions,
} from '../../types/api';

import { 
  API_CONFIG, 
  buildApiUrl, 
  getAuthToken, 
  setAuthToken, 
  clearAuthToken, 
  ApiError 
} from './config';

class CrowEyeAPI {
  private token: string | null = null;
  private isInitialized = false;

  constructor() {
    this.token = null;
  }

  private initializeIfNeeded() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      this.token = getAuthToken();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize API client:', error);
      this.isInitialized = true;
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    this.initializeIfNeeded();
    
    const url = buildApiUrl(endpoint);
    const timeout = options.timeout || API_CONFIG.TIMEOUT.DEFAULT;
    
    const headers: Record<string, string> = {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers,
    };

    // Add authentication if available
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || response.statusText, errorData);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response as unknown as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      
      console.error('API Request failed:', error);
      throw new ApiError(0, error instanceof Error ? error.message : 'Network error');
    }
  }

  // Authentication Methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: { email, password },
    });
    
    this.token = response.access_token;
    setAuthToken(this.token);
    return response;
  }

  async getCurrentUser() {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  logout() {
    this.token = null;
    clearAuthToken();
  }

  // Media Management Methods
  async uploadMedia(file: File): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<MediaFile>(API_CONFIG.ENDPOINTS.MEDIA.UPLOAD, {
      method: 'POST',
      headers: {}, // Remove Content-Type for FormData
      body: formData,
      timeout: API_CONFIG.TIMEOUT.UPLOAD,
    });
  }

  async getMediaFiles(): Promise<MediaFile[]> {
    const response = await this.request<MediaSearchResponse>(API_CONFIG.ENDPOINTS.MEDIA.BASE);
    return Array.isArray(response.items) ? response.items : [];
  }

  async deleteMedia(id: string): Promise<void> {
    await this.request(API_CONFIG.ENDPOINTS.MEDIA.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Gallery Methods
  async createGallery(prompt: string, maxItems: number = 5, generateCaption: boolean = true): Promise<Gallery> {
    return this.request<Gallery>(API_CONFIG.ENDPOINTS.GALLERY.CREATE, {
      method: 'POST',
      body: { prompt, maxItems, generateCaption },
    });
  }

  async getGalleries(): Promise<Gallery[]> {
    const response = await this.request<{ items: Gallery[] }>(API_CONFIG.ENDPOINTS.GALLERY.BASE);
    return Array.isArray(response.items) ? response.items : [];
  }

  async updateGallery(id: string, data: Partial<Gallery>): Promise<Gallery> {
    return this.request<Gallery>(API_CONFIG.ENDPOINTS.GALLERY.UPDATE(id), {
      method: 'PUT',
      body: data,
    });
  }

  async deleteGallery(id: string): Promise<void> {
    await this.request(API_CONFIG.ENDPOINTS.GALLERY.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Story Methods
  async createStory(title: string, content: string, platform: string, templateId?: string): Promise<Story> {
    return this.request<Story>(API_CONFIG.ENDPOINTS.STORIES.CREATE, {
      method: 'POST',
      body: { title, content, platform, template_id: templateId },
    });
  }

  async getStories(): Promise<Story[]> {
    const response = await this.request<{ items: Story[] }>(API_CONFIG.ENDPOINTS.STORIES.BASE);
    return Array.isArray(response.items) ? response.items : [];
  }

  async getStoryTemplates(): Promise<any[]> {
    const response = await this.request<{ templates: any[] }>(API_CONFIG.ENDPOINTS.STORIES.TEMPLATES);
    return Array.isArray(response.templates) ? response.templates : [];
  }

  async deleteStory(id: string): Promise<void> {
    await this.request(API_CONFIG.ENDPOINTS.STORIES.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Highlight Reel Methods
  async createHighlightReel(
    mediaIds: string[],
    duration: number = 30,
    style: string = 'dynamic',
    musicStyle: string = 'upbeat'
  ): Promise<HighlightReel> {
    return this.request<HighlightReel>(API_CONFIG.ENDPOINTS.HIGHLIGHTS.CREATE, {
      method: 'POST',
      body: { media_ids: mediaIds, duration, style, music_style: musicStyle },
    });
  }

  async getHighlightReels(): Promise<HighlightReel[]> {
    const response = await this.request<{ items: HighlightReel[] }>(API_CONFIG.ENDPOINTS.HIGHLIGHTS.BASE);
    return Array.isArray(response.items) ? response.items : [];
  }

  async getHighlightReelStatus(id: string): Promise<{ status: string; progress?: number }> {
    return this.request(API_CONFIG.ENDPOINTS.HIGHLIGHTS.STATUS(id));
  }

  async getHighlightStyles(): Promise<string[]> {
    const response = await this.request<{ styles: string[] }>(API_CONFIG.ENDPOINTS.HIGHLIGHTS.STYLES);
    return Array.isArray(response.styles) ? response.styles : [];
  }

  // Audio Methods
  async importAudio(file: File): Promise<AudioFile> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<AudioFile>(API_CONFIG.ENDPOINTS.AUDIO.IMPORT, {
      method: 'POST',
      headers: {},
      body: formData,
      timeout: API_CONFIG.TIMEOUT.UPLOAD,
    });
  }

  async getAudioFiles(): Promise<AudioFile[]> {
    const response = await this.request<{ items: AudioFile[] }>(API_CONFIG.ENDPOINTS.AUDIO.BASE);
    return Array.isArray(response.items) ? response.items : [];
  }

  async editAudio(id: string, command: string): Promise<AudioFile> {
    return this.request<AudioFile>(API_CONFIG.ENDPOINTS.AUDIO.EDIT(id), {
      method: 'POST',
      body: { command },
    });
  }

  async getAudioEffects(): Promise<string[]> {
    const response = await this.request<{ effects: string[] }>(API_CONFIG.ENDPOINTS.AUDIO.EFFECTS);
    return Array.isArray(response.effects) ? response.effects : [];
  }

  async analyzeAudio(id: string): Promise<any> {
    return this.request(API_CONFIG.ENDPOINTS.AUDIO.ANALYZE(id));
  }

  // Analytics Methods
  async getAnalytics(): Promise<any> {
    return this.request(API_CONFIG.ENDPOINTS.ANALYTICS.BASE);
  }

  async exportAnalytics(format: 'csv' | 'json' = 'json'): Promise<Blob> {
    return this.request<Blob>(`${API_CONFIG.ENDPOINTS.ANALYTICS.EXPORT}?format=${format}`, {
      timeout: API_CONFIG.TIMEOUT.DOWNLOAD,
    });
  }

  async getInsights(): Promise<any> {
    return this.request(API_CONFIG.ENDPOINTS.ANALYTICS.INSIGHTS);
  }

  async getCompetitorAnalysis(): Promise<any> {
    return this.request(API_CONFIG.ENDPOINTS.ANALYTICS.COMPETITORS);
  }

  async getExecutiveSummary(): Promise<any> {
    return this.request(API_CONFIG.ENDPOINTS.ANALYTICS.SUMMARY);
  }

  // Admin Methods
  async getAccounts(): Promise<any[]> {
    const response = await this.request<{ accounts: any[] }>(API_CONFIG.ENDPOINTS.ADMIN.ACCOUNTS);
    return Array.isArray(response.accounts) ? response.accounts : [];
  }

  async createAccount(data: any): Promise<any> {
    return this.request(API_CONFIG.ENDPOINTS.ADMIN.ACCOUNTS, {
      method: 'POST',
      body: data,
    });
  }

  async updateAccount(id: string, data: any): Promise<any> {
    return this.request(API_CONFIG.ENDPOINTS.ADMIN.ACCOUNT(id), {
      method: 'PUT',
      body: data,
    });
  }

  async deleteAccount(id: string): Promise<void> {
    await this.request(API_CONFIG.ENDPOINTS.ADMIN.ACCOUNT(id), {
      method: 'DELETE',
    });
  }

  // Health Check
  async healthCheck(): Promise<{ status: string }> {
    return this.request(API_CONFIG.ENDPOINTS.HEALTH);
  }

  // Utility Methods
  isAuthenticated(): boolean {
    this.initializeIfNeeded();
    return !!this.token;
  }

  getAuthToken(): string | null {
    this.initializeIfNeeded();
    return this.token;
  }
}

// Export singleton instance
export const crowEyeAPI = new CrowEyeAPI(); 