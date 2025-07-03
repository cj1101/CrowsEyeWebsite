import { Timestamp } from 'firebase/firestore';

// Base types
export interface FirestoreDocument {
  id?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// User document
export interface UserDocument extends FirestoreDocument {
  email: string;
  username: string;
  fullName?: string;
  isActive: boolean;
  subscriptionTier: 'free' | 'spark' | 'creator' | 'pro' | 'payg';
  passwordHash?: string; // Only used for migration, not stored in production
  stripeCustomerId?: string;
  profileImage?: string;
  bio?: string;
  /**
   * Usage and quota tracking for the user (optional – may not be present on all legacy accounts)
   */
  usage_limits?: {
    linked_accounts: number;
    max_linked_accounts: number;
    ai_credits: number;
    max_ai_credits: number; // -1 denotes unlimited (PAYG)
    scheduled_posts: number;
    max_scheduled_posts: number;
    media_storage_mb: number;
    max_media_storage_mb: number;
  };
}

// Media item document
export interface MediaDocument extends FirestoreDocument {
  userId: string;
  filename: string;
  originalFilename: string;
  gcsPath: string;
  thumbnailPath?: string;
  mediaType: 'image' | 'video' | 'audio';
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  caption?: string;
  description?: string;
  aiTags?: Array<{ tag: string; confidence: number }>;
  isPostReady: boolean;
  status: 'draft' | 'published' | 'scheduled';
  postMetadata?: Record<string, any>;
  platforms?: string[];
  googlePhotosId?: string;
  googlePhotosMetadata?: Record<string, any>;
  importSource?: 'manual' | 'google_photos' | 'upload';
  importDate?: Timestamp | Date;
  uploadDate: Timestamp | Date;
}

// Gallery document
export interface GalleryDocument extends FirestoreDocument {
  userId: string;
  name: string;
  caption?: string;
  mediaIds: string[];
  createdDate: Timestamp | Date;
}

// Post document
export interface PostDocument extends FirestoreDocument {
  userId: string;
  title: string;
  content?: string;
  imagePath?: string;
  videoPath?: string;
  description?: string;
  tags?: string[];
  platforms?: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Timestamp | Date;
}

// Finished content document
export interface FinishedContentDocument extends FirestoreDocument {
  userId: string;
  title: string;
  contentType: 'post' | 'image' | 'video' | 'gallery';
  filePath?: string;
  caption?: string;
  hashtags?: string[];
  targetPlatforms?: string[];
  metadata?: Record<string, any>;
  expiresAt: Timestamp | Date;
  isPublished: boolean;
  publishDate?: Timestamp | Date;
}

// Schedule document
export interface ScheduleDocument extends FirestoreDocument {
  userId: string;
  postId?: string;
  contentId?: string;
  scheduledTime: Timestamp | Date;
  platforms: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Template document
export interface TemplateDocument extends FirestoreDocument {
  userId: string;
  name: string;
  content: string;
  platforms?: string[];
  metadata?: Record<string, any>;
}

// Analytics document
export interface AnalyticsDocument extends FirestoreDocument {
  userId: string;
  postId?: string;
  platform: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
    impressions?: number;
    reach?: number;
    engagement?: number;
    [key: string]: number | undefined;
  };
  recordedAt: Timestamp | Date;
  period?: string;
}

// Google Photos connection document
export interface GooglePhotosConnectionDocument extends FirestoreDocument {
  userId: string;
  googleUserId?: string;
  googleEmail?: string;
  connectionDate: Timestamp | Date;
  lastSyncDate?: Timestamp | Date;
  isActive: boolean;
  tokenData?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Timestamp | Date;
  };
}

// Knowledge base document (AI memory)
export interface KnowledgeBaseDocument extends FirestoreDocument {
  userId: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Context file document
export interface ContextFileDocument extends FirestoreDocument {
  userId: string;
  filename: string;
  content: string;
  fileType?: string;
  metadata?: Record<string, any>;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  MEDIA: 'media',
  GALLERIES: 'galleries',
  POSTS: 'posts',
  FINISHED_CONTENT: 'finishedContent',
  SCHEDULES: 'schedules',
  TEMPLATES: 'templates',
  ANALYTICS: 'analytics',
  GOOGLE_PHOTOS_CONNECTIONS: 'googlePhotosConnections',
  KNOWLEDGE_BASE: 'knowledgeBase',
  CONTEXT_FILES: 'contextFiles',
} as const;

// Helper type for collection names
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS]; 