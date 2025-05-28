import { renderHook, act } from '@testing-library/react';
import { useMediaLibrary } from '@/hooks/api/useMediaLibrary';
import { apiFetch } from '@/lib/api';
import { mutate } from 'swr';

// Mock the API fetch function
jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
  useApiSWR: jest.fn(),
  API_ENDPOINTS: {
    MEDIA: '/media',
    MEDIA_UPLOAD: '/media/upload',
  },
}));

// Mock SWR
jest.mock('swr', () => ({
  mutate: jest.fn(),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockMutate = mutate as jest.MockedFunction<typeof mutate>;

// Mock useApiSWR
const mockUseApiSWR = require('@/lib/api').useApiSWR as jest.MockedFunction<any>;

describe('useMediaLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for useApiSWR
    mockUseApiSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });
  });

  it('should return media library data', () => {
    const mockMedia = [
      {
        id: '1',
        filename: 'test.jpg',
        type: 'image',
        size: 1024,
        uploadedAt: '2023-01-01T00:00:00Z',
      },
    ];

    mockUseApiSWR.mockReturnValue({
      data: mockMedia,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useMediaLibrary());

    expect(result.current.media).toEqual(mockMedia);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle loading state', () => {
    mockUseApiSWR.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useMediaLibrary());

    expect(result.current.media).toBeUndefined();
    expect(result.current.loading).toBe(true);
  });

  it('should upload media successfully', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockResponse = {
      success: true,
      data: {
        id: '1',
        filename: 'test.jpg',
        type: 'image',
        size: 1024,
        uploadedAt: '2023-01-01T00:00:00Z',
      },
    };

    mockApiFetch.mockResolvedValue(mockResponse);
    mockUseApiSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useMediaLibrary());

    await act(async () => {
      const response = await result.current.uploadMedia(mockFile);
      expect(response).toEqual(mockResponse);
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/media/upload', {
      method: 'POST',
      body: expect.any(FormData),
      headers: {},
    });
    expect(mockMutate).toHaveBeenCalledWith('/media');
  });

  it('should delete media successfully', async () => {
    const mockResponse = { success: true };
    mockApiFetch.mockResolvedValue(mockResponse);
    mockUseApiSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    const { result } = renderHook(() => useMediaLibrary());

    await act(async () => {
      const response = await result.current.deleteMedia('1');
      expect(response).toEqual(mockResponse);
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/media/1', {
      method: 'DELETE',
    });
    expect(mockMutate).toHaveBeenCalledWith('/media');

    // Restore window.confirm
    window.confirm = originalConfirm;
  });

  it('should handle upload error', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockResponse = {
      success: false,
      error: 'Upload failed',
    };

    mockApiFetch.mockResolvedValue(mockResponse);
    mockUseApiSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useMediaLibrary());

    await act(async () => {
      const response = await result.current.uploadMedia(mockFile);
      expect(response).toEqual(mockResponse);
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
}); 