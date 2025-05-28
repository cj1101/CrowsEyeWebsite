import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserUsage, 
  trackFeatureUsage, 
  canUseFeature, 
  getAllFeatureUsage,
  logUsageActivity,
  type TrackableFeature, 
  type FeatureUsage, 
  type UsageStats 
} from '@/lib/usage-tracking';

export interface UseUsageTrackingReturn {
  usage: UsageStats | null;
  featureUsage: Record<TrackableFeature, FeatureUsage> | null;
  loading: boolean;
  error: string | null;
  trackUsage: (feature: TrackableFeature, amount?: number) => Promise<{ success: boolean; message?: string }>;
  checkFeature: (feature: TrackableFeature, amount?: number) => Promise<FeatureUsage>;
  refreshUsage: () => Promise<void>;
  logActivity: (feature: TrackableFeature, action: string, metadata?: Record<string, any>) => Promise<void>;
}

export const useUsageTracking = (): UseUsageTrackingReturn => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [featureUsage, setFeatureUsage] = useState<Record<TrackableFeature, FeatureUsage> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch usage data
  const fetchUsage = useCallback(async () => {
    if (!user) {
      setUsage(null);
      setFeatureUsage(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [usageStats, allFeatureUsage] = await Promise.all([
        getUserUsage(user.uid),
        getAllFeatureUsage(user.uid)
      ]);

      setUsage(usageStats);
      setFeatureUsage(allFeatureUsage);
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch usage data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Track feature usage
  const trackUsage = useCallback(async (
    feature: TrackableFeature, 
    amount: number = 1
  ): Promise<{ success: boolean; message?: string }> => {
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    try {
      const result = await trackFeatureUsage(user.uid, feature, amount);
      
      // Refresh usage data after tracking
      if (result.success) {
        await fetchUsage();
      }
      
      return result;
    } catch (err) {
      console.error('Error tracking usage:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to track usage' 
      };
    }
  }, [user, fetchUsage]);

  // Check if user can use a feature
  const checkFeature = useCallback(async (
    feature: TrackableFeature, 
    amount: number = 1
  ): Promise<FeatureUsage> => {
    if (!user) {
      return {
        feature,
        used: 0,
        limit: 0,
        percentage: 100,
        canUse: false,
      };
    }

    try {
      return await canUseFeature(user.uid, feature, amount);
    } catch (err) {
      console.error('Error checking feature access:', err);
      return {
        feature,
        used: 0,
        limit: 0,
        percentage: 100,
        canUse: false,
      };
    }
  }, [user]);

  // Log activity
  const logActivity = useCallback(async (
    feature: TrackableFeature,
    action: string,
    metadata?: Record<string, any>
  ): Promise<void> => {
    if (!user) return;

    try {
      await logUsageActivity(user.uid, feature, action, metadata);
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  }, [user]);

  // Refresh usage data
  const refreshUsage = useCallback(async () => {
    await fetchUsage();
  }, [fetchUsage]);

  // Fetch usage on mount and when user changes
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    usage,
    featureUsage,
    loading,
    error,
    trackUsage,
    checkFeature,
    refreshUsage,
    logActivity,
  };
}; 