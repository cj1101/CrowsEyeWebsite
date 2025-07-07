import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://crow-eye-api-605899951231.us-central1.run.app';

interface ApiResponse<T> {
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface Post {
  id: string;
  mediaId: string;
  caption: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdAt: string;
  updatedAt: string;
  scheduledTime?: string;
  publishedTime?: string;
  mediaType: 'image' | 'video' | 'audio';
  mediaUrl: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  customInstructions?: string;
  formatting?: any;
  contextFiles: string[];
  analytics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  };
}

interface CreatePostData {
  mediaId: string;
  caption: string;
  platforms: string[];
  customInstructions?: string;
  formatting?: {
    verticalOptimization: boolean;
    captionOverlay: boolean;
    overlayPosition: 'top' | 'center' | 'bottom';
    overlayFontSize: 'small' | 'medium' | 'large';
    aspectRatio: 'original' | '1:1' | '4:5' | '16:9' | '9:16';
  };
  contextFiles?: string[];
  scheduledTime?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: string;
}

interface Schedule {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  postsPerDay: number;
  platforms: string[];
  postingTimes: string[];
  isActive: boolean;
  contentSources: {
    mediaLibrary: boolean;
    aiGenerated: boolean;
    templates: string[];
  };
  rules: {
    skipWeekends: boolean;
    skipHolidays: boolean;
    minimumInterval: number;
  };
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle demo mode and errors
    this.client.interceptors.response.use(
      (response) => {
        // Check if we're in demo mode
        if (response.headers['x-demo-mode'] === 'true') {
          console.log('Demo mode active - using mock data');
        }
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear auth and redirect to login
          await AsyncStorage.removeItem('authToken');
          // You might want to emit an event here to navigate to login
        }
        return Promise.reject(error);
      }
    );
  }

  // Posts API
  async createPost(data: CreatePostData): Promise<Post> {
    const response = await this.client.post<Post>('/api/posts', data);
    return response.data;
  }

  async getPosts(filters?: {
    status?: string;
    platform?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ posts: Post[]; total: number; hasMore: boolean }> {
    const response = await this.client.get('/api/posts', { params: filters });
    return response.data;
  }

  async getPost(postId: string): Promise<Post> {
    const response = await this.client.get<Post>(`/api/posts/${postId}`);
    return response.data;
  }

  async updatePost(postId: string, data: Partial<CreatePostData>): Promise<Post> {
    const response = await this.client.put<Post>(`/api/posts/${postId}`, data);
    return response.data;
  }

  async deletePost(postId: string): Promise<void> {
    await this.client.delete(`/api/posts/${postId}`);
  }

  async duplicatePost(postId: string): Promise<Post> {
    const response = await this.client.post<Post>(`/api/posts/${postId}/duplicate`);
    return response.data;
  }

  async publishPost(postId: string): Promise<void> {
    await this.client.post(`/api/posts/${postId}/publish`);
  }

  // Scheduling API
  async createSchedule(data: Omit<Schedule, 'id'>): Promise<Schedule> {
    const response = await this.client.post<Schedule>('/api/schedules', data);
    return response.data;
  }

  async getSchedules(active?: boolean): Promise<Schedule[]> {
    const response = await this.client.get('/api/schedules', {
      params: active !== undefined ? { active } : {},
    });
    return response.data;
  }

  async updateSchedule(scheduleId: string, data: Partial<Schedule>): Promise<Schedule> {
    const response = await this.client.put<Schedule>(`/api/schedules/${scheduleId}`, data);
    return response.data;
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    await this.client.delete(`/api/schedules/${scheduleId}`);
  }

  async toggleSchedule(scheduleId: string): Promise<void> {
    await this.client.post(`/api/schedules/${scheduleId}/toggle`);
  }

  async getScheduleCalendar(start: string, end: string): Promise<any> {
    const response = await this.client.get('/api/schedules/calendar', {
      params: { start, end },
    });
    return response.data;
  }

  // AI Content Generation
  async generateCaption(data: {
    mediaId?: string;
    platforms: string[];
    tone: string;
    customInstructions: string;
    contextFiles?: string[];
    includeHashtags: boolean;
    maxLength?: number;
  }): Promise<{ caption: string }> {
    const response = await this.client.post('/api/ai/caption', data);
    return response.data;
  }

  async generateHashtags(data: {
    content: string;
    platforms: string[];
    niche: string;
    count: number;
  }): Promise<{ hashtags: string[] }> {
    const response = await this.client.post('/api/ai/hashtags', data);
    return response.data;
  }

  async getContentSuggestions(data: {
    mediaId: string;
    platforms: string[];
    contentType: 'caption' | 'story' | 'description';
    variations: number;
  }): Promise<{ suggestions: string[] }> {
    const response = await this.client.post('/api/ai/suggestions', data);
    return response.data;
  }

  // Analytics
  async getPostAnalytics(postId: string): Promise<any> {
    const response = await this.client.get(`/api/analytics/posts/${postId}`);
    return response.data;
  }

  async getPlatformAnalytics(start: string, end: string): Promise<any> {
    const response = await this.client.get('/api/analytics/platforms', {
      params: { start, end },
    });
    return response.data;
  }

  async getEngagementTrends(period: string, platform?: string): Promise<any> {
    const response = await this.client.get('/api/analytics/trends', {
      params: { period, platform },
    });
    return response.data;
  }

  // Media Processing
  async processMedia(mediaId: string, data: {
    instructions: string;
    outputFormat: 'image' | 'video';
    platforms: string[];
    formatting?: any;
  }): Promise<any> {
    const response = await this.client.post(`/api/media/${mediaId}/process`, data);
    return response.data;
  }

  async optimizeMedia(mediaId: string, data: {
    platforms: string[];
    variations: {
      aspectRatios: string[];
      sizes: string[];
    };
  }): Promise<any> {
    const response = await this.client.post(`/api/media/${mediaId}/optimize`, data);
    return response.data;
  }

  // Platform Integration
  async getConnectedPlatforms(): Promise<any> {
    const response = await this.client.get('/api/platforms/connected');
    return response.data;
  }

  async connectPlatform(platform: string, data: {
    accessToken: string;
    refreshToken?: string;
    accountId: string;
    accountName: string;
  }): Promise<void> {
    await this.client.post(`/api/platforms/${platform}/connect`, data);
  }

  async disconnectPlatform(platform: string): Promise<void> {
    await this.client.delete(`/api/platforms/${platform}/disconnect`);
  }
}

export const apiClient = new ApiClient();
export type { Post, CreatePostData, Schedule }; 