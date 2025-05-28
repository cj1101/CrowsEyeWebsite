import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { getUserSubscription } from './subscription';
import { QUOTA_LIMITS } from './quotas';

export interface UsageRecord {
  userId: string;
  feature: string;
  count: number;
  lastReset: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  updatedAt: Date;
}

export interface UsageStats {
  aiCredits: number;
  aiEdits: number;
  socialSets: number;
  storageUsedGB: number;
  contextFiles: number;
  apiCalls: number;
  lastUpdated: Date;
}

export interface FeatureUsage {
  feature: string;
  used: number;
  limit: number | 'unlimited';
  percentage: number;
  canUse: boolean;
  resetDate?: Date;
}

// Feature types that can be tracked
export type TrackableFeature = 
  | 'ai_credits' 
  | 'ai_edits' 
  | 'social_sets' 
  | 'storage_gb' 
  | 'context_files' 
  | 'api_calls'
  | 'post_creation'
  | 'media_upload'
  | 'analytics_view'
  | 'scheduling'
  | 'video_processing';

/**
 * Get current usage stats for a user
 */
export const getUserUsage = async (userId: string): Promise<UsageStats | null> => {
  if (!isFirebaseConfigured() || !db) {
    console.log('🎭 Demo mode: Returning mock usage stats');
    return {
      aiCredits: 25,
      aiEdits: 2,
      socialSets: 1,
      storageUsedGB: 0.5,
      contextFiles: 1,
      apiCalls: 150,
      lastUpdated: new Date(),
    };
  }

  try {
    const usageRef = doc(db, 'usage', userId);
    const usageDoc = await getDoc(usageRef);

    if (usageDoc.exists()) {
      const data = usageDoc.data();
      return {
        aiCredits: data.aiCredits || 0,
        aiEdits: data.aiEdits || 0,
        socialSets: data.socialSets || 0,
        storageUsedGB: data.storageUsedGB || 0,
        contextFiles: data.contextFiles || 0,
        apiCalls: data.apiCalls || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      };
    }

    // Initialize usage record if it doesn't exist
    const initialUsage: UsageStats = {
      aiCredits: 0,
      aiEdits: 0,
      socialSets: 0,
      storageUsedGB: 0,
      contextFiles: 0,
      apiCalls: 0,
      lastUpdated: new Date(),
    };

    await setDoc(usageRef, {
      ...initialUsage,
      lastUpdated: new Date(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: getNextBillingDate(),
    });

    return initialUsage;
  } catch (error) {
    console.error('❌ Error fetching user usage:', error);
    return null;
  }
};

/**
 * Track feature usage and enforce limits
 */
export const trackFeatureUsage = async (
  userId: string, 
  feature: TrackableFeature, 
  amount: number = 1
): Promise<{ success: boolean; message?: string; usage?: FeatureUsage }> => {
  if (!isFirebaseConfigured() || !db) {
    console.log('🎭 Demo mode: Allowing feature usage');
    return { success: true, message: 'Demo mode - usage tracking disabled' };
  }

  try {
    // Get user subscription to determine limits
    const subscription = await getUserSubscription(userId);
    const tier = subscription?.tier || 'spark';
    const limits = QUOTA_LIMITS[tier as keyof typeof QUOTA_LIMITS] || QUOTA_LIMITS.spark;

    // Get current usage
    const currentUsage = await getUserUsage(userId);
    if (!currentUsage) {
      return { success: false, message: 'Failed to fetch current usage' };
    }

    // Check if we need to reset usage (new billing period)
    await checkAndResetUsage(userId);

    // Map feature to usage field
    const usageField = getUsageFieldForFeature(feature);
    const currentUsed = currentUsage[usageField as keyof UsageStats] as number || 0;
    const limit = limits[usageField as keyof typeof limits];

    // Check if usage would exceed limit
    if (typeof limit === 'number' && currentUsed + amount > limit) {
      const featureUsage: FeatureUsage = {
        feature,
        used: currentUsed,
        limit,
        percentage: (currentUsed / limit) * 100,
        canUse: false,
        resetDate: getNextBillingDate(),
      };

      return { 
        success: false, 
        message: `${feature.replace('_', ' ')} limit exceeded. Used: ${currentUsed}/${limit}`,
        usage: featureUsage
      };
    }

    // Update usage
    const usageRef = doc(db, 'usage', userId);
    await updateDoc(usageRef, {
      [usageField]: increment(amount),
      lastUpdated: new Date(),
    });

    // Create feature usage response
    const newUsed = currentUsed + amount;
    const featureUsage: FeatureUsage = {
      feature,
      used: newUsed,
      limit: typeof limit === 'number' ? limit : 'unlimited',
      percentage: typeof limit === 'number' ? (newUsed / limit) * 100 : 0,
      canUse: true,
    };

    console.log(`✅ Tracked ${feature} usage for user ${userId}: +${amount} (total: ${newUsed})`);
    
    return { 
      success: true, 
      message: `${feature.replace('_', ' ')} usage tracked successfully`,
      usage: featureUsage
    };

  } catch (error) {
    console.error('❌ Error tracking feature usage:', error);
    return { success: false, message: 'Failed to track usage' };
  }
};

/**
 * Check if user can use a feature
 */
export const canUseFeature = async (
  userId: string, 
  feature: TrackableFeature, 
  amount: number = 1
): Promise<FeatureUsage> => {
  if (!isFirebaseConfigured() || !db) {
    return {
      feature,
      used: 0,
      limit: 'unlimited',
      percentage: 0,
      canUse: true,
    };
  }

  try {
    const subscription = await getUserSubscription(userId);
    const tier = subscription?.tier || 'spark';
    const limits = QUOTA_LIMITS[tier as keyof typeof QUOTA_LIMITS] || QUOTA_LIMITS.spark;

    const currentUsage = await getUserUsage(userId);
    if (!currentUsage) {
      return {
        feature,
        used: 0,
        limit: 0,
        percentage: 100,
        canUse: false,
      };
    }

    const usageField = getUsageFieldForFeature(feature);
    const currentUsed = currentUsage[usageField as keyof UsageStats] as number || 0;
    const limit = limits[usageField as keyof typeof limits];

    const featureUsage: FeatureUsage = {
      feature,
      used: currentUsed,
      limit: typeof limit === 'number' ? limit : 'unlimited',
      percentage: typeof limit === 'number' ? (currentUsed / limit) * 100 : 0,
      canUse: typeof limit === 'number' ? currentUsed + amount <= limit : true,
      resetDate: getNextBillingDate(),
    };

    return featureUsage;

  } catch (error) {
    console.error('❌ Error checking feature access:', error);
    return {
      feature,
      used: 0,
      limit: 0,
      percentage: 100,
      canUse: false,
    };
  }
};

/**
 * Get all feature usage for a user
 */
export const getAllFeatureUsage = async (userId: string): Promise<Record<TrackableFeature, FeatureUsage>> => {
  const features: TrackableFeature[] = [
    'ai_credits', 'ai_edits', 'social_sets', 'storage_gb', 
    'context_files', 'api_calls', 'post_creation', 'media_upload'
  ];

  const usagePromises = features.map(async (feature) => {
    const usage = await canUseFeature(userId, feature);
    return [feature, usage] as [TrackableFeature, FeatureUsage];
  });

  const usageResults = await Promise.all(usagePromises);
  return Object.fromEntries(usageResults) as Record<TrackableFeature, FeatureUsage>;
};

/**
 * Reset usage for new billing period
 */
export const checkAndResetUsage = async (userId: string): Promise<void> => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const usageRef = doc(db, 'usage', userId);
    const usageDoc = await getDoc(usageRef);

    if (usageDoc.exists()) {
      const data = usageDoc.data();
      const currentPeriodEnd = data.currentPeriodEnd?.toDate();
      const now = new Date();

      // Check if we're past the current billing period
      if (currentPeriodEnd && now > currentPeriodEnd) {
        console.log(`🔄 Resetting usage for user ${userId} - new billing period`);
        
        await updateDoc(usageRef, {
          aiCredits: 0,
          aiEdits: 0,
          apiCalls: 0,
          // Don't reset: socialSets, storageUsedGB, contextFiles (these are cumulative)
          currentPeriodStart: now,
          currentPeriodEnd: getNextBillingDate(now),
          lastUpdated: now,
        });
      }
    }
  } catch (error) {
    console.error('❌ Error checking/resetting usage:', error);
  }
};

/**
 * Log detailed usage activity
 */
export const logUsageActivity = async (
  userId: string,
  feature: TrackableFeature,
  action: string,
  metadata?: Record<string, any>
): Promise<void> => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const activityRef = collection(db, 'usage_logs');
    await setDoc(doc(activityRef), {
      userId,
      feature,
      action,
      metadata: metadata || {},
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('❌ Error logging usage activity:', error);
  }
};

/**
 * Get usage history for a user
 */
export const getUsageHistory = async (
  userId: string, 
  feature?: TrackableFeature, 
  limitResults: number = 50
): Promise<any[]> => {
  if (!isFirebaseConfigured() || !db) return [];

  try {
    const logsRef = collection(db, 'usage_logs');
    let q = query(
      logsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitResults)
    );

    if (feature) {
      q = query(
        logsRef,
        where('userId', '==', userId),
        where('feature', '==', feature),
        orderBy('timestamp', 'desc'),
        limit(limitResults)
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    }));
  } catch (error) {
    console.error('❌ Error fetching usage history:', error);
    return [];
  }
};

// Helper functions
function getUsageFieldForFeature(feature: TrackableFeature): string {
  const mapping: Record<TrackableFeature, string> = {
    'ai_credits': 'aiCredits',
    'ai_edits': 'aiEdits',
    'social_sets': 'socialSets',
    'storage_gb': 'storageUsedGB',
    'context_files': 'contextFiles',
    'api_calls': 'apiCalls',
    'post_creation': 'apiCalls', // Maps to API calls
    'media_upload': 'storageUsedGB', // Maps to storage
    'analytics_view': 'apiCalls', // Maps to API calls
    'scheduling': 'apiCalls', // Maps to API calls
    'video_processing': 'aiCredits', // Maps to AI credits
  };

  return mapping[feature] || 'apiCalls';
}

function getNextBillingDate(from: Date = new Date()): Date {
  const nextMonth = new Date(from);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1); // First day of next month
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
}

// Types are already exported above, no need to re-export 