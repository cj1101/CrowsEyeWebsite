import { useCallback } from 'react';
import { useApiSWR, API_ENDPOINTS, AnalyticsData, ApiResponse } from '@/lib/api';

export interface UseAnalyticsReturn {
  analytics: AnalyticsData | undefined;
  loading: boolean;
  error: Error | null;
  exportAnalytics: () => Promise<ApiResponse<Blob>>;
  refreshAnalytics: () => Promise<void>;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const { data: analytics, error, isLoading: loading, mutate: swrMutate } = useApiSWR<AnalyticsData>(
    API_ENDPOINTS.ANALYTICS
  );

  const refreshAnalytics = useCallback(async (): Promise<void> => {
    await swrMutate();
  }, [swrMutate]);

  const exportAnalytics = useCallback(async (): Promise<ApiResponse<Blob>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.crowseye.tech'}${API_ENDPOINTS.ANALYTICS_EXPORT}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          data: undefined,
        };
      }

      const blob = await response.blob();
      return {
        success: true,
        data: blob,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
        data: undefined,
      };
    }
  }, []);

  return {
    analytics,
    loading,
    error,
    exportAnalytics,
    refreshAnalytics,
  };
}; 