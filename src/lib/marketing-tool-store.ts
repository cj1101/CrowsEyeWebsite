import { Post, UserSettings, AnalyticsData } from '@/types/marketing-tool';
import { generateId } from './marketing-tool-utils';

// Client-side storage keys
const STORAGE_KEYS = {
  POSTS: 'marketing-tool-posts',
  SETTINGS: 'marketing-tool-settings',
  ANALYTICS: 'marketing-tool-analytics'
};

// In-memory storage for the session
let sessionPosts: Post[] = [];
let sessionSettings: UserSettings | null = null;

// Local storage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Posts management
export const postsStore = {
  // Get all posts
  getPosts(): Post[] {
    if (sessionPosts.length === 0) {
      sessionPosts = getFromStorage(STORAGE_KEYS.POSTS, []);
    }
    return sessionPosts;
  },

  // Add a new post
  addPost(post: Omit<Post, 'id' | 'createdAt'>): Post {
    const newPost: Post = {
      ...post,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    
    sessionPosts = [...this.getPosts(), newPost];
    saveToStorage(STORAGE_KEYS.POSTS, sessionPosts);
    return newPost;
  },

  // Update a post
  updatePost(id: string, updates: Partial<Post>): Post | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    const updatedPost = { ...posts[index], ...updates };
    sessionPosts = [...posts.slice(0, index), updatedPost, ...posts.slice(index + 1)];
    saveToStorage(STORAGE_KEYS.POSTS, sessionPosts);
    return updatedPost;
  },

  // Delete a post
  deletePost(id: string): boolean {
    const posts = this.getPosts();
    const filteredPosts = posts.filter(p => p.id !== id);
    
    if (filteredPosts.length === posts.length) return false;
    
    sessionPosts = filteredPosts;
    saveToStorage(STORAGE_KEYS.POSTS, sessionPosts);
    return true;
  },

  // Get posts by status
  getPostsByStatus(status: Post['status']): Post[] {
    return this.getPosts().filter(p => p.status === status);
  }
};

// Settings management
export const settingsStore = {
  // Get user settings
  getSettings(): UserSettings {
    if (!sessionSettings) {
      sessionSettings = getFromStorage(STORAGE_KEYS.SETTINGS, {
        userId: 'demo-user',
        apiKeys: {},
        preferences: {
          defaultPlatform: 'instagram',
          defaultTone: 'professional'
        }
      });
    }
    return sessionSettings;
  },

  // Update settings
  updateSettings(updates: Partial<UserSettings>): UserSettings {
    const currentSettings = this.getSettings();
    sessionSettings = { ...currentSettings, ...updates };
    saveToStorage(STORAGE_KEYS.SETTINGS, sessionSettings);
    return sessionSettings;
  },

  // Update API keys
  updateApiKeys(apiKeys: Partial<UserSettings['apiKeys']>): UserSettings {
    const currentSettings = this.getSettings();
    sessionSettings = {
      ...currentSettings,
      apiKeys: { ...currentSettings.apiKeys, ...apiKeys }
    };
    saveToStorage(STORAGE_KEYS.SETTINGS, sessionSettings);
    return sessionSettings;
  }
};

// Analytics data generation
export const analyticsStore = {
  // Generate analytics data based on posts
  getAnalytics(): AnalyticsData {
    const posts = postsStore.getPosts();
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate platform breakdown
    const platformBreakdown: Record<string, number> = {};
    posts.forEach(post => {
      platformBreakdown[post.platform] = (platformBreakdown[post.platform] || 0) + 1;
    });

    // Posts this month
    const thisMonthPosts = posts.filter(post => 
      new Date(post.createdAt) >= thisMonth
    ).length;

    // Generate recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayPosts = posts.filter(post => 
        post.createdAt.startsWith(dateStr)
      ).length;
      
      recentActivity.push({
        date: dateStr,
        posts: dayPosts,
        engagement: Math.floor(Math.random() * 100) + dayPosts * 10 // Mock engagement
      });
    }

    // Find top performing platform
    const topPlatform = Object.entries(platformBreakdown)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'instagram';

    return {
      totalPosts: posts.length,
      thisMonth: thisMonthPosts,
      platformBreakdown,
      engagementMetrics: {
        averageImpressions: Math.floor(Math.random() * 1000) + 500,
        averageEngagementRate: Math.floor(Math.random() * 10) + 5,
        topPerformingPlatform: topPlatform
      },
      recentActivity
    };
  }
};

// AI Content Generation (client-side fallback)
export const aiStore = {
  // Generate content using templates when API keys are not available
  generateContent(prompt: string, platform: string, tone: string): string {
    const templates = {
      instagram: [
        `✨ ${prompt} ✨\n\nThis is exactly what we needed to share with our amazing community! 💫\n\n#inspiration #community #${platform}`,
        `🌟 Exciting update about ${prompt}! 🌟\n\nWe're thrilled to share this with you. What do you think? Let us know in the comments! 👇\n\n#exciting #update #community`,
        `💡 Here's something interesting about ${prompt}...\n\nIt's amazing how much we can learn when we stay curious! 🤔✨\n\n#learning #curiosity #growth`
      ],
      facebook: [
        `We're excited to share some thoughts about ${prompt}!\n\nThis topic has been on our minds lately, and we'd love to hear your perspective. What are your thoughts?\n\n#discussion #community #${platform}`,
        `Today we want to talk about ${prompt}.\n\nIt's incredible how this connects to so many aspects of our daily lives. Have you experienced something similar?\n\n#connection #life #sharing`
      ],
      twitter: [
        `Quick thought on ${prompt}: It's fascinating how this impacts our daily lives! 🤔 #${platform} #thoughts`,
        `${prompt} - anyone else thinking about this today? 💭 #discussion #community`,
        `Just realized something about ${prompt}... 🧠✨ #insight #${platform}`
      ],
      linkedin: [
        `Professional insight on ${prompt}:\n\nIn today's rapidly evolving landscape, understanding this concept is crucial for success. Here are my key takeaways:\n\n• Key point 1\n• Key point 2\n• Key point 3\n\nWhat's your experience with this? #professional #insight #${platform}`,
        `Reflecting on ${prompt} and its impact on our industry.\n\nThis topic deserves more attention in professional circles. The implications for future growth are significant.\n\n#industry #growth #professional`
      ]
    };

    const platformTemplates = templates[platform as keyof typeof templates] || templates.instagram;
    const randomTemplate = platformTemplates[Math.floor(Math.random() * platformTemplates.length)];
    
    return randomTemplate;
  }
}; 