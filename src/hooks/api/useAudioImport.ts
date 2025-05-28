import { useCallback, useState } from 'react';
import { apiFetch, API_ENDPOINTS, ApiResponse } from '@/lib/api';

export interface AudioImportResult {
  id: string;
  mediaId: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface UseAudioImportReturn {
  importAudio: (mediaId: string, file: File) => Promise<ApiResponse<AudioImportResult>>;
  loading: boolean;
  error: string | null;
}

export const useAudioImport = (): UseAudioImportReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importAudio = useCallback(async (
    mediaId: string, 
    file: File
  ): Promise<ApiResponse<AudioImportResult>> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('mediaId', mediaId);
      formData.append('file', file);

      const response = await apiFetch<AudioImportResult>(API_ENDPOINTS.AUDIO_IMPORT, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });

      if (!response.success) {
        setError(response.error || 'Failed to import audio');
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import audio';
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
    importAudio,
    loading,
    error,
  };
}; 