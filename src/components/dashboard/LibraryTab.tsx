'use client';

import React from 'react';
import { useMediaLibrary } from '@/hooks/api/useMediaLibrary';

export default function LibraryTab() {
  const { media, loading, error } = useMediaLibrary();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error loading media: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Media Library</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          Upload Media
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((item) => (
          <div key={item.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="aspect-video bg-gray-700 rounded mb-3 flex items-center justify-center">
              {item.type === 'image' ? '🖼️' : item.type === 'video' ? '🎥' : '🎵'}
            </div>
            <h3 className="text-white font-medium truncate">{item.name}</h3>
            <p className="text-sm text-gray-400">{item.type} • {(item.size / 1024).toFixed(1)} KB</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag) => (
                <span key={tag} className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 