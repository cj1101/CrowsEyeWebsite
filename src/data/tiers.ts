export const BYOK_DISCOUNT = 0.30;  // 30%

export interface Tier {
  id: string;
  name: string;
  monthly: number;
  monthlyByok?: number;
  description: string;
  socialSets: number | string;
  seats: number | string;
  aiCredits: number | string;
  aiEdits: number | string;
  videoSuite: 'none' | 'basic' | 'full';
  storageGB: number | string;
  contextFiles: number | string;
  analytics: 'basic' | 'advanced' | 'custom';
  support: 'community' | 'email' | 'priority' | 'dedicated';
}

const baseTiers = [
  {
    id: 'spark',
    name: 'Spark',
    monthly: 0,
    description: 'Students & hobbyists',
    socialSets: 1,
    seats: 1,
    aiCredits: 50,
    aiEdits: 5,
    videoSuite: 'none' as const,
    storageGB: 1,
    contextFiles: 1,
    analytics: 'basic' as const,
    support: 'community' as const
  },
  {
    id: 'creator',
    name: 'Creator',
    monthly: 19,
    description: 'Solo-preneurs & freelancers',
    socialSets: 3,
    seats: 1,
    aiCredits: 300,
    aiEdits: 30,
    videoSuite: 'basic' as const,
    storageGB: 10,
    contextFiles: 3,
    analytics: 'basic' as const,
    support: 'email' as const
  },
  {
    id: 'growth',
    name: 'Growth',
    monthly: 49,
    description: 'Side-hustles & small teams',
    socialSets: 6,
    seats: 3,
    aiCredits: 600,
    aiEdits: 60,
    videoSuite: 'basic' as const,
    storageGB: 50,
    contextFiles: 5,
    analytics: 'advanced' as const,
    support: 'priority' as const
  },
  {
    id: 'pro',
    name: 'Pro Agency',
    monthly: 89,
    description: 'Agencies & SMB marketing teams',
    socialSets: 15,
    seats: 10,
    aiCredits: 1000,
    aiEdits: 120,
    videoSuite: 'full' as const,
    storageGB: 200,
    contextFiles: 10,
    analytics: 'advanced' as const,
    support: 'priority' as const
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: 0,          // shown as "Custom"
    description: 'Large orgs & custom needs',
    socialSets: 'unlimited' as const,
    seats: 'unlimited' as const,
    aiCredits: 'custom' as const,
    aiEdits: 'custom' as const,
    videoSuite: 'full' as const,
    storageGB: 'custom' as const,
    contextFiles: 'custom' as const,
    analytics: 'custom' as const,
    support: 'dedicated' as const
  }
];

export const TIERS: Tier[] = baseTiers.map(t => ({
  ...t,
  monthlyByok: t.monthly ? +(t.monthly * (1 - BYOK_DISCOUNT)).toFixed(0) : undefined
})); 