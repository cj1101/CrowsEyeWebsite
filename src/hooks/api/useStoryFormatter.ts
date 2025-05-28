import { useCallback, useState } from 'react';
import { apiFetch, API_ENDPOINTS, Story, ApiResponse } from '@/lib/api';

export interface UseStoryFormatterReturn {
  formatStory: (fileId: string, caption: string) => Promise<ApiResponse<Story>>;
  loading: boolean;
  error: string | null;
}

export const useStoryFormatter = (): UseStoryFormatterReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatStory = useCallback(async (fileId: string, caption: string): Promise<ApiResponse<Story>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch<Story>(API_ENDPOINTS.STORIES, {
        method: 'POST',
        body: JSON.stringify({ fileId, caption }),
      });

      if (!response.success) {
        setError(response.error || 'Failed to format story');
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to format story';
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
    formatStory,
    loading,
    error,
  };
}; 