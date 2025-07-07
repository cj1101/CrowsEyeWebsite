import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import crypto from 'crypto';

// Helper function to get environment variables safely
const getEnvVar = (name: string, fallback: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Client-side: check for runtime environment variables
    return (window as any).__ENV__?.[name] || process.env[name] || fallback;
  }
  // Server-side: use process.env
  return process.env[name] || fallback;
};

// Security utilities
const generateNonce = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

const sanitizeInput = (input: string): string => {
  return input.replace(/[<>\"'&]/g, '');
};

// Rate limiting helper - DISABLED to prevent login blocks
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number = 1000; // Increased limit
  private readonly windowMs: number = 60000; // 1 minute

  isAllowed(key: string): boolean {
    // Always allow requests - rate limiting handled by backend
    return true;
  }
}

const rateLimiter = new RateLimiter();

import { API_CONFIG } from '@/lib/config';

const API_BASE_URL = API_CONFIG.baseURL;
const DEVELOPMENT_FALLBACK = false; // Disabled development fallback mode

// Enhanced API instance with better timeout handling and interceptors
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': '1.0.0',
  },
});

// Add request interceptor for authentication and security
api.interceptors.request.use(
  (config) => {
    // Rate limiting check
    const identifier = typeof window !== 'undefined' ? 
      window.location.hostname : 
      config.headers?.['X-Forwarded-For'] || 'server';
    
    if (!rateLimiter.isAllowed(identifier)) {
      return Promise.reject(new Error('Rate limit exceeded'));
    }

    // Add security headers
    config.headers['X-Request-ID'] = generateNonce();
    config.headers['X-Timestamp'] = Date.now().toString();
    
    // Add authentication token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Sanitize string inputs in data
    if (config.data && typeof config.data === 'object') {
      Object.keys(config.data).forEach(key => {
        if (typeof config.data[key] === 'string') {
          config.data[key] = sanitizeInput(config.data[key]);
        }
      });
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1 second

// Add response interceptor for error handling with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as any;
    
    // Initialize retry count
    if (!config._retryCount) {
      config._retryCount = 0;
    }
    
    // Check if we should retry
    const shouldRetry = (
      config._retryCount < MAX_RETRIES &&
      (error.code === 'ECONNREFUSED' ||
       error.code === 'NETWORK_ERROR' ||
       (error.response?.status && error.response.status >= 500))
    );
    
    if (shouldRetry) {
      config._retryCount++;
      const delay = RETRY_DELAY * Math.pow(2, config._retryCount - 1); // Exponential backoff
      
      console.warn(`⚠️ API request failed, retrying in ${delay}ms (attempt ${config._retryCount}/${MAX_RETRIES})`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return api(config);
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        console.warn('🔐 Session expired, redirecting to login...');
        window.location.href = '/auth/signin';
      }
    }
    
    // Handle 502 Bad Gateway - API is down
    if (error.response?.status === 502) {
      console.warn('API is temporarily unavailable (502). Using fallback mode.');
      // Return mock data in development
      if (DEVELOPMENT_FALLBACK) {
        return Promise.resolve({ 
          data: { error: 'API unavailable', fallback: true },
          status: 502,
          statusText: 'Bad Gateway',
          headers: {},
          config: error.config || {}
        } as AxiosResponse);
      }
    }
    
    return Promise.reject(error);
  }
);

// Type definitions for Google Photos integration
export interface GooglePhotosAuth {
  isConnected: boolean;
  userEmail?: string;
  albumCount?: number;
  lastSync?: string;
}

export interface GooglePhotosAlbum {
  id: string;
  title: string;
  productUrl: string;
  coverPhotoUrl?: string;
  mediaItemsCount: number;
  isWriteable: boolean;
}

export interface GooglePhotosMediaItem {
  id: string;
  filename: string;
  mimeType: string;
  baseUrl: string;
  productUrl: string;
  description?: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
    photo?: {
      cameraMake?: string;
      cameraModel?: string;
      focalLength?: number;
      apertureFNumber?: number;
      isoEquivalent?: number;
    };
    video?: {
      fps?: number;
      status?: string;
    };
  };
}

// Marketing Tool Types (matching backend)
export interface RecentActivity {
  id: string;
  action: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning';
}

export interface MarketingToolStats {
  totalPosts: number;
  scheduledPosts: number;
  aiGenerated: number;
  engagementRate: number;
  socialAccounts: number;
  mediaFiles: number;
  recentActivity: RecentActivity[];
  subscriptionTier: string;
  aiCreditsRemaining: number;
  aiEditsRemaining: number;
}

export interface CreatePostRequest {
  content: string;
  platforms: string[];
  hashtags: string[];
  mediaFiles: string[];
  scheduledFor?: string;
}

export interface CreatePostResponse {
  success: boolean;
  postId: string;
}

// Enhanced authentication types with subscription tiers
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'creator' | 'growth' | 'pro' | 'payg';
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  stripe_customer_id?: string;
  subscription_expires?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  email_verified?: boolean;
  usage_limits: {
    linked_accounts: number;
    max_linked_accounts: number;
    ai_credits: number;
    max_ai_credits: number;
    scheduled_posts: number;
    max_scheduled_posts: number;
    media_storage_mb: number;
    max_media_storage_mb: number;
  };
  plan_features: {
    basic_content_tools: boolean;
    media_library: boolean;
    smart_gallery: boolean;
    post_formatting: boolean;
    basic_video_tools: boolean;
    advanced_content: boolean;
    analytics: 'none' | 'basic' | 'enhanced' | 'advanced';
    team_collaboration: boolean;
    custom_branding: boolean;
    api_access: boolean;
    priority_support: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  subscription_tier?: 'free' | 'creator' | 'growth' | 'pro';
}

export interface AuthResponse {
  success?: boolean;
  error?: string;
  data?: {
    access_token: string;
    refresh_token: string;
    user: User;
    expires_in?: number;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Platform integration types
export interface PlatformConnection {
  platform: 'instagram' | 'tiktok' | 'pinterest' | 'twitter' | 'linkedin' | 'facebook';
  connected: boolean;
  username?: string;
  profile_url?: string;
  connected_at?: string;
  last_sync?: string;
  permissions: string[];
}

export interface PostData {
  content: string;
  media_ids: string[];
  platforms: string[];
  schedule_date?: string;
  hashtags: string[];
  location?: string;
  caption?: string;
}

export interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  schedule_date: string;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  created_at: string;
  published_at?: string;
  error_message?: string;
}

// Analytics types
export interface AnalyticsOverview {
  total_posts: number;
  total_engagement: number;
  reach: number;
  impressions: number;
  follower_growth: number;
  date_range: {
    start: string;
    end: string;
  };
}

export interface PostAnalytics {
  post_id: string;
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  published_at: string;
}

// Compliance types
export interface ComplianceCheck {
  content: string;
  media_urls: string[];
  platforms: string[];
}

export interface ComplianceResult {
  overall_score: number;
  platform_results: {
    [platform: string]: {
      score: number;
      issues: ComplianceIssue[];
      suggestions: string[];
    };
  };
}

export interface ComplianceIssue {
  type: 'warning' | 'error';
  category: 'content' | 'format' | 'policy';
  message: string;
  suggestion?: string;
}

// AI Content Generation types
export interface AIGenerationRequest {
  prompt: string;
  type: 'caption' | 'hashtags' | 'content_idea' | 'optimization';
  platform?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'energetic';
  max_length?: number;
}

export interface AIGenerationResponse {
  generated_content: string;
  alternatives?: string[];
  metadata: {
    confidence_score: number;
    suggested_hashtags?: string[];
    estimated_engagement?: number;
  };
}

// Type definitions for video processing
export interface VideoProcessingOptions {
  targetDuration?: number;
  style?: 'dynamic' | 'calm' | 'energetic' | 'cinematic';
  includeAudio?: boolean;
  outputFormat?: 'mp4' | 'webm' | 'gif';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

export interface ProcessingJob {
  id: string;
  type: 'highlight' | 'story' | 'longform' | 'thumbnail';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  inputFile: string;
  outputFile?: string;
  error?: string;
  createdAt: string;
  estimatedCompletion?: string;
}

// Media Library Types (matching new backend structure)
export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  size: number;
  createdAt: string;
  tags: string[];
  // Legacy fields for compatibility
  filename?: string;
  gcs_path?: string;
  thumbnail_url?: string;
  media_type?: 'image' | 'video' | 'audio';
  file_size?: number;
  width?: number;
  height?: number;
  duration?: number;
  caption?: string;
  ai_tags?: string[];
  is_post_ready?: boolean;
  upload_date?: string;
  user_id?: string;
  description?: string;
  status?: 'draft' | 'completed' | 'published' | 'processing';
  post_metadata?: any;
}

export interface Gallery {
  id: string;
  title: string;
  images: string[];
  createdAt: string;
}

// Enhanced mock data with Google Photos examples
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
      platforms: ['instagram', 'facebook'],
      source: 'upload'
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
      platforms: ['youtube', 'tiktok'],
      source: 'upload'
    },
    {
      id: '3',
      name: 'google-photos-sunset.jpg',
      content_type: 'image/jpeg',
      url: '/images/placeholder-sunset.jpg',
      file_size: 512000,
      created_at: '2023-12-20T18:30:00Z',
      tags: ['sunset', 'landscape', 'google-photos'],
      platforms: ['instagram'],
      source: 'google_photos',
      googlePhotosId: 'AGj1f4Y2XmE8H3kL9pQ'
    }
  ],
  googlePhotos: {
    auth: {
      isConnected: false,
      userEmail: undefined,
      albumCount: 0,
      lastSync: undefined
    } as GooglePhotosAuth,
    albums: [
      {
        id: 'album1',
        title: 'Vacation 2024',
        productUrl: 'https://photos.app.goo.gl/example1',
        coverPhotoUrl: '/images/album-cover-1.jpg',
        mediaItemsCount: 45,
        isWriteable: false
      },
      {
        id: 'album2',
        title: 'Wedding Photos',
        productUrl: 'https://photos.app.goo.gl/example2',
        coverPhotoUrl: '/images/album-cover-2.jpg',
        mediaItemsCount: 180,
        isWriteable: false
      }
    ] as GooglePhotosAlbum[],
    mediaItems: [] as GooglePhotosMediaItem[]
  },
  processingJobs: [
    {
      id: 'job1',
      type: 'highlight',
      status: 'completed',
      progress: 100,
      inputFile: 'long-video.mp4',
      outputFile: 'highlight-reel.mp4',
      createdAt: '2024-01-15T10:00:00Z'
    }
  ] as ProcessingJob[],
  health: { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      storage: 'connected',
      googlePhotos: 'available',
      aiProcessing: 'available'
    }
  }
};

// Helper function to create mock responses
const mockResponse = (data: any, delay: number = 300): Promise<AxiosResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        data, 
        status: 200, 
        statusText: 'OK',
        headers: {},
        config: {} as any
      });
    }, delay);
  });
};

// Enhanced helper function to handle API calls with fallback
const apiWithFallback = async (
  apiCall: () => Promise<AxiosResponse>, 
  mockResponseData: any, 
  operationName: string = 'API call'
): Promise<AxiosResponse> => {
  if (!DEVELOPMENT_FALLBACK) {
    console.log(`🚀 Production mode - making direct ${operationName}`);
    try {
      return await apiCall();
    } catch (error: any) {
      console.error(`❌ ${operationName} failed in production:`, error?.message || error);
      console.log('🔍 Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        method: error?.config?.method,
        headers: error?.config?.headers,
        responseData: error?.response?.data
      });
      
      // For media uploads, handle gracefully with local storage
      if (operationName.toLowerCase().includes('upload')) {
        console.log('📱 Using local storage fallback for media');
        return mockResponse(mockResponseData);
      }
      
      throw error;
    }
  }
  
  try {
    console.log(`🔧 Development mode - attempting ${operationName}`);
    const result = await apiCall();
    console.log(`✅ ${operationName} succeeded:`, result?.status);
    
    // Check if API indicates it's not fully implemented
    if (result?.data?.status === 'available' && result?.data?.note?.includes('coming soon')) {
      console.log(`⚠️ ${operationName} exists but not fully implemented, using mock data`);
      const mockResult = await mockResponse(mockResponseData);
      console.log(`🎭 Returning mock response for ${operationName}`);
      return mockResult;
    }
    
    return result;
  } catch (error: any) {
    console.warn(`❌ ${operationName} failed, using mock data:`, error?.message || 'Unknown error');
    console.log('📊 Error details:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url: error?.config?.url,
      message: error?.message
    });
    const mockResult = await mockResponse(mockResponseData);
    console.log(`🎭 Returning mock response for ${operationName}`);
    return mockResult;
  }
};

// API endpoints are now correctly implemented and working

export class CrowsEyeAPI {
  private api: AxiosInstance;

  // Transform backend user data to frontend User interface
  private transformUser(backendUser: any): User {
    console.log('🔄 transformUser input:', backendUser);
    
    // Normalize the plan from backend - could be 'PRO' or 'pro' 
    let normalizedPlan = 'free';
    if (backendUser.plan) {
      const backendPlan = backendUser.plan.toLowerCase();
      // Map backend plan names to frontend subscription_tier
      switch (backendPlan) {
        case 'pro':
          normalizedPlan = 'pro';
          break;
        case 'creator':
          normalizedPlan = 'creator';
          break;
        case 'growth':
          normalizedPlan = 'growth';
          break;
        case 'payg':
          normalizedPlan = 'payg';
          break;
        default:
          normalizedPlan = 'free';
      }
    }
    
    console.log('🎯 Plan mapping:', {
      backendPlan: backendUser.plan,
      normalizedPlan,
      hasStripeId: !!backendUser.stripeCustomerId
    });

    const transformedUser = {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.displayName || `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim(),
      avatar_url: backendUser.avatar,
      subscription_tier: normalizedPlan as 'free' | 'creator' | 'growth' | 'pro' | 'payg',
      subscription_status: 'active' as 'active' | 'inactive' | 'cancelled' | 'past_due',
      stripe_customer_id: backendUser.stripeCustomerId,
      subscription_expires: backendUser.subscriptionExpiresAt,
      created_at: backendUser.createdAt,
      updated_at: backendUser.updatedAt || backendUser.createdAt,
      last_login: backendUser.lastLoginAt,
      email_verified: true, // Backend doesn't provide this
      usage_limits: {
        linked_accounts: 0,
        max_linked_accounts: 3,
        ai_credits: 100,
        max_ai_credits: 100,
        scheduled_posts: 0,
        max_scheduled_posts: 10,
        media_storage_mb: 0,
        max_media_storage_mb: 1000,
      },
      plan_features: {
        basic_content_tools: true,
        media_library: true,
        smart_gallery: backendUser.plan !== 'FREE',
        post_formatting: true,
        basic_video_tools: true,
        advanced_content: backendUser.plan === 'PRO',
        analytics: (backendUser.plan === 'FREE' ? 'basic' : 'enhanced') as 'none' | 'basic' | 'enhanced' | 'advanced',
        team_collaboration: backendUser.plan === 'PRO',
        custom_branding: backendUser.plan === 'PRO',
        api_access: backendUser.plan !== 'FREE',
        priority_support: backendUser.plan === 'PRO',
      }
    };
    
    console.log('✅ transformUser output:', transformedUser);
    return transformedUser;
  }

  constructor(baseURL: string = API_BASE_URL) {
    this.api = axios.create({
      baseURL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add interceptors to this instance as well
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/auth/signin';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================
  
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 Attempting user registration...', { 
        url: `${API_BASE_URL}/api/v1/auth/register`,
        environment: API_CONFIG.environment 
      });
      
      // Test connectivity first
      try {
        await this.api.get('/health');
        console.log('✅ API connectivity confirmed');
      } catch (healthError: any) {
        console.warn('⚠️ API health check failed, proceeding anyway:', healthError.message);
      }
      
      // Map frontend data to backend format
      const requestData = {
        email: userData.email,
        password: userData.password,
        name: userData.name, // Changed from displayName to name
        subscription_tier: userData.subscription_tier || 'free'
      };
      
      const response = await this.api.post('/api/v1/auth/register', requestData);
      console.log('✅ Registration successful');
      
      // Handle both new and legacy backend response formats
      if (response.data?.success && response.data?.data) {
        // New backend format: { success: true, data: { access_token, refresh_token, user } }
        return {
          success: true,
          data: {
            access_token: response.data.data.access_token,
            refresh_token: response.data.data.refresh_token || '',
            user: response.data.data.user
          }
        };
      } else if (response.data?.token && response.data?.user) {
        // Legacy format
        return {
          success: true,
          data: {
            access_token: response.data.token,
            refresh_token: response.data.refreshToken || '',
            user: this.transformUser(response.data.user)
          }
        };
      }
      
      return response.data;
    } catch (error: any) {
      const errorInfo = {
        message: error.message,
        code: error.code,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        url: error?.config?.url,
        method: error?.config?.method,
        baseURL: API_BASE_URL,
        environment: API_CONFIG.environment
      };
      
      console.error('❌ Registration API failed:', error.message);
      console.log('📊 Detailed error info:', errorInfo);
      
      // Specific error handling
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: `Cannot connect to API server at ${API_BASE_URL}. Please ensure the backend is running.`
        };
      }
      
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        return {
          success: false,
          error: `Network error connecting to ${API_BASE_URL}. Check your connection and backend status.`
        };
      }
      
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response.data?.detail || 'Invalid registration data'
        };
      }
      
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response.data?.detail || 'Invalid registration data format'
        };
      }
      
      if (error.response?.status === 409) {
        return {
          success: false,
          error: 'User already exists with this email'
        };
      }
      
      // Return the error response from the API
      if (error.response?.data) {
        return error.response.data;
      }
      
      // Network or other errors
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }
  
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting user login...', { 
        url: `${API_BASE_URL}/api/v1/auth/login`,
        environment: API_CONFIG.environment 
      });
      
      // Test connectivity first
      try {
        await this.api.get('/health');
        console.log('✅ API connectivity confirmed');
      } catch (healthError: any) {
        console.warn('⚠️ API health check failed, proceeding anyway:', healthError.message);
      }
      
      const response = await this.api.post('/api/v1/auth/login', credentials);
      console.log('✅ Login successful');
      
      // Handle both new and legacy backend response formats
      if (response.data?.success && response.data?.data) {
        // New backend format: { success: true, data: { access_token, refresh_token, user } }
        return {
          success: true,
          data: {
            access_token: response.data.data.access_token,
            refresh_token: response.data.data.refresh_token || '',
            user: response.data.data.user
          }
        };
      } else if (response.data?.token && response.data?.user) {
        // Legacy format
        return {
          success: true,
          data: {
            access_token: response.data.token,
            refresh_token: response.data.refreshToken || '',
            user: this.transformUser(response.data.user)
          }
        };
      }
      
      return response.data;
    } catch (error: any) {
      const errorInfo = {
        message: error.message,
        code: error.code,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        url: error?.config?.url,
        method: error?.config?.method,
        baseURL: API_BASE_URL,
        environment: API_CONFIG.environment
      };
      
      console.error('❌ Login API failed:', error.message);
      console.log('📊 Detailed error info:', errorInfo);
      
      // Specific error handling
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: `Cannot connect to API server at ${API_BASE_URL}. Please ensure the backend is running.`
        };
      }
      
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        return {
          success: false,
          error: `Network error connecting to ${API_BASE_URL}. Check your connection and backend status.`
        };
      }
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }
      
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response.data?.detail || 'Invalid login data format'
        };
      }
      
      // Return the error response from the API
      if (error.response?.data) {
        return error.response.data;
      }
      
      // Network or other errors
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }
  
  async getCurrentUser(): Promise<APIResponse<User>> {
    try {
      console.log('🔍 Getting current user from API...');
      const response = await this.api.get('/api/v1/auth/me');
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('❌ Get current user failed:', error);
      return {
        success: false,
        error: error?.response?.data?.error || error.message || 'Failed to get current user'
      };
    }
  }
  
  async refreshToken(refreshToken: string): Promise<AxiosResponse<AuthResponse>> {
    return await this.api.post('/auth/refresh', { refreshToken });
  }
  
  async logout(): Promise<AxiosResponse> {
    return await this.api.post('/auth/logout');
  }

  async requestPasswordReset(email: string): Promise<AxiosResponse> {
    try {
      const response = await this.api.post('/api/v1/auth/forgot-password', { email });
      console.log('✅ Password reset requested:', email);
      return response;
    } catch (error: any) {
      console.error('❌ Password reset request failed:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<AxiosResponse> {
    try {
      const response = await this.api.post('/api/v1/auth/reset-password', { token, password: newPassword });
      console.log('✅ Password reset successful');
      return response;
    } catch (error: any) {
      console.error('❌ Password reset failed:', error);
      throw error;
    }
  }

  // Promotional code methods
  async applyPromoCode(promoCode: string): Promise<AxiosResponse> {
    try {
      const response = await this.api.post('/api/v1/auth/apply-promo-code', { 
        promo_code: promoCode 
      });
      console.log('✅ Promotional code applied:', promoCode);
      return response;
    } catch (error: any) {
      console.error('❌ Promotional code application failed:', error);
      throw error;
    }
  }

  async upgradeToLifetimePro(userId: string): Promise<AxiosResponse> {
    try {
      const response = await this.api.post('/api/v1/auth/upgrade-lifetime-pro', { 
        user_id: userId 
      });
      console.log('✅ User upgraded to lifetime Pro:', userId);
      return response;
    } catch (error: any) {
      console.error('❌ Lifetime Pro upgrade failed:', error);
      throw error;
    }
  }

  async upgradeToCreator(userId: string): Promise<AxiosResponse> {
    try {
      const response = await this.api.post('/api/v1/auth/upgrade-creator', { 
        user_id: userId 
      });
      console.log('✅ User upgraded to Creator plan:', userId);
      return response;
    } catch (error: any) {
      console.error('❌ Creator upgrade failed:', error);
      throw error;
    }
  }
  
  async updateProfile(profileData: Partial<User>): Promise<AxiosResponse<User>> {
    return this.api.put('/user/profile', profileData);
  }

  // =============================================================================
  // HEALTH CHECK METHODS
  // =============================================================================

  // === HEALTH & STATUS ===
  async healthCheck(): Promise<AxiosResponse> {
    return this.api.get('/health');
  }

  async testConnection(): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.get('/test'),
      { status: 'ok', message: 'Test connection successful' },
      'Test Connection'
    );
  }

  // =============================================================================
  // PLATFORM INTEGRATION METHODS
  // =============================================================================
  
  async getPlatforms(): Promise<AxiosResponse<PlatformConnection[]>> {
    const mockPlatforms: PlatformConnection[] = [
      {
        platform: 'instagram',
        connected: false,
        permissions: ['basic_info', 'content_publish']
      },
      {
        platform: 'tiktok',
        connected: false,
        permissions: ['user.info.basic', 'video.publish']
      },
      {
        platform: 'pinterest',
        connected: false,
        permissions: ['read_public', 'write_public']
      }
    ];
    
    return apiWithFallback(
      () => this.api.get('/api/v1/platforms'),
      mockPlatforms,
      'Get Platforms'
    );
  }
  
  async connectPlatform(platform: string): Promise<AxiosResponse> {
    return this.api.post(`/api/v1/platforms/${platform}/connect`);
  }
  
  async disconnectPlatform(platform: string): Promise<AxiosResponse> {
    return this.api.delete(`/api/v1/platforms/${platform}/disconnect`);
  }
  
  async getPlatformStatus(platform: string): Promise<AxiosResponse<PlatformConnection>> {
    const mockStatus: PlatformConnection = {
      platform: platform as any,
      connected: false,
      permissions: []
    };
    
    return apiWithFallback(
      () => this.api.get(`/api/v1/platforms/${platform}/status`),
      mockStatus,
      `Get ${platform} Status`
    );
  }
  
  async postToPlatform(platform: string, postData: PostData): Promise<AxiosResponse> {
    return this.api.post(`/api/v1/platforms/${platform}/post`, postData);
  }

  // =============================================================================
  // SCHEDULING METHODS
  // =============================================================================
  
  async getSchedules(): Promise<AxiosResponse<ScheduledPost[]>> {
    const mockSchedules: ScheduledPost[] = [
      {
        id: 'sched1',
        content: 'Sample scheduled post',
        platforms: ['instagram', 'twitter'],
        schedule_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'scheduled',
        created_at: new Date().toISOString()
      }
    ];
    
    return apiWithFallback(
      () => this.api.get('/api/v1/schedules'),
      mockSchedules,
      'Get Schedules'
    );
  }
  
  async createSchedule(scheduleData: Omit<ScheduledPost, 'id' | 'created_at' | 'status'>): Promise<AxiosResponse<ScheduledPost>> {
    return this.api.post('/api/v1/schedules', scheduleData);
  }
  
  async updateSchedule(scheduleId: string, scheduleData: Partial<ScheduledPost>): Promise<AxiosResponse<ScheduledPost>> {
    return this.api.put(`/api/v1/schedules/${scheduleId}`, scheduleData);
  }
  
  async deleteSchedule(scheduleId: string): Promise<AxiosResponse> {
    return this.api.delete(`/api/v1/schedules/${scheduleId}`);
  }
  
  async publishPost(postData: PostData): Promise<AxiosResponse> {
    return this.api.post('/api/v1/posts/publish', postData);
  }

  // =============================================================================
  // ANALYTICS METHODS
  // =============================================================================
  
  async getAnalyticsOverview(dateRange?: { start: string; end: string }): Promise<AxiosResponse<AnalyticsOverview>> {
    const mockOverview: AnalyticsOverview = {
      total_posts: 45,
      total_engagement: 2340,
      reach: 15800,
      impressions: 23400,
      follower_growth: 127,
      date_range: dateRange || {
        start: new Date(Date.now() - 30 * 86400000).toISOString(),
        end: new Date().toISOString()
      }
    };
    
    return apiWithFallback(
      () => this.api.get('/api/v1/analytics/overview', { params: dateRange }),
      mockOverview,
      'Get Analytics Overview'
    );
  }
  
  async getPostAnalytics(): Promise<AxiosResponse<PostAnalytics[]>> {
    const mockAnalytics: PostAnalytics[] = [
      {
        post_id: 'post1',
        platform: 'instagram',
        likes: 234,
        comments: 45,
        shares: 12,
        reach: 1200,
        impressions: 1800,
        engagement_rate: 24.25,
        published_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    return apiWithFallback(
      () => this.api.get('/api/v1/analytics/posts'),
      mockAnalytics,
      'Get Post Analytics'
    );
  }
  
  async getPlatformAnalytics(): Promise<AxiosResponse> {
    const mockPlatformAnalytics = {
      instagram: { followers: 1234, engagement_rate: 4.2 },
      tiktok: { followers: 5678, engagement_rate: 6.8 }
    };
    
    return apiWithFallback(
      () => this.api.get('/api/v1/analytics/platforms'),
      mockPlatformAnalytics,
      'Get Platform Analytics'
    );
  }
  
  async exportAnalytics(format: 'pdf' | 'csv' | 'json', dateRange: { start: string; end: string }): Promise<AxiosResponse> {
    return this.api.get('/api/v1/analytics/export', {
      params: { format, ...dateRange }
    });
  }

  // =============================================================================
  // AI CONTENT GENERATION METHODS
  // =============================================================================
  
  async generateCaption(request: AIGenerationRequest): Promise<AxiosResponse<AIGenerationResponse>> {
    const mockResponse: AIGenerationResponse = {
      generated_content: 'AI-generated caption based on your prompt',
      alternatives: ['Alternative caption 1', 'Alternative caption 2'],
      metadata: {
        confidence_score: 0.85,
        suggested_hashtags: ['#ai', '#generated', '#content'],
        estimated_engagement: 75
      }
    };
    
    return apiWithFallback(
      () => this.api.post('/api/v1/ai/generate-caption', request),
      mockResponse,
      'Generate Caption'
    );
  }
  
  async generateHashtags(request: AIGenerationRequest): Promise<AxiosResponse<AIGenerationResponse>> {
    const mockResponse: AIGenerationResponse = {
      generated_content: '#trending #viral #content #marketing #social',
      alternatives: ['#alternative #hashtags #set1', '#another #hashtag #set2'],
      metadata: {
        confidence_score: 0.92,
        suggested_hashtags: ['#trending', '#viral', '#content', '#marketing', '#social'],
        estimated_engagement: 85
      }
    };
    
    return apiWithFallback(
      () => this.api.post('/api/v1/ai/generate-hashtags', request),
      mockResponse,
      'Generate Hashtags'
    );
  }
  
  async enhanceImage(imageFile: File): Promise<AxiosResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return this.api.post('/api/v1/ai/enhance-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  
  async optimizeContent(request: AIGenerationRequest): Promise<AxiosResponse<AIGenerationResponse>> {
    const mockResponse: AIGenerationResponse = {
      generated_content: 'Optimized content for better engagement',
      metadata: {
        confidence_score: 0.88,
        estimated_engagement: 92
      }
    };
    
    return apiWithFallback(
      () => this.api.post('/api/v1/ai/optimize-content', request),
      mockResponse,
      'Optimize Content'
    );
  }

  // =============================================================================
  // COMPLIANCE METHODS
  // =============================================================================
  
  async checkCompliance(checkData: ComplianceCheck): Promise<AxiosResponse<ComplianceResult>> {
    const mockResult: ComplianceResult = {
      overall_score: 85,
      platform_results: {
        instagram: {
          score: 90,
          issues: [],
          suggestions: ['Consider adding more relevant hashtags']
        },
        tiktok: {
          score: 80,
          issues: [
            {
              type: 'warning',
              category: 'content',
              message: 'Content might be too long for TikTok',
              suggestion: 'Consider shortening the caption'
            }
          ],
          suggestions: ['Use trending sounds', 'Add captions for accessibility']
        }
      }
    };
    
    return apiWithFallback(
      () => this.api.post('/api/v1/compliance/check', checkData),
      mockResult,
      'Check Compliance'
    );
  }
  
  async getComplianceRules(): Promise<AxiosResponse> {
    const mockRules = {
      instagram: {
        max_caption_length: 2200,
        max_hashtags: 30,
        required_fields: ['content']
      },
      tiktok: {
        max_caption_length: 150,
        max_hashtags: 100,
        required_fields: ['content', 'video']
      }
    };
    
    return apiWithFallback(
      () => this.api.get('/api/v1/compliance/rules'),
      mockRules,
      'Get Compliance Rules'
    );
  }
  
  async validateContent(content: any): Promise<AxiosResponse> {
    return this.api.post('/api/v1/compliance/validate', content);
  }

  // === GOOGLE PHOTOS INTEGRATION ===
  async connectGooglePhotos(): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.post('/api/v1/google-photos/auth'),
      { authUrl: 'https://accounts.google.com/oauth2/auth?...' },
      'Google Photos OAuth initiation'
    );
  }

  async getGooglePhotosStatus(): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.get('/api/v1/google-photos/status'),
      mockData.googlePhotos.auth,
      'Google Photos auth status'
    );
  }

  async listGooglePhotosAlbums(): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.get('/api/v1/google-photos/albums'),
      mockData.googlePhotos.albums,
      'Google Photos albums list'
    );
  }

  async getAlbumMedia(albumId: string, pageToken?: string): Promise<AxiosResponse> {
    const params = pageToken ? { pageToken } : {};
    return apiWithFallback(
      () => this.api.get(`/google-photos/albums/${albumId}/media`, { params }),
      mockData.googlePhotos.mediaItems,
      `Google Photos album ${albumId} media`
    );
  }

  async importFromGooglePhotos(albumId: string, mediaIds: string[]): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.post('/api/v1/google-photos/import', { albumId, mediaIds }),
      { jobId: 'import-job-123', status: 'queued', itemCount: mediaIds.length },
      'Google Photos media import'
    );
  }

  async searchGooglePhotos(query: string): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.get('/api/v1/google-photos/search', { params: { q: query } }),
      mockData.googlePhotos.mediaItems.filter(item => 
        item.filename.toLowerCase().includes(query.toLowerCase())
      ),
      'Google Photos search'
    );
  }

  async syncGooglePhotos(): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.post('/api/v1/google-photos/sync'),
      { jobId: 'sync-job-456', status: 'queued' },
      'Google Photos sync'
    );
  }

  // === VIDEO PROCESSING & ANALYSIS ===
  async generateHighlights(videoFile: File, options: VideoProcessingOptions = {}): Promise<AxiosResponse> {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('options', JSON.stringify(options));

    return apiWithFallback(
      () => this.api.post('/video/highlights', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000 // 5 minutes for video processing
      }),
      { 
        jobId: 'highlight-job-789', 
        status: 'queued', 
        estimatedDuration: 120,
        message: 'Video highlight generation started'
      },
      'Video highlight generation'
    );
  }

  async createStoryClips(videoFile: File, maxDuration: number = 60): Promise<AxiosResponse> {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('maxDuration', maxDuration.toString());

    return apiWithFallback(
      () => this.api.post('/video/story-clips', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000
      }),
      { 
        jobId: 'story-job-101', 
        status: 'queued',
        clipCount: 3,
        message: 'Story clips generation started'
      },
      'Story clips creation'
    );
  }

  async processLongForm(videoFile: File, targetDuration: number, prompt?: string): Promise<AxiosResponse> {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('targetDuration', targetDuration.toString());
    if (prompt) formData.append('prompt', prompt);

    return apiWithFallback(
      () => this.api.post('/video/long-form', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000 // 10 minutes for long-form processing
      }),
      { 
        jobId: 'longform-job-202', 
        status: 'queued',
        estimatedCost: 2.50,
        message: 'Long-form content processing started'
      },
      'Long-form video processing'
    );
  }

  async generateThumbnails(videoFile: File, count: number = 5): Promise<AxiosResponse> {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('count', count.toString());

    return apiWithFallback(
      () => this.api.post('/video/thumbnails', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      { 
        jobId: 'thumb-job-303', 
        status: 'queued',
        thumbnailCount: count,
        message: 'Thumbnail generation started'
      },
      'Video thumbnail generation'
    );
  }

  // === JOB MANAGEMENT ===
  async getProcessingJob(jobId: string): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.get(`/jobs/${jobId}`),
      mockData.processingJobs.find(job => job.id === jobId) || mockData.processingJobs[0],
      `Processing job ${jobId} status`
    );
  }

  async listProcessingJobs(userId?: string): Promise<AxiosResponse> {
    const params = userId ? { userId } : {};
    return apiWithFallback(
      () => this.api.get('/api/v1/bulk/status', { params }),
      mockData.processingJobs,
      'Processing jobs list'
    );
  }

  async cancelProcessingJob(jobId: string): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.delete(`/jobs/${jobId}`),
      { message: 'Job cancelled successfully' },
      `Cancel processing job ${jobId}`
    );
  }

  // === MEDIA MANAGEMENT ===
  async uploadMedia(file: File, tags: string[] = []): Promise<AxiosResponse> {
    const uploadCall = () => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Backend expects metadata as JSON string
      if (tags.length > 0) {
        const metadata = { tags };
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      return this.api.post('/api/v1/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, // 3 minutes for large files
      });
    };

    try {
      // Try backend API first
      return await uploadCall();
    } catch (error) {
      console.warn('Backend API unavailable, using local Next.js API:', error);
      
      // Fallback to local Next.js API
      const formData = new FormData();
      formData.append('file', file);
      if (tags.length > 0) {
        formData.append('caption', tags.join(', '));
      }
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      // Transform the result to match the expected format
      return {
        data: result.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      } as AxiosResponse;
    }
  }

  // Enhanced method for uploading completed posts with full metadata
  async uploadCompletedPost(formData: FormData): Promise<AxiosResponse> {
    const uploadCall = () => {
      return this.api.post('/api/v1/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, // 3 minutes for large files
      });
    };

    // Extract metadata for mock response
    const metadataStr = formData.get('metadata') as string;
    let metadata = {};
    try {
      metadata = metadataStr ? JSON.parse(metadataStr) : {};
    } catch (e) {
      console.warn('Failed to parse metadata:', e);
    }

    const file = formData.get('file') as File;
    const mockData = {
      id: Math.floor(Math.random() * 1000000).toString(),
      name: file?.name || 'unknown',
      type: file?.type.startsWith('video') ? 'video' : file?.type.startsWith('image') ? 'image' : 'audio',
      url: `mock-url-${Date.now()}`,
      thumbnail: undefined,
      size: file?.size || 0,
      createdAt: new Date().toISOString(),
      tags: (metadata as any)?.tags || []
    };

    return apiWithFallback(uploadCall, mockData, `Upload completed post: ${file?.name || 'unknown'}`);
  }

  async getMediaLibrary(): Promise<AxiosResponse> {
    try {
      // Try backend API first
      return await this.api.get('/api/v1/media/');
    } catch (error) {
      console.warn('Backend API unavailable, using local Next.js API:', error);
      
      // Fallback to local Next.js API
      const response = await fetch('/api/media');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch media library: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Transform the result to match the expected format
      return {
        data: result,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      } as AxiosResponse;
    }
  }

  async getMediaGalleries(): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.get('/api/v1/galleries'),
      [],
      'Media galleries fetch'
    );
  }

  async createMediaGallery(name: string, caption?: string): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.post('/api/v1/galleries', { name: name, caption: caption }),
      { id: Date.now(), name: name, caption: caption, created_date: new Date().toISOString() },
      'Create media gallery'
    );
  }

  async addMediaToGallery(galleryId: string, mediaIds: string[]): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.post(`/api/v1/galleries/${galleryId}/media`, mediaIds.map(id => parseInt(id))),
      { added_count: mediaIds.length },
      'Add media to gallery'
    );
  }

  async removeMediaFromGallery(galleryId: string, mediaIds: string[]): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.delete(`/api/v1/galleries/${galleryId}/media`, { data: mediaIds.map(id => parseInt(id)) }),
      { removed_count: mediaIds.length },
      'Remove media from gallery'
    );
  }

  async searchMedia(query: string): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.post('/api/v1/media/search', { query: query }),
      { items: [], total: 0 },
      'Media search'
    );
  }

  async deleteMedia(mediaId: string): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.delete(`/api/v1/media/${mediaId}`),
      { success: true },
      `Delete media ${mediaId}`
    );
  }

  // === ANALYTICS & REPORTING ===
  async getProcessingStats(dateRange?: { start: string; end: string }): Promise<AxiosResponse> {
    const params = dateRange ? dateRange : {};
    return apiWithFallback(
      () => this.api.get('/analytics/processing', { params }),
      {
        totalJobs: 145,
        completedJobs: 132,
        failedJobs: 8,
        activeJobs: 5,
        processingTime: { average: 180, median: 120 },
        storageUsed: '2.3GB',
        apiCalls: 1847
      },
      'Processing statistics'
    );
  }

  async getSystemHealth(): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.get('/analytics/health'),
      {
        status: 'healthy',
        uptime: '99.8%',
        responseTime: 145,
        activeConnections: 23,
        services: {
          database: 'operational',
          storage: 'operational',
          processing: 'operational',
          googlePhotos: 'operational'
        }
      },
      'System health monitoring'
    );
  }

  async exportReport(format: 'pdf' | 'csv' | 'json', dateRange: { start: string; end: string }): Promise<AxiosResponse> {
    return apiWithFallback(
      () => this.api.get('/analytics/export', { 
        params: { format, ...dateRange },
        responseType: format === 'json' ? 'json' : 'blob'
      }),
      { downloadUrl: `/reports/report-${Date.now()}.${format}` },
      `Export ${format.toUpperCase()} report`
    );
  }

  // =============================================================================
  // MARKETING TOOL METHODS
  // =============================================================================

  async getMarketingToolStats(): Promise<AxiosResponse<MarketingToolStats>> {
    try {
      const response = await apiWithFallback(
        () => this.api.get('/api/v1/marketing-tool/stats'),
        {
          totalPosts: 24,
          scheduledPosts: 8,
          aiGenerated: 15,
          engagementRate: 4.2,
          socialAccounts: 5,
          mediaFiles: 142,
          recentActivity: [
            {
              id: '1',
              action: 'Published to Instagram',
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              type: 'success' as const
            },
            {
              id: '2',
              action: 'Generated AI caption',
              timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              type: 'info' as const
            }
          ],
          subscriptionTier: 'Pro',
          aiCreditsRemaining: 85,
          aiEditsRemaining: 23
        }
      );
      return response;
    } catch (error) {
      console.error('Error fetching marketing tool stats:', error);
      throw error;
    }
  }

  async createMarketingPost(postData: CreatePostRequest): Promise<AxiosResponse<CreatePostResponse>> {
    try {
      // Transform to backend schema
      const transformed: any = {
        caption: postData.content,
        platforms: postData.platforms,
        mediaId: Array.isArray((postData as any).media_ids) ? (postData as any).media_ids[0] : (postData as any).media_id,
        // Optional extended fields
        hashtags: postData.hashtags,
        customInstructions: undefined
      };
      const response = await this.api.post('/api/v1/posts', transformed);
      return response;
    } catch (error) {
      console.error('Error creating marketing post:', error);
      throw error;
    }
  }

  // === CONTENT HUB METHODS ===
  
  async getPosts(params?: { page?: number; limit?: number; status?: string; platform?: string }): Promise<AxiosResponse> {
    try {
      const response = await apiWithFallback(
        () => this.api.get('/api/v1/posts', { params }),
        {
          data: [
            {
              id: '1',
              content: 'Sample post content',
              platforms: ['instagram', 'tiktok'],
              status: 'published',
              createdAt: new Date().toISOString(),
              mediaUrls: [],
              hashtags: ['#sample', '#post'],
              analytics: {
                likes: 24,
                comments: 5,
                shares: 3,
                reach: 156
              }
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1
          }
        }
      );
      return response;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getTemplates(): Promise<AxiosResponse> {
    try {
      const response = await apiWithFallback(
        () => this.api.get('/api/v1/templates'),
        {
          data: [
            {
              id: '1',
              name: 'Product Launch',
              content: 'Exciting news! Our new {product} is now available! 🎉',
              category: 'marketing',
              tags: ['product', 'launch', 'announcement'],
              usage: 15
            },
            {
              id: '2',
              name: 'Behind the Scenes',
              content: 'Take a peek behind the scenes at {company}! 👀',
              category: 'engagement',
              tags: ['bts', 'company', 'culture'],
              usage: 23
            }
          ]
        }
      );
      return response;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  async createPost(postData: PostData): Promise<AxiosResponse> {
    try {
      // Transform to backend schema
      const transformed: any = {
        caption: postData.content,
        platforms: postData.platforms,
        mediaId: Array.isArray((postData as any).media_ids) ? (postData as any).media_ids[0] : (postData as any).media_id,
        // Optional extended fields
        hashtags: postData.hashtags,
        customInstructions: undefined
      };
      const response = await this.api.post('/api/v1/posts', transformed);
      return response;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<AxiosResponse> {
    try {
      const response = await this.api.delete(`/api/v1/posts/${postId}`);
      return response;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Billing & Subscription Methods
  async updatePAYGCustomer(stripeCustomerId: string, subscriptionId?: string): Promise<AxiosResponse> {
    try {
      console.log('💳 Updating PAYG customer with API...');
      return await this.api.post('/api/v1/billing/update-payg-customer', {
        stripeCustomerId,
        subscriptionId
      });
    } catch (error) {
      console.error('❌ Update PAYG customer failed:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(): Promise<AxiosResponse> {
    try {
      console.log('📊 Getting subscription status from API...');
      return await this.api.get('/api/v1/billing/subscription-status');
    } catch (error) {
      console.error('❌ Get subscription status failed:', error);
      throw error;
    }
  }

  async createBillingPortalSession(): Promise<AxiosResponse> {
    try {
      console.log('🔗 Creating billing portal session...');
      return await this.api.post('/api/v1/billing/create-portal-session');
    } catch (error) {
      console.error('❌ Create billing portal session failed:', error);
      throw error;
    }
  }

  async syncSubscriptionStatus(): Promise<AxiosResponse> {
    try {
      console.log('🔄 Syncing subscription status with Stripe...');
      return await this.api.post('/api/v1/billing/sync-subscription');
    } catch (error) {
      console.error('❌ Sync subscription failed:', error);
      throw error;
    }
  }
}

// Legacy API service for backward compatibility
export const apiService = {
  // Health checks
  healthCheck: () => apiWithFallback(
    () => api.get('/api/v1/health'), 
    mockData.health, 
    'Health check'
  ),
  
  apiHealthCheck: () => apiWithFallback(
    () => api.get('/api/v1/health'), 
    mockData.health, 
    'API health check'
  ),

  // =============================================================================
  // MARKETING TOOL METHODS
  // =============================================================================

  getMarketingToolStats: () => apiWithFallback(
    () => api.get('/api/v1/marketing-tool/stats'),
    {
      totalPosts: 12,
      scheduledPosts: 3,
      aiGenerated: 8,
      engagementRate: 4.2,
      socialAccounts: 3,
      mediaFiles: 24,
      recentActivity: [
        { id: '1', action: 'Post published to Instagram', timestamp: new Date().toISOString(), type: 'success' },
        { id: '2', action: 'AI caption generated', timestamp: new Date().toISOString(), type: 'info' },
        { id: '3', action: 'Schedule updated', timestamp: new Date().toISOString(), type: 'info' }
      ],
      subscriptionTier: 'free',
      aiCreditsRemaining: 50,
      aiEditsRemaining: 25
    },
    'Marketing tool stats'
  ),

  createMarketingPost: (postData: CreatePostRequest) => apiWithFallback(
    () => api.post('/api/v1/posts', postData),
    {
      success: true,
      postId: `post_${Date.now()}`
    },
    'Create marketing post'
  ),

  // === AI CONTENT GENERATION (Updated to match backend) ===
  
  // AI Caption Generation
  generateCaptionsFromMedia: (data: {
    media_ids: number[];
    style: 'engaging' | 'professional' | 'casual' | 'funny';
    platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube';
    auto_apply?: boolean;
  }) => apiWithFallback(
    () => api.post('/api/v1/ai/captions/generate-from-media', data), 
    { captions: ['🌟 Amazing content coming your way! #exciting #demo'] },
    'Caption generation'
  ),

  generateCustomCaptions: (data: {
    content: string;
    tone: string;
    platform: string;
    audience?: string;
    brand_voice?: string;
  }) => apiWithFallback(
    () => api.post('/api/v1/ai/captions/generate-custom', data), 
    { captions: ['✨ Custom caption generated for your content! #AI #creative'] },
    'Custom caption generation'
  ),

  // AI Hashtag Generation
  generateHashtags: (data: {
    content: string;
    platforms?: string[];
    niche?: string;
    count?: number;
    trending?: boolean;
  }) => apiWithFallback(
    () => api.post('/api/v1/ai/hashtags/generate', data), 
    { hashtags: ['#content', '#social', '#marketing', '#demo', '#AI'] },
    'Hashtag generation'
  ),

  // AI Content Suggestions
  generateContentSuggestions: (data: {
    content: string;
    platform?: string;
    variation_count?: number;
    improvement_focus?: string;
  }) => apiWithFallback(
    () => api.post('/api/v1/ai/content/suggestions', data), 
    { suggestions: ['Try adding more emojis!', 'Consider a call-to-action', 'Include trending hashtags'] },
    'Content suggestions'
  ),

  // AI Content Ideas
  generateContentIdeas: (data: {
    topic?: string;
    platform?: string;
    content_type?: string;
    audience?: string;
    brand_voice?: string;
    count?: number;
  }) => apiWithFallback(
    () => api.post('/api/v1/ai/content/ideas', data), 
    { ideas: ['Behind-the-scenes content', 'User-generated content campaign', 'Tutorial series'] },
    'Content ideas generation'
  ),

  // Imagen 3 Image Generation
  generateImages: (data: {
    prompt: string;
    style?: string;
    aspect_ratio?: string;
    count?: number;
  }) => apiWithFallback(
    () => api.post('/api/v1/ai/images/generate', data), 
    { images: [{ url: '/images/placeholder-generated.jpg', prompt: data.prompt }] },
    'Image generation'
  ),

  // Veo Video Generation (Updated to match backend)
  generateVideos: (data: {
    prompt: string;
    duration?: number;
    style?: string;
    aspect_ratio?: string;
    fps?: number;
  }) => apiWithFallback(() => api.post('/api/v1/ai/videos/generate', data), {
    videos: [{ url: '/videos/placeholder-video.mp4', id: 'generated-video-1' }]
  }),

  // Highlight Reel Generation (Updated algorithm with multi-stage analysis)
  generateHighlights: (data: {
    media_ids: number[];
    duration: number;
    highlight_type: string;
    style: string;
    include_text: boolean;
    include_music: boolean;
    context_padding?: number;
    content_instructions?: string;
    cost_optimize?: boolean;
    max_cost?: number;
    example?: {
      start_time?: number;
      end_time?: number;
      description?: string;
    };
  }) => apiWithFallback(() => api.post('/api/ai/highlights', data), {
    success: true,
    highlight_url: '/videos/highlight-reel.mp4',
    duration: data.duration,
    segments: [
      { startTime: 10, endTime: 20, score: 0.85, confidence: 0.9, description: 'High action sequence' },
      { startTime: 45, endTime: 55, score: 0.78, confidence: 0.85, description: 'Key moment detected' }
    ],
    generation_metadata: {
      processing_time_ms: 2500,
      ai_calls_made: 8,
      estimated_cost: 0.08,
      algorithm_stages: [
        { name: 'Technical Pre-filtering', cost: 0, segments: [] },
        { name: 'AI Content Analysis', cost: 0.08, segments: [] }
      ],
      video_duration: 1800,
      compression_ratio: data.duration / 1800,
      confidence_score: 0.82,
      style_applied: data.style,
      cost_optimized: data.cost_optimize || true,
      fallback_used: false
    }
  }),

  // === MEDIA PROCESSING (Updated to match backend) ===
  
  // Media Upload (Updated to match backend)
  uploadMedia: async (formData: FormData, onProgress?: (progress: number) => void) => {
    console.log('🚀 uploadMedia called in API service');
    console.log('📝 Development fallback mode:', DEVELOPMENT_FALLBACK);
    console.log('🌐 API Base URL:', API_BASE_URL);
    
    // Check authentication status
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    console.log('🔑 Auth token present:', !!token);
    if (token) {
      console.log('🔐 Token length:', token.length);
      console.log('🔐 Token starts with:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No authentication token found - will use local proxy as fallback');
    }
    
    const uploadCall = () => {
                      console.log('📤 Making actual API call to /api/v1/media/upload');
        console.log('📡 Full URL:', `${API_BASE_URL}/api/v1/media/upload`);
        return api.post('/api/v1/media/upload', formData, {
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
      .catch(async (error) => {
        console.error('❌ Direct apiWithFallback error:', error);
        console.log('🔄 Trying local proxy as last resort...');
        
        // Try local proxy as last resort
        try {
          const response = await fetch('/api/media-proxy/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
          }
          console.log('✅ Local proxy upload succeeded:', data);
          return { data };
        } catch (proxyError) {
          console.error('❌ Local proxy also failed:', proxyError);
          throw error; // Throw original error
        }
      });
  },

  // Enhanced method for uploading completed posts with full metadata
  uploadCompletedPost: async (formData: FormData) => {
    console.log('🚀 uploadCompletedPost called in API service');
    
    // Check authentication status
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      console.log('⚠️ No authentication token found - using local proxy');
      // Use local proxy endpoint that doesn't require authentication
      try {
        const response = await fetch('/api/media-proxy/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }
        return { data };
      } catch (error) {
        console.error('❌ Local proxy upload failed:', error);
        throw error;
      }
    }
    
    const uploadCall = () => {
      console.log('📤 Making API call to /media for completed post');
      return api.post('/api/v1/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60 second timeout for completed posts
      });
    };

    // Extract metadata for mock response
    const metadataStr = formData.get('metadata') as string;
    let metadata = {};
    try {
      metadata = metadataStr ? JSON.parse(metadataStr) : {};
    } catch (e) {
      console.warn('Failed to parse metadata:', e);
    }

    const file = formData.get('file') as File;
    const mockData = {
      id: Math.floor(Math.random() * 1000000).toString(),
      name: file?.name || 'unknown',
      type: file?.type.startsWith('video') ? 'video' : file?.type.startsWith('image') ? 'image' : 'audio',
      url: `mock-url-${Date.now()}`,
      thumbnail: undefined,
      size: file?.size || 0,
      createdAt: new Date().toISOString(),
      tags: (metadata as any)?.tags || []
    };

    return apiWithFallback(uploadCall, mockData, `Upload completed post: ${file?.name || 'unknown'}`);
  },

  // Get Media (Updated to match backend)
  getMedia: (mediaId: string) => apiWithFallback(() => api.get(`/media/${mediaId}`), 
    mockData.media.find(m => m.id === mediaId) || mockData.media[0]
  ),
  
  // Get All Media/Library (New method)
  getMediaLibrary: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    console.log('📚 getMediaLibrary called - Auth token present:', !!token);
          console.log('📡 Full URL for media library:', `${API_BASE_URL}/media`);
    
    // Test backend health first
    try {
      console.log('🏥 Testing backend health...');
      const healthResponse = await api.get('/health');
      console.log('✅ Backend health check passed:', healthResponse.status);
    } catch (healthError: any) {
      console.error('❌ Backend health check failed:', {
        status: healthError?.response?.status,
        message: healthError?.message,
        url: `${API_BASE_URL}/health`
      });
    }
    
    // Test authentication if token exists
    if (token) {
      try {
        console.log('🔐 Testing authentication with /api/v1/auth/me...');
        const authResponse = await api.get('/api/v1/auth/me');
        console.log('✅ Authentication check passed:', authResponse.status);
      } catch (authError: any) {
        console.error('❌ Authentication check failed:', {
          status: authError?.response?.status,
          message: authError?.message,
          url: `${API_BASE_URL}/api/v1/auth/me`,
          responseData: authError?.response?.data
        });
      }
    } else {
      console.warn('⚠️ No authentication token found in localStorage');
    }
    
    return apiWithFallback(() => api.get('/api/v1/media/'), []);
  },
  
  // Delete Media
      deleteMedia: (mediaId: string) => apiWithFallback(() => api.delete(`/api/v1/media/${mediaId}`), { success: true }),

  // Gallery Management
  getMediaGalleries: () => apiWithFallback(() => api.get('/api/v1/galleries'), []),
  
  createMediaGallery: (name: string, caption?: string) => apiWithFallback(
    () => api.post('/api/v1/galleries', { title: name, images: [] }),
    { id: Date.now(), title: name, images: [], created_date: new Date().toISOString() }
  ),
  
  addMediaToGallery: (galleryId: string, mediaIds: string[]) => apiWithFallback(
    () => api.post(`/api/v1/galleries/${galleryId}/items`, { media_ids: mediaIds }),
    { added_count: mediaIds.length }
  ),
  
  removeMediaFromGallery: (galleryId: string, mediaIds: string[]) => apiWithFallback(
    () => api.delete(`/api/v1/galleries/${galleryId}/items`, { data: { media_ids: mediaIds } }),
    { removed_count: mediaIds.length }
  ),

  // Video Processing (Updated to match backend)
  processVideo: (data: {
    video_id: string;
    operations: Array<{
      type: 'trim' | 'resize' | 'add_captions' | 'compress' | 'extract_audio' | 'add_effects';
      [key: string]: any;
    }>;
    output_format: 'mp4' | 'webm' | 'mov';
    quality?: string;
  }) => api.post('/api/v1/media/video/process', data),

  // Media Tags Generation (Updated to match new backend naming)
  generateMediaTags: (mediaId: string, data?: {
    auto_detect?: boolean;
    custom_tags?: string[];
    confidence_threshold?: number;
  }) => api.post(`/api/v1/ai/media/${mediaId}/tags/generate`, data),

  // Bulk Media Tags Generation (Updated to match new backend naming)
  generateBulkMediaTags: (data: {
    media_ids: string[];
    auto_detect?: boolean;
    custom_tags?: string[];
    confidence_threshold?: number;
  }) => api.post('/api/v1/ai/media/tags/bulk-generate', data),

  // Thumbnail Generation (Updated to match backend)
  generateThumbnails: (data: {
    video_id: string;
    timestamp?: number;
    count?: number;
    style?: 'auto' | 'cinematic' | 'bright';
  }) => api.post('/api/v1/media/thumbnails/generate', data),

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
      ? `/api/v1/analytics/performance/${params.platform}`
      : '/api/v1/analytics/performance';
    
    return api.get(`${endpoint}?${queryParams.toString()}`);
  },

  // Track Analytics (Updated to match backend)
  trackAnalytics: (data: {
    event_type: string;
    platform: string;
    content_id?: string;
    engagement_type?: string;
    timestamp?: string;
  }) => api.post('/api/v1/analytics/track', data),

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
  }) => api.post('/api/v1/bulk/upload', data),

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
  }) => api.post('/api/v1/bulk/schedule', data),

  // Bulk Job Status (Updated to match backend)
  getBulkJobStatus: (jobId: string) => api.get(`/api/v1/bulk/status/${jobId}`),
  
  // === DIAGNOSTIC UTILITIES ===
  
  // Run comprehensive system diagnostics
  runDiagnostics: async () => {
    console.log('🔍 Running system diagnostics...');
    const results = {
      apiBaseUrl: API_BASE_URL,
      authToken: false,
      backendHealth: false,
      authentication: false,
      mediaEndpoint: false,
      errors: [] as string[]
    };
    
    // Check auth token
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    results.authToken = !!token;
    console.log('🔑 Auth token check:', results.authToken);
    
    if (!token) {
      results.errors.push('No authentication token found in localStorage');
    }
    
    // Check backend health
    try {
      const healthResponse = await api.get('/health');
      results.backendHealth = healthResponse.status === 200;
      console.log('🏥 Backend health check:', results.backendHealth);
    } catch (error: any) {
      results.errors.push(`Backend health check failed: ${error.response?.status || error.message}`);
      console.log('❌ Backend health check failed');
    }
    
    // Check authentication if token exists
    if (token) {
      try {
        const authResponse = await api.get('/api/v1/auth/me');
        results.authentication = authResponse.status === 200;
        console.log('🔐 Authentication check:', results.authentication);
      } catch (error: any) {
        results.errors.push(`Authentication check failed: ${error.response?.status || error.message}`);
        console.log('❌ Authentication check failed');
      }
    }
    
    // Check media endpoint accessibility
    if (token) {
      try {
        const mediaResponse = await api.get('/api/v1/media/');
        results.mediaEndpoint = mediaResponse.status === 200;
        console.log('📚 Media endpoint check:', results.mediaEndpoint);
      } catch (error: any) {
        results.errors.push(`Media endpoint check failed: ${error.response?.status || error.message}`);
        console.log('❌ Media endpoint check failed:', error.response?.status);
      }
    }
    
    console.log('📊 Diagnostics complete:', results);
    return results;
  },

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
  }) => api.post('/api/v1/previews/generate', data),

  // Get Preview (Updated to match backend)
  getPreview: (previewId: string, platform?: string) => {
    const params = platform ? `?platform=${platform}` : '';
    return api.get(`/api/v1/previews/${previewId}${params}`);
  },

  // === LEGACY ENDPOINTS (keeping for backward compatibility) ===
  
  // Post management (existing functionality)
  createPost: (post: any) => api.post('/api/v1/posts', post),
  getPosts: (params?: { page?: number; limit?: number; status?: string; platform?: string }) => 
    api.get('/api/v1/posts', { params }),
  updatePost: (id: string, updates: any) => api.patch(`/api/v1/posts/${id}`, updates),
  deletePost: (id: string) => api.delete(`/api/v1/posts/${id}`),
  schedulePost: (id: string, scheduledFor: Date) => 
    api.post(`/api/v1/posts/${id}/schedule`, { scheduledFor }),
  publishPost: (id: string) => api.post(`/api/v1/posts/${id}/publish`),

  // Platform integrations (existing functionality)
  connectPlatform: (platform: string, credentials: any) => 
    api.post(`/api/v1/platforms/${platform}/connect`, credentials),
  disconnectPlatform: (platform: string) => 
    api.delete(`/api/v1/platforms/${platform}`),
  getPlatformStatus: () => api.get('/api/v1/platforms/status'),

  // User settings (existing functionality)
  getUserSettings: () => api.get('/api/v1/users/settings'),
  updateUserSettings: (settings: any) => api.patch('/api/v1/users/settings', settings),

  // === COMPLIANCE & PLATFORM REQUIREMENTS ===
  
  // Comprehensive Compliance Audit
  comprehensiveComplianceCheck: () => apiWithFallback(() => api.get('/compliance/comprehensive-check'), { status: 'ok', note: 'mock compliance check' }),

  // Platform-specific Requirements
  getPlatformRequirements: (platformId: string) => apiWithFallback(() => api.get(`/compliance/platform/${platformId}`), {
    platformId,
    requirements: []
  }),

  // All Platforms Compliance Overview
  getPlatformsSummary: () => apiWithFallback(() => api.get('/compliance/platforms/summary'), { summary: [] }),

  // Rate Limiting Information
  getRateLimits: () => apiWithFallback(() => api.get('/compliance/rate-limits'), { rateLimits: [] }),

  // Authentication Requirements
  getAuthRequirements: () => apiWithFallback(() => api.get('/compliance/authentication-requirements'), { auth: [] }),

  // Content Policies
  getContentPolicies: () => apiWithFallback(() => api.get('/compliance/content-policies'), { policies: [] }),

  // Privacy Requirements
  getPrivacyRequirements: () => apiWithFallback(() => api.get('/compliance/privacy-requirements'), { privacy: [] }),

  // Content Validation
  validateContent: (data: {
    content: string;
    platform: string;
    content_type: 'text' | 'image' | 'video' | 'story';
    media_urls?: string[];
    metadata?: Record<string, any>;
  }) => api.post('/compliance/compliance/validate-content', data),

  // Compliance System Health Check
  complianceHealthCheck: () => apiWithFallback(() => api.get('/compliance/health-check'), { status: 'ok', timestamp: new Date().toISOString() }),

  // === UTILITY FUNCTIONS ===
  
  // Check if backend is responsive
  ping: () => api.get('/ping'),
  
  // Get API version info
  getVersion: () => api.get('/version'),
  
  // Real-time features (WebSocket would be handled separately)
  subscribeToUpdates: (callback: (data: any) => void) => {
      // WebSocket implementation would go here
      console.log('WebSocket subscription not implemented yet');
    },
};

export default apiService; 