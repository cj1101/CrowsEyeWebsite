export interface User {
  id: string;
  email: string;
  name?: string;
  tier: 'spark' | 'creator' | 'growth' | 'pro' | 'enterprise';
  hasCustomApiKey: boolean;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  customApiKey?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
} 