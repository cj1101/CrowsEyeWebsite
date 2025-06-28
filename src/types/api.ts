/**
 * Centralized Type Definitions for Crow's Eye API
 * All API-related types in one place for better maintainability
 * Updated to match backend implementation exactly
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

// === AI CONTENT GENERATION TYPES (Updated to match backend) ===

export interface CaptionGenerationRequest {
  media_ids: number[];
  style: 'engaging' | 'professional' | 'casual' | 'funny';
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube';
  auto_apply?: boolean;
}

export interface CaptionGenerationResponse {
  results: Array<{
    media_id: number;
    caption: string;
    status: 'success' | 'failed';
  }>;
  total_processed: number;
  success_count: number;
}

export interface HashtagGenerationRequest {
  content: string;
  platforms?: string[];
  niche?: string;
  count?: number;
  trending?: boolean;
}

export interface HashtagGenerationResponse {
  hashtags: string[];
  trending_hashtags: string[];
  niche_hashtags: string[];
  total: number;
  platform_optimized: Record<string, string[]>;
  niche: string;
}

export interface ContentIdeasRequest {
  topic?: string;
  platform?: string;
  content_type?: string;
  audience?: string;
  brand_voice?: string;
  count?: number;
}

export interface ContentIdeasResponse {
  ideas: Array<{
    id: string;
    title: string;
    description: string;
    platform: string;
    content_type: string;
    suggested_hashtags: string[];
    engagement_potential: 'low' | 'medium' | 'high';
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  total: number;
  platform: string;
  content_type: string;
  generation_metadata: Record<string, any>;
}

export interface ImageGenerationRequest {
  prompt: string;
  style: 'photorealistic' | 'artistic' | 'cartoon';
  aspect_ratio: '1:1' | '16:9' | '4:5';
  quality: 'standard' | 'hd';
  count?: number;
}

export interface ImageGenerationResponse {
  images: Array<{
    image_url: string;
    image_id: string;
    width: number;
    height: number;
    format: string;
  }>;
  generation_time: number;
  total_cost: number;
  prompt_used: string;
  style_applied: string;
}

export interface VideoGenerationRequest {
  prompt: string;
  duration?: number;
  style?: string;
  aspect_ratio?: string;
  fps?: number;
}

export interface VideoGenerationResponse {
  video_url: string;
  video_id: string;
  duration: number;
  generation_time: number;
  total_cost: number;
  metadata: {
    style: string;
    aspect_ratio: string;
    fps: number;
    prompt: string;
  };
}

export interface HighlightGenerationRequest {
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
  scene_count?: number;
}

export interface HighlightGenerationResponse {
  highlight_url: string;
  thumbnail_url: string;
  duration: number;
  style_used: string;
  media_count: number;
  generation_metadata: Record<string, any>;
  message: string;
}

// === MEDIA PROCESSING TYPES (Updated to match backend) ===

export interface MediaFile extends BaseEntity {
  filename: string;
  media_type: 'image' | 'video';
  file_size: number;
  upload_url: string;
  thumbnail_url?: string;
  caption?: string;
  subtype?: string;
  isProcessed?: boolean;
}

export interface VideoProcessingRequest {
  video_id: string;
  operations: Array<{
    type: 'trim' | 'resize' | 'add_captions' | 'compress' | 'extract_audio' | 'add_effects';
    [key: string]: any;
  }>;
  output_format: 'mp4' | 'webm' | 'mov';
  quality?: string;
}

export interface VideoProcessingResponse {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  processed_video_url: string;
  estimated_time: number;
  operations_applied: string[];
}

export interface ThumbnailGenerationRequest {
  video_id: string;
  timestamp?: number;
  count?: number;
  style?: 'auto' | 'cinematic' | 'bright';
}

export interface ThumbnailGenerationResponse {
  thumbnails: Array<{
    thumbnail_id: string;
    url: string;
    timestamp: number;
    quality_score: number;
    width: number;
    height: number;
    file_size: number;
  }>;
  video_id: string;
  total_generated: number;
  best_thumbnail: {
    thumbnail_id: string;
    url: string;
    timestamp: number;
    quality_score: number;
  };
}

// === ANALYTICS TYPES (Updated to match backend) ===

export interface PerformanceAnalyticsResponse {
  platform: string;
  date_range: {
    start: string;
    end: string;
  };
  metrics: {
    likes: {
      total: number;
      average: number;
      growth: number;
      best_day: number;
    };
    comments: {
      total: number;
      average: number;
      growth: number;
      best_day: number;
    };
    shares: {
      total: number;
      average: number;
      growth: number;
      best_day: number;
    };
    reach: {
      total: number;
      average: number;
      growth: number;
      best_day: number;
    };
  };
  trends: Array<{
    date: string;
    metrics: {
      likes: number;
      comments: number;
      shares?: number;
      reach?: number;
    };
  }>;
  insights: string[];
  total_posts: number;
}

export interface TrackAnalyticsRequest {
  event_type: string;
  platform: string;
  content_id?: string;
  engagement_type?: string;
  timestamp?: string;
}

export interface TrackAnalyticsResponse {
  success: boolean;
  event_id: string;
  message: string;
}

// === BULK OPERATIONS TYPES (Updated to match backend) ===

export interface BulkUploadRequest {
  files: Array<{
    filename: string;
    size: number;
    type: string;
  }>;
  folder_path?: string;
  auto_process?: boolean;
  processing_options?: Record<string, any>;
}

export interface BulkUploadResponse {
  job_id: string;
  status: 'completed' | 'processing' | 'failed';
  total_files: number;
  processed_files: number;
  failed_files: number;
  uploaded_media: Array<{
    media_id: string;
    filename: string;
    status: 'uploaded' | 'failed';
    upload_url?: string;
  }>;
}

export interface BulkScheduleRequest {
  posts: Array<{
    id: string;
    scheduled_time: string;
  }>;
  schedule_options?: {
    timezone?: string;
    auto_optimize?: boolean;
  };
  platforms?: string[];
}

export interface BulkScheduleResponse {
  job_id: string;
  status: 'completed' | 'processing' | 'failed';
  scheduled_count: number;
  failed_count: number;
  schedule_details: Array<{
    schedule_id: string;
    post_id: string;
    platforms: string[];
    scheduled_time: string;
    status: 'scheduled' | 'failed';
    platform_posts: Record<string, {
      post_id: string;
      status: string;
    }>;
  }>;
}

export interface BulkJobStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_items: number;
  processed_items: number;
  failed_items: number;
  estimated_completion: string;
  results?: any;
}

// === PLATFORM PREVIEWS TYPES (Updated to match backend) ===

export interface PreviewGenerationRequest {
  content: {
    caption: string;
    hashtags?: string[];
    media_url?: string;
    media_type?: string;
  };
  platforms: string[];
  preview_type?: 'post' | 'story';
}

export interface PreviewGenerationResponse {
  preview_id: string;
  previews: Record<string, {
    platform: string;
    preview_type: string;
    caption: string;
    hashtags: string[];
    media_preview: {
      type: string;
      url: string;
      aspect_ratio: string;
    };
    engagement_estimate: {
      likes: string;
      comments: string;
      shares: string;
    };
    character_count: number;
    max_characters: number;
  }>;
  expiry_time: string;
  total_platforms: number;
}

export interface PreviewResponse {
  preview_id: string;
  platform: string;
  preview_data: any;
  generated_at: string;
  expires_at: string;
}

// === LEGACY TYPES (keeping for backward compatibility) ===

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  size: number;
  createdAt: string;
  tags: string[];
  status?: 'completed' | 'unedited';
  subtype?: string;
  isProcessed?: boolean;
}

export interface MediaSearchResponse {
  items: MediaFile[];
  total: number;
  query?: string;
  filters: Record<string, any>;
}

export interface MediaUploadResponse {
  id: number;
  filename: string;
  media_type: 'image' | 'video';
  file_size: number;
  upload_url: string;
  thumbnail_url?: string;
  caption?: string;
  created_at: string;
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

// Highlight Reel Types (legacy)
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

// Analytics Types (legacy)
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
  reach: number;
  impressions: number;
}

// === UTILITY TYPES ===

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  detail: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

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

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

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