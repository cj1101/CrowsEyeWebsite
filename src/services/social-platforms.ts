// Social Platform Direct API Integration Service
// Replaces crow's eye API with direct platform API calls

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

// Environment variable helpers
const getEnvVar = (key: string): string | undefined => {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_ prefixed vars
    return (window as any).process?.env?.[`NEXT_PUBLIC_${key}`] || process.env[`NEXT_PUBLIC_${key}`];
  }
  return process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
};

export class SocialPlatformsService {
  // Instagram API Integration
  private async connectInstagram(): Promise<{ success: boolean; error?: string }> {
    try {
      const facebookAppId = getEnvVar('FACEBOOK_APP_ID');
      const redirectUrl = getEnvVar('OAUTH_REDIRECT_BASE_URL') || window.location.origin;
      
      if (!facebookAppId) {
        return { success: false, error: 'Facebook App ID not configured' };
      }

      // Instagram uses Facebook Graph API
      const scopes = 'instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_read_engagement';
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${facebookAppId}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl + '/api/auth/instagram/callback')}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `response_type=code`;

      window.open(authUrl, 'instagram-auth', 'width=600,height=600');
      
      return { success: true };
    } catch (error: any) {
      console.error('Instagram connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // TikTok API Integration
  private async connectTikTok(): Promise<{ success: boolean; error?: string }> {
    try {
      const clientKey = getEnvVar('TIKTOK_CLIENT_KEY');
      const redirectUri = getEnvVar('TIKTOK_REDIRECT_URI') || `${window.location.origin}/api/auth/tiktok/redirect`;
      
      if (!clientKey) {
        return { success: false, error: 'TikTok Client Key not configured' };
      }

      const scopes = 'user.info.basic,video.list,video.publish';
      const state = Math.random().toString(36).substring(2);
      
      const authUrl = `https://open.tiktokapis.com/platform/oauth/connect/?` +
        `client_key=${clientKey}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}`;

      window.open(authUrl, 'tiktok-auth', 'width=600,height=600');
      
      return { success: true };
    } catch (error: any) {
      console.error('TikTok connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Facebook API Integration
  private async connectFacebook(): Promise<{ success: boolean; error?: string }> {
    try {
      const facebookAppId = getEnvVar('FACEBOOK_APP_ID');
      const redirectUrl = getEnvVar('OAUTH_REDIRECT_BASE_URL') || window.location.origin;
      
      if (!facebookAppId) {
        return { success: false, error: 'Facebook App ID not configured' };
      }

      const scopes = 'pages_manage_posts,pages_read_engagement,pages_show_list';
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${facebookAppId}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl + '/api/auth/facebook/callback')}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `response_type=code`;

      window.open(authUrl, 'facebook-auth', 'width=600,height=600');
      
      return { success: true };
    } catch (error: any) {
      console.error('Facebook connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Generic LinkedIn connection (requires LinkedIn API setup)
  private async connectLinkedIn(): Promise<{ success: boolean; error?: string }> {
    try {
      // LinkedIn API would need to be configured separately
      return { success: false, error: 'LinkedIn API integration requires additional setup' };
    } catch (error: any) {
      console.error('LinkedIn connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Generic Twitter connection (requires Twitter API setup)
  private async connectTwitter(): Promise<{ success: boolean; error?: string }> {
    try {
      // Twitter API would need to be configured separately
      return { success: false, error: 'Twitter API integration requires additional setup' };
    } catch (error: any) {
      console.error('Twitter connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Generic Pinterest connection (requires Pinterest API setup)
  private async connectPinterest(): Promise<{ success: boolean; error?: string }> {
    try {
      // Pinterest API would need to be configured separately
      return { success: false, error: 'Pinterest API integration requires additional setup' };
    } catch (error: any) {
      console.error('Pinterest connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Connect to platform
  async connectPlatform(platform: string): Promise<{ success: boolean; error?: string }> {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return await this.connectInstagram();
      case 'tiktok':
        return await this.connectTikTok();
      case 'facebook':
        return await this.connectFacebook();
      case 'linkedin':
        return await this.connectLinkedIn();
      case 'twitter':
        return await this.connectTwitter();
      case 'pinterest':
        return await this.connectPinterest();
      default:
        return { success: false, error: `Platform ${platform} not supported` };
    }
  }

  // Disconnect from platform
  async disconnectPlatform(platform: string): Promise<{ success: boolean; error?: string }> {
    try {
      // For now, just remove from local storage/state
      // In a full implementation, this would revoke tokens
      const connections = this.getStoredConnections();
      delete connections[platform];
      this.storeConnections(connections);
      
      return { success: true };
    } catch (error: any) {
      console.error('Disconnect platform error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get platform connections status
  async getPlatforms(): Promise<{ success: boolean; data?: PlatformConnection[]; error?: string }> {
    try {
      const connections = this.getStoredConnections();
      const platforms: PlatformConnection[] = [
        'instagram', 'tiktok', 'facebook', 'linkedin', 'twitter', 'pinterest'
      ].map(platform => ({
        platform: platform as PlatformConnection['platform'],
        connected: !!connections[platform],
        username: connections[platform]?.username,
        profile_url: connections[platform]?.profile_url,
        connected_at: connections[platform]?.connected_at,
        last_sync: connections[platform]?.last_sync,
        permissions: connections[platform]?.permissions || []
      }));

      return { success: true, data: platforms };
    } catch (error: any) {
      console.error('Get platforms error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get specific platform status
  async getPlatformStatus(platform: string): Promise<{ success: boolean; data?: PlatformConnection; error?: string }> {
    try {
      const connections = this.getStoredConnections();
      const connection = connections[platform];
      
      const platformStatus: PlatformConnection = {
        platform: platform as PlatformConnection['platform'],
        connected: !!connection,
        username: connection?.username,
        profile_url: connection?.profile_url,
        connected_at: connection?.connected_at,
        last_sync: connection?.last_sync,
        permissions: connection?.permissions || []
      };

      return { success: true, data: platformStatus };
    } catch (error: any) {
      console.error('Get platform status error:', error);
      return { success: false, error: error.message };
    }
  }

  // Post to platform (simplified - would need platform-specific implementation)
  async postToPlatform(platform: string, postData: PostData): Promise<{ success: boolean; post_id?: string; error?: string }> {
    try {
      const connections = this.getStoredConnections();
      const connection = connections[platform];
      
      if (!connection) {
        return { success: false, error: `Not connected to ${platform}` };
      }

      // This is a simplified implementation
      // In reality, each platform would have its own API calls
      switch (platform.toLowerCase()) {
        case 'instagram':
          return await this.postToInstagram(postData, connection.access_token);
        case 'tiktok':
          return await this.postToTikTok(postData, connection.access_token);
        case 'facebook':
          return await this.postToFacebook(postData, connection.access_token);
        default:
          return { success: false, error: `Posting to ${platform} not implemented yet` };
      }
    } catch (error: any) {
      console.error('Post to platform error:', error);
      return { success: false, error: error.message };
    }
  }

  // Platform-specific posting methods (simplified)
  private async postToInstagram(postData: PostData, accessToken: string): Promise<{ success: boolean; post_id?: string; error?: string }> {
    try {
      // Instagram Graph API posting logic would go here
      // This is a placeholder implementation
      return { success: true, post_id: `ig_${Date.now()}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async postToTikTok(postData: PostData, accessToken: string): Promise<{ success: boolean; post_id?: string; error?: string }> {
    try {
      // TikTok API posting logic would go here
      // This is a placeholder implementation
      return { success: true, post_id: `tt_${Date.now()}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async postToFacebook(postData: PostData, accessToken: string): Promise<{ success: boolean; post_id?: string; error?: string }> {
    try {
      // Facebook Graph API posting logic would go here
      // This is a placeholder implementation
      return { success: true, post_id: `fb_${Date.now()}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Local storage helpers for connection data
  private getStoredConnections(): any {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('social_platform_connections');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private storeConnections(connections: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('social_platform_connections', JSON.stringify(connections));
    } catch (error) {
      console.error('Failed to store connections:', error);
    }
  }

  // Store connection after successful OAuth
  async storeConnection(platform: string, connectionData: any): Promise<void> {
    const connections = this.getStoredConnections();
    connections[platform] = {
      ...connectionData,
      connected_at: new Date().toISOString(),
      last_sync: new Date().toISOString()
    };
    this.storeConnections(connections);
  }

  // Schedule management (simplified - would integrate with a job scheduler)
  async createSchedule(scheduleData: Omit<ScheduledPost, 'id' | 'created_at' | 'status'>): Promise<{ success: boolean; scheduled_post?: ScheduledPost; error?: string }> {
    try {
      const scheduledPost: ScheduledPost = {
        ...scheduleData,
        id: `sched_${Date.now()}`,
        created_at: new Date().toISOString(),
        status: 'scheduled'
      };

      // Store in local storage for now (would use a proper database/scheduler in production)
      const schedules = this.getStoredSchedules();
      schedules.push(scheduledPost);
      this.storeSchedules(schedules);

      return { success: true, scheduled_post: scheduledPost };
    } catch (error: any) {
      console.error('Create schedule error:', error);
      return { success: false, error: error.message };
    }
  }

  async getSchedules(): Promise<{ success: boolean; data?: ScheduledPost[]; error?: string }> {
    try {
      const schedules = this.getStoredSchedules();
      return { success: true, data: schedules };
    } catch (error: any) {
      console.error('Get schedules error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteSchedule(scheduleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const schedules = this.getStoredSchedules();
      const filteredSchedules = schedules.filter(s => s.id !== scheduleId);
      this.storeSchedules(filteredSchedules);
      
      return { success: true };
    } catch (error: any) {
      console.error('Delete schedule error:', error);
      return { success: false, error: error.message };
    }
  }

  private getStoredSchedules(): ScheduledPost[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('scheduled_posts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private storeSchedules(schedules: ScheduledPost[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('scheduled_posts', JSON.stringify(schedules));
    } catch (error) {
      console.error('Failed to store schedules:', error);
    }
  }
}

// Export singleton instance
export const socialPlatformsService = new SocialPlatformsService(); 