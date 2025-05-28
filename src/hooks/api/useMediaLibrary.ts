import { useCallback } from 'react';
import { useApiSWR, apiFetch, API_ENDPOINTS, MediaItem, ApiResponse } from '@/lib/api';
import { mutate } from 'swr';

export interface UseMediaLibraryReturn {
  media: MediaItem[] | undefined;
  loading: boolean;
  error: Error | null;
  uploadMedia: (file: File, metadata?: Record<string, any>) => Promise<ApiResponse<MediaItem>>;
  deleteMedia: (mediaId: string) => Promise<ApiResponse<void>>;
  refreshMedia: () => Promise<void>;
}

export const useMediaLibrary = (): UseMediaLibraryReturn => {
  const { data: media, error, isLoading: loading, mutate: swrMutate } = useApiSWR<MediaItem[]>(
    API_ENDPOINTS.MEDIA
  );

  const refreshMedia = useCallback(async (): Promise<void> => {
    await swrMutate();
  }, [swrMutate]);

  const uploadMedia = useCallback(async (
    file: File, 
    metadata?: Record<string, any>
  ): Promise<ApiResponse<MediaItem>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await apiFetch<MediaItem>(API_ENDPOINTS.MEDIA_UPLOAD, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });

    // Refresh the media list if upload was successful
    if (response.success) {
      mutate(API_ENDPOINTS.MEDIA);
    }

    return response;
  }, []);

  const deleteMedia = useCallback(async (mediaId: string): Promise<ApiResponse<void>> => {
    const response = await apiFetch<void>(`${API_ENDPOINTS.MEDIA}/${mediaId}`, {
      method: 'DELETE',
    });

    // Refresh the media list if deletion was successful
    if (response.success) {
      mutate(API_ENDPOINTS.MEDIA);
    }

    return response;
  }, []);

  return {
    media,
    loading,
    error,
    uploadMedia,
    deleteMedia,
    refreshMedia,
  };
}; 