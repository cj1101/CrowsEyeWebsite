// Crow's Eye Marketing Platform API Client
// Connects to the Python FastAPI backend

interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    user_id: string;
    email: string;
    subscription: {
      tier: string;
    };
  };
}

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  uploaded_at: string;
}

interface Gallery {
  id: string;
  name: string;
  prompt: string;
  media_ids: string[];
  created_at: string;
  updated_at: string;
}

interface Story {
  id: string;
  title: string;
  content: string;
  platform: string;
  template_id?: string;
  created_at: string;
}

interface HighlightReel {
  id: string;
  name: string;
  duration: number;
  style: string;
  media_ids: string[];
  status: 'processing' | 'completed' | 'failed';
  url?: string;
  created_at: string;
}

interface AudioFile {
  id: string;
  filename: string;
  url: string;
  duration: number;
  effects: string[];
  created_at: string;
}

class CrowEyeAPI {
  private config: ApiConfig;
  private token: string | null = null;
  private isInitialized = false;

  constructor() {
    // Initialize with default config, will load from localStorage on first use
    this.config = { 
      baseUrl: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8001' 
        : 'https://crow-eye-api-605899951231.us-central1.run.app' 
    };
    this.token = null;
  }

  private initializeIfNeeded() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      // Get config from localStorage or use defaults
      const savedConfig = localStorage.getItem('crow-eye-api-config');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
      }
      
      this.token = localStorage.getItem('crow-eye-api-token');
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize API config from localStorage:', error);
      this.isInitialized = true;
    }
  }

  updateConfig(config: Partial<ApiConfig>) {
    this.initializeIfNeeded();
    this.config = { ...this.config, ...config };
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('crow-eye-api-config', JSON.stringify(this.config));
      } catch (error) {
        console.warn('Failed to save API config to localStorage:', error);
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    this.initializeIfNeeded();
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    } else if (this.config.apiKey) {
      headers['X-USER-API-KEY'] = this.config.apiKey;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response as unknown as T;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = response.access_token;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('crow-eye-api-token', this.token);
      } catch (error) {
        console.warn('Failed to save token to localStorage:', error);
      }
    }
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('crow-eye-api-token');
      } catch (error) {
        console.warn('Failed to remove token from localStorage:', error);
      }
    }
  }

  // Media Management
  async uploadMedia(file: File): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<MediaFile>('/media/', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async getMediaFiles(): Promise<MediaFile[]> {
    const response = await this.request<{ items?: MediaFile[], media?: MediaFile[] }>('/media/');
    if (response && Array.isArray(response.items)) {
      return response.items;
    }
    if (response && Array.isArray(response.media)) {
      return response.media;
    }
    return [];
  }

  async deleteMedia(id: string): Promise<void> {
    await this.request(`/media/${id}`, { method: 'DELETE' });
  }

  // Smart Galleries
  async createGallery(prompt: string, maxItems: number = 5, generateCaption: boolean = true): Promise<Gallery> {
    return this.request<Gallery>('/gallery/', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        max_items: maxItems,
        generate_caption: generateCaption,
      }),
    });
  }

  async getGalleries(): Promise<Gallery[]> {
    const response = await this.request<{ galleries: Gallery[] }>('/gallery/');
    return response.galleries || [];
  }

  async updateGallery(id: string, data: Partial<Gallery>): Promise<Gallery> {
    return this.request<Gallery>(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGallery(id: string): Promise<void> {
    await this.request(`/gallery/${id}`, { method: 'DELETE' });
  }

  // Story Formatting
  async createStory(title: string, content: string, platform: string, templateId?: string): Promise<Story> {
    return this.request<Story>('/stories/', {
      method: 'POST',
      body: JSON.stringify({
        title,
        content,
        platform,
        template_id: templateId,
      }),
    });
  }

  async getStories(): Promise<Story[]> {
    return this.request<Story[]>('/stories/');
  }

  async getStoryTemplates(): Promise<any[]> {
    return this.request<any[]>('/stories/templates/');
  }

  async deleteStory(id: string): Promise<void> {
    await this.request(`/stories/${id}`, { method: 'DELETE' });
  }

  // Highlight Reels (Creator+ feature)
  async createHighlightReel(
    mediaIds: string[],
    duration: number = 30,
    style: string = 'dynamic',
    musicStyle: string = 'upbeat'
  ): Promise<HighlightReel> {
    return this.request<HighlightReel>('/highlights/', {
      method: 'POST',
      body: JSON.stringify({
        media_ids: mediaIds,
        duration,
        style,
        music_style: musicStyle,
      }),
    });
  }

  async getHighlightReels(): Promise<HighlightReel[]> {
    return this.request<HighlightReel[]>('/highlights/');
  }

  async getHighlightReelStatus(id: string): Promise<{ status: string; progress?: number }> {
    return this.request(`/highlights/${id}/status`);
  }

  async getHighlightStyles(): Promise<string[]> {
    return this.request<string[]>('/highlights/styles/');
  }

  // Audio Import (Creator+ feature)
  async importAudio(file: File): Promise<AudioFile> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<AudioFile>('/audio/import', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async getAudioFiles(): Promise<AudioFile[]> {
    return this.request<AudioFile[]>('/audio/');
  }

  async editAudio(id: string, command: string): Promise<AudioFile> {
    return this.request<AudioFile>('/audio/edit', {
      method: 'POST',
      body: JSON.stringify({
        audio_id: id,
        command,
      }),
    });
  }

  async getAudioEffects(): Promise<string[]> {
    return this.request<string[]>('/audio/effects/');
  }

  async analyzeAudio(id: string): Promise<any> {
    return this.request(`/audio/${id}/analyze`);
  }

  // Analytics (Pro+ feature)
  async getAnalytics(): Promise<any> {
    return this.request('/analytics/');
  }

  async exportAnalytics(format: 'csv' | 'json' = 'json'): Promise<Blob> {
    return this.request<Blob>('/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  }

  async getInsights(): Promise<any> {
    return this.request('/analytics/insights');
  }

  async getCompetitorAnalysis(): Promise<any> {
    return this.request('/analytics/competitors');
  }

  async getExecutiveSummary(): Promise<any> {
    return this.request('/analytics/reports/summary');
  }

  // Admin (Enterprise feature)
  async getAccounts(): Promise<any[]> {
    return this.request<any[]>('/admin/accounts');
  }

  async createAccount(data: any): Promise<any> {
    return this.request('/admin/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccount(id: string, data: any): Promise<any> {
    return this.request(`/admin/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(id: string): Promise<void> {
    await this.request(`/admin/accounts/${id}`, { method: 'DELETE' });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

// Export singleton instance
export const crowEyeAPI = new CrowEyeAPI();

// Export types
export type {
  ApiConfig,
  AuthResponse,
  MediaFile,
  Gallery,
  Story,
  HighlightReel,
  AudioFile,
}; 