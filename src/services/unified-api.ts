// Unified API Service - Direct Third-Party Integrations
// Replaces CrowsEyeAPI with direct calls to Firebase, Google, and social platforms

import { firebaseAuthService, type User, type AuthResponse, type RegisterData, type LoginCredentials } from './firebase-auth';
import { firebaseStorageService, type MediaItem, type Gallery, type UploadProgress } from './firebase-storage';
import { geminiAIService, type AIGenerationRequest, type AIGenerationResponse, type ComplianceCheck, type ComplianceResult } from './gemini-ai';
import { socialPlatformsService, type PlatformConnection, type PostData, type ScheduledPost } from './social-platforms';
import { googleServicesAPI, type GooglePhotosAuth, type GooglePhotosAlbum, type GooglePhotosMediaItem } from './google-services';
import { getFirestore, collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

// Types for compatibility with existing frontend code
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

export interface RecentActivity {
  id: string;
  action: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning';
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

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const db = getFirestore(app);

export class UnifiedAPIService {
  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================
  
  async register(userData: RegisterData): Promise<AuthResponse> {
    return await firebaseAuthService.register(userData);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return await firebaseAuthService.login(credentials);
  }

  async getCurrentUser(): Promise<APIResponse<User>> {
    try {
      const user = await firebaseAuthService.getCurrentUser();
      if (user) {
        return { success: true, data: user };
      } else {
        return { success: false, error: 'No user logged in' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      await firebaseAuthService.logout();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    return await firebaseAuthService.requestPasswordReset(email);
  }

  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; error?: string; user?: User }> {
    return await firebaseAuthService.updateProfile(profileData);
  }

  async applyPromoCode(promoCode: string): Promise<{ success: boolean; error?: string; user?: User }> {
    return await firebaseAuthService.applyPromoCode(promoCode);
  }

  async healthCheck(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test Firebase connection by getting current user
      await firebaseAuthService.getCurrentUser();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test multiple services
      const authTest = await firebaseAuthService.getCurrentUser();
      const aiTest = await geminiAIService.testConnection();
      
      if (aiTest.success) {
        return { success: true };
      } else {
        return { success: false, error: 'AI service connection failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =============================================================================
  // PLATFORM CONNECTION METHODS
  // =============================================================================

  async getPlatforms(): Promise<{ success: boolean; data?: PlatformConnection[]; error?: string }> {
    return await socialPlatformsService.getPlatforms();
  }

  async connectPlatform(platform: string): Promise<{ success: boolean; error?: string }> {
    return await socialPlatformsService.connectPlatform(platform);
  }

  async disconnectPlatform(platform: string): Promise<{ success: boolean; error?: string }> {
    return await socialPlatformsService.disconnectPlatform(platform);
  }

  async getPlatformStatus(platform: string): Promise<{ success: boolean; data?: PlatformConnection; error?: string }> {
    return await socialPlatformsService.getPlatformStatus(platform);
  }

  async postToPlatform(platform: string, postData: PostData): Promise<{ success: boolean; post_id?: string; error?: string }> {
    return await socialPlatformsService.postToPlatform(platform, postData);
  }

  // =============================================================================
  // SCHEDULING METHODS
  // =============================================================================

  async getSchedules(): Promise<{ success: boolean; data?: ScheduledPost[]; error?: string }> {
    return await socialPlatformsService.getSchedules();
  }

  async createSchedule(scheduleData: Omit<ScheduledPost, 'id' | 'created_at' | 'status'>): Promise<{ success: boolean; scheduled_post?: ScheduledPost; error?: string }> {
    return await socialPlatformsService.createSchedule(scheduleData);
  }

  async deleteSchedule(scheduleId: string): Promise<{ success: boolean; error?: string }> {
    return await socialPlatformsService.deleteSchedule(scheduleId);
  }

  async publishPost(postData: PostData): Promise<{ success: boolean; results?: any[]; error?: string }> {
    try {
      const results = [];
      
      for (const platform of postData.platforms) {
        const result = await socialPlatformsService.postToPlatform(platform, postData);
        results.push({ platform, ...result });
      }
      
      return { success: true, results };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =============================================================================
  // ANALYTICS METHODS (Mock implementation)
  // =============================================================================

  async getAnalyticsOverview(dateRange?: { start: string; end: string }): Promise<{ success: boolean; data?: AnalyticsOverview; error?: string }> {
    try {
      // Mock analytics data - in reality would aggregate from platforms
      const overview: AnalyticsOverview = {
        total_posts: 0,
        total_engagement: 0,
        reach: 0,
        impressions: 0,
        follower_growth: 0,
        date_range: dateRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      };

      return { success: true, data: overview };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getPostAnalytics(): Promise<{ success: boolean; data?: PostAnalytics[]; error?: string }> {
    try {
      // Mock post analytics - would get from platform APIs
      const analytics: PostAnalytics[] = [];
      return { success: true, data: analytics };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =============================================================================
  // AI GENERATION METHODS
  // =============================================================================

  async generateCaption(request: AIGenerationRequest): Promise<{ success: boolean; data?: AIGenerationResponse; error?: string }> {
    return await geminiAIService.generateCaption(request);
  }

  async generateHashtags(request: AIGenerationRequest): Promise<{ success: boolean; data?: AIGenerationResponse; error?: string }> {
    return await geminiAIService.generateHashtags(request);
  }

  async optimizeContent(request: AIGenerationRequest): Promise<{ success: boolean; data?: AIGenerationResponse; error?: string }> {
    return await geminiAIService.optimizeContent(request);
  }

  async generateContentIdea(request: AIGenerationRequest): Promise<{ success: boolean; data?: AIGenerationResponse; error?: string }> {
    return await geminiAIService.generateContentIdea(request);
  }

  async enhanceImage(imageFile: File): Promise<{ success: boolean; enhanced_url?: string; error?: string }> {
    return await geminiAIService.enhanceImage(imageFile);
  }

  // =============================================================================
  // COMPLIANCE METHODS
  // =============================================================================

  async checkCompliance(checkData: ComplianceCheck): Promise<{ success: boolean; data?: ComplianceResult; error?: string }> {
    return await geminiAIService.checkCompliance(checkData);
  }

  // =============================================================================
  // GOOGLE PHOTOS METHODS
  // =============================================================================

  async connectGooglePhotos(): Promise<{ success: boolean; error?: string }> {
    return await googleServicesAPI.connectGooglePhotos();
  }

  async getGooglePhotosStatus(): Promise<{ success: boolean; data?: GooglePhotosAuth; error?: string }> {
    return await googleServicesAPI.getGooglePhotosStatus();
  }

  async listGooglePhotosAlbums(): Promise<{ success: boolean; data?: GooglePhotosAlbum[]; error?: string }> {
    return await googleServicesAPI.listGooglePhotosAlbums();
  }

  async getAlbumMedia(albumId: string, pageToken?: string): Promise<{ success: boolean; data?: { items: GooglePhotosMediaItem[]; nextPageToken?: string }; error?: string }> {
    return await googleServicesAPI.getAlbumMedia(albumId, pageToken);
  }

  async importFromGooglePhotos(albumId: string, mediaIds: string[]): Promise<{ success: boolean; imported_count?: number; error?: string }> {
    return await googleServicesAPI.importFromGooglePhotos(albumId, mediaIds);
  }

  async searchGooglePhotos(query: string): Promise<{ success: boolean; data?: GooglePhotosMediaItem[]; error?: string }> {
    return await googleServicesAPI.searchGooglePhotos(query);
  }

  async syncGooglePhotos(): Promise<{ success: boolean; synced_count?: number; error?: string }> {
    return await googleServicesAPI.syncGooglePhotos();
  }

  // =============================================================================
  // MEDIA MANAGEMENT METHODS
  // =============================================================================

  async uploadMedia(file: File, tags: string[] = [], onProgress?: (progress: UploadProgress) => void): Promise<{ success: boolean; mediaItem?: MediaItem; error?: string }> {
    return await firebaseStorageService.uploadMedia(file, tags, onProgress);
  }

  async getMediaLibrary(): Promise<{ success: boolean; media?: MediaItem[]; error?: string }> {
    return await firebaseStorageService.getMediaLibrary();
  }

  async deleteMedia(mediaId: string): Promise<{ success: boolean; error?: string }> {
    return await firebaseStorageService.deleteMedia(mediaId);
  }

  async searchMedia(query: string): Promise<{ success: boolean; media?: MediaItem[]; error?: string }> {
    return await firebaseStorageService.searchMedia(query);
  }

  // =============================================================================
  // GALLERY METHODS
  // =============================================================================

  async getMediaGalleries(): Promise<{ success: boolean; galleries?: Gallery[]; error?: string }> {
    return await firebaseStorageService.getGalleries();
  }

  async createMediaGallery(name: string, caption?: string): Promise<{ success: boolean; gallery?: Gallery; error?: string }> {
    return await firebaseStorageService.createGallery(name, caption);
  }

  async addMediaToGallery(galleryId: string, mediaIds: string[]): Promise<{ success: boolean; error?: string }> {
    return await firebaseStorageService.addMediaToGallery(galleryId, mediaIds);
  }

  async removeMediaFromGallery(galleryId: string, mediaIds: string[]): Promise<{ success: boolean; error?: string }> {
    return await firebaseStorageService.removeMediaFromGallery(galleryId, mediaIds);
  }

  // =============================================================================
  // MARKETING TOOL METHODS
  // =============================================================================

  async getMarketingToolStats(): Promise<{ success: boolean; data?: MarketingToolStats; error?: string }> {
    try {
      const currentUser = await firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get media count
      const mediaResult = await firebaseStorageService.getMediaLibrary();
      const mediaCount = mediaResult.success ? (mediaResult.media?.length || 0) : 0;

      // Get scheduled posts count
      const schedulesResult = await socialPlatformsService.getSchedules();
      const scheduledCount = schedulesResult.success ? (schedulesResult.data?.length || 0) : 0;

      // Get platform connections count
      const platformsResult = await socialPlatformsService.getPlatforms();
      const connectedPlatforms = platformsResult.success ? 
        (platformsResult.data?.filter(p => p.connected).length || 0) : 0;

      const stats: MarketingToolStats = {
        totalPosts: 0, // Would calculate from post history
        scheduledPosts: scheduledCount,
        aiGenerated: 0, // Would track AI-generated content
        engagementRate: 0, // Would calculate from analytics
        socialAccounts: connectedPlatforms,
        mediaFiles: mediaCount,
        recentActivity: [], // Would get from activity log
        subscriptionTier: currentUser.subscription_tier,
        aiCreditsRemaining: currentUser.usage_limits.ai_credits,
        aiEditsRemaining: currentUser.usage_limits.ai_credits // Same as credits for now
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createMarketingPost(postData: CreatePostRequest): Promise<{ success: boolean; data?: CreatePostResponse; error?: string }> {
    try {
      // Convert to internal PostData format
      const internalPostData: PostData = {
        content: postData.content,
        media_ids: postData.mediaFiles,
        platforms: postData.platforms,
        hashtags: postData.hashtags,
        schedule_date: postData.scheduledFor
      };

      if (postData.scheduledFor) {
        // Schedule the post
        const scheduleResult = await this.createSchedule({
          content: postData.content,
          platforms: postData.platforms,
          schedule_date: postData.scheduledFor
        });

        if (scheduleResult.success && scheduleResult.scheduled_post) {
          return {
            success: true,
            data: {
              success: true,
              postId: scheduleResult.scheduled_post.id
            }
          };
        } else {
          return { success: false, error: scheduleResult.error };
        }
      } else {
        // Publish immediately
        const publishResult = await this.publishPost(internalPostData);
        if (publishResult.success) {
          return {
            success: true,
            data: {
              success: true,
              postId: `post_${Date.now()}`
            }
          };
        } else {
          return { success: false, error: publishResult.error };
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =============================================================================
  // SUBSCRIPTION METHODS (Mock implementation)
  // =============================================================================

  async getSubscriptionStatus(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const user = await firebaseAuthService.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      return {
        success: true,
        data: {
          subscription_tier: user.subscription_tier,
          subscription_status: user.subscription_status,
          subscription_expires: user.subscription_expires,
          stripe_customer_id: user.stripe_customer_id
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async syncSubscriptionStatus(): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would sync with Stripe
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =============================================================================
  // LEGACY COMPATIBILITY METHODS
  // =============================================================================

  async refreshToken(refreshToken: string): Promise<{ success: boolean; error?: string }> {
    // Firebase handles token refresh automatically
    return { success: true };
  }

  async upgradeToLifetimePro(userId: string): Promise<{ success: boolean; error?: string }> {
    return await this.applyPromoCode('TESTER_CROW_2024_LIFETIME_$7d91f3a8');
  }

  async upgradeToCreator(userId: string): Promise<{ success: boolean; error?: string }> {
    const user = await firebaseAuthService.getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    return await firebaseAuthService.updateProfile({
      ...user,
      subscription_tier: 'creator'
    });
  }
}

// Export singleton instance
export const unifiedAPI = new UnifiedAPIService();

// Export for compatibility with existing code
export const apiService = unifiedAPI;
export const CrowsEyeAPI = UnifiedAPIService;

// Re-export types for compatibility
export type {
  User,
  AuthResponse,
  RegisterData,
  LoginCredentials,
  MediaItem,
  Gallery,
  PlatformConnection,
  PostData,
  ScheduledPost,
  AIGenerationRequest,
  AIGenerationResponse,
  ComplianceCheck,
  ComplianceResult,
  GooglePhotosAuth,
  GooglePhotosAlbum,
  GooglePhotosMediaItem,
  AnalyticsOverview,
  PostAnalytics,
  MarketingToolStats,
  RecentActivity,
  CreatePostRequest,
  CreatePostResponse,
  APIResponse
}; 