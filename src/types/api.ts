/**
 * Centralized Type Definitions for Crow's Eye API
 * All API-related types in one place for better maintainability
 */

// Base Types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Authentication Types
export interface AuthResponse {
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

export interface User {
  user_id: string;
  email: string;
  username?: string;
  subscription: SubscriptionInfo;
  usage_stats: UsageStats;
  preferences: Record<string, any>;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  start_date: string;
  end_date?: string;
  features: string[];
}

export enum SubscriptionTier {
  FREE = 'FREE',
  CREATOR = 'CREATOR',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
}

export interface UsageStats {
  media_uploaded: number;
  galleries_created: number;
  stories_formatted: number;
  highlights_generated: number;
  api_calls_made: number;
}

// Media Types
export interface MediaFile extends BaseEntity {
  filename: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  uploaded_at: string;
  path?: string;
  format?: string;
  dimensions?: [number, number];
  duration?: number;
  caption?: string;
  ai_tags: string[];
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  size: number;
  createdAt: string;
  tags: string[];
}

export interface MediaSearchResponse {
  items: MediaFile[];
  total: number;
  query?: string;
  filters: Record<string, any>;
}

export interface MediaUploadResponse {
  id: string;
  filename: string;
  status: string;
  message: string;
  media_item?: MediaFile;
}

// Gallery Types
export interface Gallery extends BaseEntity {
  name: string;
  prompt: string;
  media_ids: string[];
  description?: string;
  thumbnail_url?: string;
  tags: string[];
  caption?: string;
}

export interface GalleryItem {
  id: string;
  name: string;
  description: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// Story Types
export interface Story extends BaseEntity {
  title: string;
  content: string;
  platform: string;
  template_id?: string;
  media_ids?: string[];
  status: 'draft' | 'published' | 'scheduled';
}

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  platform: string;
  content_structure: Record<string, any>;
  preview_image?: string;
}

// Highlight Reel Types
export interface HighlightReel extends BaseEntity {
  name: string;
  duration: number;
  style: string;
  media_ids: string[];
  status: 'processing' | 'completed' | 'failed';
  url?: string;
  clips?: string[];
  music_style?: string;
  progress?: number;
}

// Audio Types
export interface AudioFile extends BaseEntity {
  filename: string;
  url: string;
  duration: number;
  effects: string[];
  format?: string;
  size?: number;
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  duration: number;
  format: string;
  effects: string[];
  createdAt: string;
}

// Analytics Types
export interface AnalyticsData {
  topPosts: TopPost[];
  platformStats: PlatformStats[];
  engagement: EngagementMetrics;
  insights: string[];
}

export interface TopPost {
  id: string;
  title: string;
  platform: string;
  engagement: number;
  reach: number;
  date: string;
}

export interface PlatformStats {
  platform: string;
  posts: number;
  engagement: number;
  reach: number;
  growth: number;
}

export interface EngagementMetrics {
  total_likes: number;
  total_comments: number;
  total_shares: number;
  engagement_rate: number;
  reach: number;
  impressions: number;
}

// Request/Response Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, any>;
}

// API Request Options
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

// Feature Access Types
export enum Feature {
  MEDIA_UPLOAD = 'MEDIA_UPLOAD',
  SMART_GALLERIES = 'SMART_GALLERIES',
  STORY_FORMATTING = 'STORY_FORMATTING',
  HIGHLIGHT_REELS = 'HIGHLIGHT_REELS',
  AUDIO_IMPORT = 'AUDIO_IMPORT',
  ANALYTICS = 'ANALYTICS',
  ADMIN_PANEL = 'ADMIN_PANEL',
  API_ACCESS = 'API_ACCESS',
}

// Common API Response Wrapper
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

// Upload Progress
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Search and Filter Types
export interface SearchParams {
  query?: string;
  type?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FilterOptions {
  type?: 'image' | 'video' | 'audio' | 'all';
  platform?: string;
  date_range?: {
    start: string;
    end: string;
  };
  tags?: string[];
} 