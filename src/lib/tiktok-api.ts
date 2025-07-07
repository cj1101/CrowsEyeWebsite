import axios from 'axios';

/**
 * Tiny wrapper around TikTok Open API v2 for the handful of endpoints Crow's Eye needs.
 * Documentation: https://developers.tiktok.com/doc/login-kit-manage-user-tokens/
 */
export interface TikTokConfig {
  clientKey: string;
  clientSecret: string;
}

export interface TikTokTokens {
  accessToken: string;
  refreshToken: string;
  /** seconds */
  expiresIn: number;
  /** UNIX timestamp */
  obtainedAt: number;
}

export class TikTokAPI {
  private config: TikTokConfig;
  private tokens: TikTokTokens;

  constructor(config: TikTokConfig, tokens: TikTokTokens) {
    this.config = config;
    this.tokens = tokens;
  }

  /* ==================== STATIC HELPERS ==================== */

  /**
   * Exchange OAuth `code` for access & refresh tokens.
   */
  static async exchangeCode(
    config: TikTokConfig,
    code: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<TikTokTokens> {
    const params = new URLSearchParams({
      client_key: config.clientKey,
      client_secret: config.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
    });

    const res = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const data = res.data;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      obtainedAt: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Refresh an expired access token using the refresh-token.
   */
  static async refreshToken(
    config: TikTokConfig,
    refreshToken: string
  ): Promise<TikTokTokens> {
    const params = new URLSearchParams({
      client_key: config.clientKey,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const res = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const data = res.data;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      obtainedAt: Math.floor(Date.now() / 1000),
    };
  }

  /* ==================== INSTANCE METHODS ==================== */

  private async fetch<T>(url: string, params: Record<string, any> = {}): Promise<T> {
    const res = await axios.get(url, {
      params,
      headers: {
        Authorization: `Bearer ${this.tokens.accessToken}`,
      },
    });
    return res.data as T;
  }

  /**
   * Get the user's own videos (required to map comments → video).
   */
  async getUserVideos(): Promise<any[]> {
    const data = await this.fetch<{ data: any[] }>('https://open.tiktokapis.com/v2/video/list');
    return data.data;
  }

  /**
   * Get the comment list for a specific video ID.
   */
  async getComments(videoId: string): Promise<any[]> {
    const data = await this.fetch<{ data: any[] }>('https://open.tiktokapis.com/v2/comment/list', {
      video_id: videoId,
    });
    return data.data;
  }

  /**
   * Reply to a comment.
   */
  async replyToComment(commentId: string, text: string): Promise<void> {
    await axios.post(
      'https://open.tiktokapis.com/v2/comment/reply',
      {
        comment_id: commentId,
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${this.tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 