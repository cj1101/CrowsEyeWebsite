import { TIERS } from '@/data/tiers';

// Extract quota constants from tiers
export const QUOTA_LIMITS = {
  spark: {
    socialSets: 1,
    aiCredits: 50,
    aiEdits: 5,
    storageGB: 1,
    contextFiles: 1
  },
  creator: {
    socialSets: 3,
    aiCredits: 300,
    aiEdits: 30,
    storageGB: 10,
    contextFiles: 3
  },
  growth: {
    socialSets: 6,
    aiCredits: 600,
    aiEdits: 60,
    storageGB: 50,
    contextFiles: 5
  },
  pro: {
    socialSets: 15,
    aiCredits: 1000,
    aiEdits: 120,
    storageGB: 200,
    contextFiles: 10
  },
  enterprise: {
    socialSets: Infinity,
    aiCredits: Infinity,
    aiEdits: Infinity,
    storageGB: Infinity,
    contextFiles: Infinity
  }
} as const;

export function getQuotaForTier(tierId: string) {
  return QUOTA_LIMITS[tierId as keyof typeof QUOTA_LIMITS] || QUOTA_LIMITS.spark;
}

export function getTierById(tierId: string) {
  return TIERS.find(tier => tier.id === tierId) || TIERS[0];
} 