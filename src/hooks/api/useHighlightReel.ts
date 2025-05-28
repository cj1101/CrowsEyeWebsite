import { useCallback, useState } from 'react';
import { apiFetch, API_ENDPOINTS, HighlightReel, ApiResponse } from '@/lib/api';

export interface UseHighlightReelReturn {
  generateHighlightReel: (videoId: string, options: Record<string, any>) => Promise<ApiResponse<HighlightReel>>;
  loading: boolean;
  error: string | null;
}

export const useHighlightReel = (): UseHighlightReelReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateHighlightReel = useCallback(async (
    videoId: string, 
    options: Record<string, any>
  ): Promise<ApiResponse<HighlightReel>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch<HighlightReel>(API_ENDPOINTS.HIGHLIGHTS, {
        method: 'POST',
        body: JSON.stringify({ videoId, options }),
      });

      if (!response.success) {
        setError(response.error || 'Failed to generate highlight reel');
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate highlight reel';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        data: undefined,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateHighlightReel,
    loading,
    error,
  };
}; 