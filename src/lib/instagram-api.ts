import axios from 'axios';
import crypto from 'crypto';

// Instagram API configuration
const INSTAGRAM_API_BASE_URL = 'https://graph.instagram.com';
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v18.0';

export interface InstagramConfig {
  clientId: string;
  clientSecret: string;
}

export interface InstagramTokens {
  access_token: string;
  user_id: number;
  expires_in?: number;
  refresh_token?: string;
}

// Types for Instagram API
export interface InstagramUser {
  id: string;
  username: string;
  account_type?: string;
  media_count?: number;
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  username?: string;
  comments_count?: number;
  like_count?: number;
}

export interface InstagramComment {
  id: string;
  text: string;
  timestamp: string;
  username: string;
  hidden: boolean;
  replies?: {
    data: InstagramComment[];
  };
}

export interface InstagramApiConfig {
  accessToken: string;
  pageId?: string;
  instagramBusinessAccountId?: string;
}

export class InstagramAPI {
  private config: InstagramApiConfig;
  
  constructor(config: InstagramApiConfig) {
    this.config = config;
  }

  // === MESSAGING API ===

  /**
   * Send a direct message to a user
   */
  async sendDirectMessage(userId: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = `${FACEBOOK_GRAPH_API_BASE_URL}/${this.config.pageId}/messages`;
      
      const response = await axios.post(url, {
        recipient: { id: userId },
        message: { text: message },
        messaging_type: 'RESPONSE',
        access_token: this.config.accessToken
      });

      return {
        success: true,
        messageId: response.data.message_id
      };
    } catch (error: any) {
      console.error('Failed to send Instagram DM:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Reply to a comment
   */
  async replyToComment(commentId: string, message: string): Promise<{ success: boolean; replyId?: string; error?: string }> {
    try {
      const url = `${INSTAGRAM_API_BASE_URL}/${commentId}/replies`;
      
      const response = await axios.post(url, {
        message: message,
        access_token: this.config.accessToken
      });

      return {
        success: true,
        replyId: response.data.id
      };
    } catch (error: any) {
      console.error('Failed to reply to comment:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // === MEDIA API ===

  /**
   * Get user's media
   */
  async getUserMedia(userId?: string, limit: number = 25): Promise<{ success: boolean; media?: InstagramMedia[]; error?: string }> {
    try {
      const targetUserId = userId || this.config.instagramBusinessAccountId;
      if (!targetUserId) {
        throw new Error('No user ID provided and no Instagram Business Account ID configured');
      }

      const url = `${INSTAGRAM_API_BASE_URL}/${targetUserId}/media`;
      
      const response = await axios.get(url, {
        params: {
          fields: 'id,media_type,media_url,permalink,caption,timestamp,username,comments_count,like_count',
          limit: limit,
          access_token: this.config.accessToken
        }
      });

      return {
        success: true,
        media: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to get user media:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Get media details
   */
  async getMediaDetails(mediaId: string): Promise<{ success: boolean; media?: InstagramMedia; error?: string }> {
    try {
      const url = `${INSTAGRAM_API_BASE_URL}/${mediaId}`;
      
      const response = await axios.get(url, {
        params: {
          fields: 'id,media_type,media_url,permalink,caption,timestamp,username,comments_count,like_count',
          access_token: this.config.accessToken
        }
      });

      return {
        success: true,
        media: response.data
      };
    } catch (error: any) {
      console.error('Failed to get media details:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // === COMMENTS API ===

  /**
   * Get comments for a media post
   */
  async getMediaComments(mediaId: string): Promise<{ success: boolean; comments?: InstagramComment[]; error?: string }> {
    try {
      const url = `${INSTAGRAM_API_BASE_URL}/${mediaId}/comments`;
      
      const response = await axios.get(url, {
        params: {
          fields: 'id,text,timestamp,username,hidden,replies{id,text,timestamp,username}',
          access_token: this.config.accessToken
        }
      });

      return {
        success: true,
        comments: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to get media comments:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Hide/unhide a comment
   */
  async moderateComment(commentId: string, hide: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `${INSTAGRAM_API_BASE_URL}/${commentId}`;
      
      await axios.post(url, {
        hide: hide,
        access_token: this.config.accessToken
      });

      return { success: true };
    } catch (error: any) {
      console.error('Failed to moderate comment:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `${INSTAGRAM_API_BASE_URL}/${commentId}`;
      
      await axios.delete(url, {
        params: {
          access_token: this.config.accessToken
        }
      });

      return { success: true };
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // === USER API ===

  /**
   * Get user profile information
   */
  async getUserProfile(userId?: string): Promise<{ success: boolean; user?: InstagramUser; error?: string }> {
    try {
      const targetUserId = userId || this.config.instagramBusinessAccountId;
      if (!targetUserId) {
        throw new Error('No user ID provided and no Instagram Business Account ID configured');
      }

      const url = `${INSTAGRAM_API_BASE_URL}/${targetUserId}`;
      
      const response = await axios.get(url, {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: this.config.accessToken
        }
      });

      return {
        success: true,
        user: response.data
      };
    } catch (error: any) {
      console.error('Failed to get user profile:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // === INSIGHTS API ===

  /**
   * Get media insights (for business accounts)
   */
  async getMediaInsights(mediaId: string, metrics: string[] = ['impressions', 'reach', 'engagement']): Promise<{ success: boolean; insights?: any; error?: string }> {
    try {
      const url = `${INSTAGRAM_API_BASE_URL}/${mediaId}/insights`;
      
      const response = await axios.get(url, {
        params: {
          metric: metrics.join(','),
          access_token: this.config.accessToken
        }
      });

      return {
        success: true,
        insights: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to get media insights:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // === WEBHOOK UTILITIES ===

  /**
   * Subscribe to webhook events
   */
  async subscribeToWebhook(callbackUrl: string, verifyToken: string, fields: string[] = ['comments', 'mentions']): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `${FACEBOOK_GRAPH_API_BASE_URL}/${this.config.pageId}/subscribed_apps`;
      
      await axios.post(url, {
        subscribed_fields: fields.join(','),
        callback_url: callbackUrl,
        verify_token: verifyToken,
        access_token: this.config.accessToken
      });

      return { success: true };
    } catch (error: any) {
      console.error('Failed to subscribe to webhook:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Get webhook subscriptions
   */
  async getWebhookSubscriptions(): Promise<{ success: boolean; subscriptions?: any; error?: string }> {
    try {
      const url = `${FACEBOOK_GRAPH_API_BASE_URL}/${this.config.pageId}/subscribed_apps`;
      
      const response = await axios.get(url, {
        params: {
          access_token: this.config.accessToken
        }
      });

      return {
        success: true,
        subscriptions: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to get webhook subscriptions:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Exchange OAuth `code` for access token.
   */
  static async exchangeCode(
    config: InstagramConfig,
    code: string,
    redirectUri: string
  ): Promise<InstagramTokens> {
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    });

    // Use Facebook Graph OAuth token exchange endpoint (works for Instagram Graph API apps)
    const FB_OAUTH_VERSION = process.env.FB_OAUTH_VERSION || 'v18.0';

    const res = await axios.post(
      `https://graph.facebook.com/${FB_OAUTH_VERSION}/oauth/access_token`,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return res.data;
  }

  /**
   * Get basic user information using access token.
   */
  static async getUser(accessToken: string): Promise<InstagramUser> {
    const res = await axios.get(
      'https://graph.instagram.com/me',
      {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: accessToken,
        },
      }
    );

    return res.data;
  }

  /**
   * Get user's media using access token.
   */
  static async getUserMedia(accessToken: string, limit: number = 25): Promise<any> {
    const res = await axios.get(
      'https://graph.instagram.com/me/media',
      {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
          limit,
          access_token: accessToken,
        },
      }
    );

    return res.data;
  }

  /**
   * Refresh a long-lived access token (for Instagram Basic Display API).
   */
  static async refreshToken(accessToken: string): Promise<InstagramTokens> {
    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: accessToken,
    });

    const res = await axios.get(
      'https://graph.instagram.com/refresh_access_token',
      {
        params: Object.fromEntries(params),
      }
    );

    return res.data;
  }
}

// Helper function to create an Instagram API instance
export function createInstagramAPI(config: InstagramApiConfig): InstagramAPI {
  return new InstagramAPI(config);
}

// Helper function to validate webhook signature (for use in webhook handler)
export function validateInstagramWebhookSignature(body: string, signature: string, secret: string): boolean {
  
  if (!signature) {
    return false;
  }

  try {
    const cleanSignature = signature.replace('sha256=', '');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(cleanSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
} 