// Marketing Tool Types
export interface Post {
  id: string;
  userId: string;
  content: string;
  platform: string;
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdAt: string;
}

export interface Platform {
  id: string;
  name: string;
  enabled: boolean;
  maxLength: number;
}

export interface UserSettings {
  userId: string;
  apiKeys: {
    openai?: string;
    gemini?: string;
  };
  preferences: {
    defaultPlatform?: string;
    defaultTone?: string;
  };
}

export interface AnalyticsData {
  totalPosts: number;
  thisMonth: number;
  platformBreakdown: Record<string, number>;
  engagementMetrics: {
    averageImpressions: number;
    averageEngagementRate: number;
    topPerformingPlatform: string;
  };
  recentActivity: Array<{
    date: string;
    posts: number;
    engagement: number;
  }>;
}

export interface ContentTemplate {
  name: string;
  template: string;
  category?: string;
}

export interface AIGenerationRequest {
  prompt: string;
  platform: string;
  tone: string;
  apiKeys?: {
    openai?: string;
    gemini?: string;
  };
}

export interface AIGenerationResponse {
  content: string;
  error?: string;
}

export type ToneType = 'professional' | 'casual' | 'friendly' | 'formal' | 'humorous' | 'inspiring';
export type PlatformType = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube';
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';
export type TabType = 'dashboard' | 'library' | 'create' | 'schedule' | 'analytics' | 'ai-tools' | 'desktop' | 'settings'; 