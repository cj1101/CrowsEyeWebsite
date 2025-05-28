import { useCallback, useState } from 'react';
import { apiFetch, API_ENDPOINTS, Gallery, ApiResponse } from '@/lib/api';

export interface UseGalleryReturn {
  generateGallery: (prompt: string) => Promise<ApiResponse<Gallery>>;
  loading: boolean;
  error: string | null;
}

export const useGallery = (): UseGalleryReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateGallery = useCallback(async (prompt: string): Promise<ApiResponse<Gallery>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch<Gallery>(API_ENDPOINTS.GALLERY, {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });

      if (!response.success) {
        setError(response.error || 'Failed to generate gallery');
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate gallery';
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
    generateGallery,
    loading,
    error,
  };
}; 