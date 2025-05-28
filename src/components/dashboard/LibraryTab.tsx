'use client';

import { useState, useCallback } from 'react';
import { useMediaLibrary } from '@/hooks/api/useMediaLibrary';
import { PhotoIcon, VideoCameraIcon, MusicalNoteIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function LibraryTab() {
  const { media, loading, error, uploadMedia, deleteMedia, refreshMedia } = useMediaLibrary();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      for (const file of Array.from(files)) {
        const result = await uploadMedia(file);
        if (!result.success) {
          setUploadError(result.error || 'Upload failed');
          break;
        }
      }
      await refreshMedia();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  }, [uploadMedia, refreshMedia]);

  const handleDelete = useCallback(async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;

    try {
      const result = await deleteMedia(mediaId);
      if (result.success) {
        await refreshMedia();
      } else {
        alert(result.error || 'Delete failed');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }, [deleteMedia, refreshMedia]);

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return PhotoIcon;
      case 'video':
        return VideoCameraIcon;
      case 'audio':
        return MusicalNoteIcon;
      default:
        return PhotoIcon;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !media) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading media library...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Media Library</h2>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
            <PlusIcon className="h-4 w-4 mr-2" />
            Upload Media
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Upload Status */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-blue-700">Uploading files...</span>
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">Error loading media: {error.message}</p>
        </div>
      )}

      {/* Media Grid */}
      {media && media.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {media.map((item) => {
            const IconComponent = getMediaIcon(item.type);
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IconComponent className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate" title={item.filename}>
                    {item.filename}
                  </h3>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{item.type}</span>
                    <span>{formatFileSize(item.size)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No media files</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading your first media file.</p>
        </div>
      )}
    </div>
  );
} 