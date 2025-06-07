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
let isInitialized = false;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Local storage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Initialize data only on client side
function initializeIfNeeded() {
  if (!isBrowser || isInitialized) return;
  
  try {
    // Load posts from localStorage
    sessionPosts = getFromStorage(STORAGE_KEYS.POSTS, []);
    
    // Load settings from localStorage
    sessionSettings = getFromStorage(STORAGE_KEYS.SETTINGS, {
      userId: 'anonymous',
      apiKeys: {},
      preferences: {
        defaultPlatform: 'instagram',
        defaultTone: 'professional'
      }
    });
    
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize marketing tool store:', error);
    // Use safe defaults
    sessionPosts = [];
    sessionSettings = {
      userId: 'anonymous',
      apiKeys: {},
      preferences: {
        defaultPlatform: 'instagram',
        defaultTone: 'professional'
      }
    };
    isInitialized = true;
  }
}

// Posts management
export const postsStore = {
  // Get all posts
  getPosts(): Post[] {
    initializeIfNeeded();
    return sessionPosts;
  },

  // Add a new post
  addPost(post: Omit<Post, 'id' | 'createdAt'>): Post {
    initializeIfNeeded();
    const newPost: Post = {
      ...post,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    
    sessionPosts = [newPost, ...sessionPosts];
    saveToStorage(STORAGE_KEYS.POSTS, sessionPosts);
    return newPost;
  },

  // Update a post
  updatePost(id: string, updates: Partial<Post>): Post | null {
    initializeIfNeeded();
    const index = sessionPosts.findIndex(post => post.id === id);
    if (index === -1) return null;

    sessionPosts[index] = {
      ...sessionPosts[index],
      ...updates
    };
    
    saveToStorage(STORAGE_KEYS.POSTS, sessionPosts);
    return sessionPosts[index];
  },

  // Delete a post
  deletePost(id: string): boolean {
    initializeIfNeeded();
    const initialLength = sessionPosts.length;
    sessionPosts = sessionPosts.filter(post => post.id !== id);
    
    if (sessionPosts.length < initialLength) {
      saveToStorage(STORAGE_KEYS.POSTS, sessionPosts);
      return true;
    }
    return false;
  },

  // Get post by ID
  getPost(id: string): Post | null {
    initializeIfNeeded();
    return sessionPosts.find(post => post.id === id) || null;
  },

  // Get posts by status
  getPostsByStatus(status: Post['status']): Post[] {
    initializeIfNeeded();
    return sessionPosts.filter(post => post.status === status);
  }
};

// Settings management
export const settingsStore = {
  // Get user settings
  getSettings(): UserSettings {
    initializeIfNeeded();
    if (!sessionSettings) {
      sessionSettings = {
        userId: 'anonymous',
        apiKeys: {},
        preferences: {
          defaultPlatform: 'instagram',
          defaultTone: 'professional'
        }
      };
    }
    return sessionSettings;
  },

  // Update settings
  updateSettings(updates: Partial<UserSettings>): UserSettings {
    initializeIfNeeded();
    const currentSettings = this.getSettings();
    sessionSettings = { ...currentSettings, ...updates };
    saveToStorage(STORAGE_KEYS.SETTINGS, sessionSettings);
    return sessionSettings;
  },

  // Update API keys
  updateApiKeys(apiKeys: Partial<UserSettings['apiKeys']>): UserSettings {
    initializeIfNeeded();
    const currentSettings = this.getSettings();
    sessionSettings = {
      ...currentSettings,
      apiKeys: { ...currentSettings.apiKeys, ...apiKeys }
    };
    saveToStorage(STORAGE_KEYS.SETTINGS, sessionSettings);
    return sessionSettings;
  }
};

// Analytics management
export const analyticsStore = {
  // Get analytics data
  getAnalytics(): AnalyticsData {
    initializeIfNeeded();
    return getFromStorage(STORAGE_KEYS.ANALYTICS, {
      totalPosts: 0,
      thisMonth: 0,
      platformBreakdown: {},
      engagementMetrics: {
        averageImpressions: 0,
        averageEngagementRate: 0,
        topPerformingPlatform: 'instagram'
      },
      recentActivity: []
    });
  },

  // Update analytics
  updateAnalytics(data: AnalyticsData): void {
    initializeIfNeeded();
    saveToStorage(STORAGE_KEYS.ANALYTICS, data);
  },

  // Calculate analytics from posts
  calculateAnalytics(): AnalyticsData {
    initializeIfNeeded();
    const posts = postsStore.getPosts();
    const publishedPosts = posts.filter(post => post.status === 'published');
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalPosts = posts.length;
    const thisMonthPosts = posts.filter(post => 
      new Date(post.createdAt) >= thisMonth
    ).length;
    
    // Platform breakdown
    const platformBreakdown: Record<string, number> = {};
    posts.forEach(post => {
      platformBreakdown[post.platform] = (platformBreakdown[post.platform] || 0) + 1;
    });
    
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
    
    const analyticsData: AnalyticsData = {
      totalPosts,
      thisMonth: thisMonthPosts,
      platformBreakdown,
      engagementMetrics: {
        averageImpressions: Math.floor(Math.random() * 1000) + 500,
        averageEngagementRate: Math.floor(Math.random() * 10) + 5,
        topPerformingPlatform: topPlatform
      },
      recentActivity
    };
    
    this.updateAnalytics(analyticsData);
    return analyticsData;
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