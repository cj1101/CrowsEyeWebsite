import React from 'react';
import { Button } from './button';
import { useAddToLibrary } from '@/hooks/api/useAddToLibrary';
import { Loader2, Plus, Check } from 'lucide-react';

interface AddToLibraryButtonProps {
  file?: File;
  url?: string;
  name?: string;
  onSuccess?: (mediaId: string) => void;
  onError?: (error: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function AddToLibraryButton({
  file,
  url,
  name = 'media-file',
  onSuccess,
  onError,
  variant = 'outline',
  size = 'sm',
  className = '',
  children
}: AddToLibraryButtonProps) {
  const { addToLibrary, addFromUrl, isLoading, error } = useAddToLibrary();
  const [success, setSuccess] = React.useState(false);

  const handleAddToLibrary = async () => {
    try {
      let result;
      
      if (file) {
        result = await addToLibrary(file);
      } else if (url) {
        result = await addFromUrl(url, name);
      } else {
        throw new Error('No file or URL provided');
      }

      if (result.success && result.mediaId) {
        setSuccess(true);
        onSuccess?.(result.mediaId);
        
        // Reset success state after 2 seconds
        setTimeout(() => setSuccess(false), 2000);
      } else {
        throw new Error(result.error || 'Failed to add to library');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to library';
      onError?.(errorMessage);
    }
  };

  const buttonContent = children || (
    <>
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : success ? (
        <Check className="w-4 h-4 mr-2" />
      ) : (
        <Plus className="w-4 h-4 mr-2" />
      )}
      {isLoading ? 'Adding...' : success ? 'Added!' : 'Add to Library'}
    </>
  );

  return (
    <Button
      onClick={handleAddToLibrary}
      disabled={isLoading || success || (!file && !url)}
      variant={variant}
      size={size}
      className={className}
    >
      {buttonContent}
    </Button>
  );
} 