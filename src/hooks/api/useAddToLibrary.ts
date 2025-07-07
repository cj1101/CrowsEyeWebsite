import { useState } from 'react';
import { MediaService } from '@/lib/firestore';
import { auth } from '@/lib/firebase';

export interface AddToLibraryResult {
  success: boolean;
  mediaId?: string;
  error?: string;
}

export function useAddToLibrary() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToLibrary = async (file: File): Promise<AddToLibraryResult> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📁 Adding media to library:', file.name, 'Size:', file.size);
      
      // Check authentication
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required. Please sign in to add media to library.');
      }
      
      // Upload to Firestore using MediaService
      const mediaDoc = await MediaService.uploadMedia(user.uid, file, {
        caption: '',
        platforms: [],
        aiTags: [
          { tag: 'library', confidence: 1.0 },
          { tag: 'uploaded', confidence: 1.0 }
        ],
        status: 'draft',
        isPostReady: true, // Mark as ready for library use
      });
      
      console.log('✅ Media added to library:', mediaDoc.id);
      return {
        success: true,
        mediaId: mediaDoc.id
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add media to library';
      console.error('❌ Add to library error:', errorMessage);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const addFromUrl = async (url: string, name: string): Promise<AddToLibraryResult> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔗 Adding media from URL to library:', url);
      
      // Fetch the file from URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch media from URL');
      }
      
      const blob = await response.blob();
      const file = new File([blob], name, { type: blob.type });
      
      // Use the regular addToLibrary function
      return await addToLibrary(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add media from URL';
      console.error('❌ Add from URL error:', errorMessage);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  return {
    addToLibrary,
    addFromUrl,
    isLoading,
    error
  };
} 