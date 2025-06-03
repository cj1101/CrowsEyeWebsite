'use client';

import React from 'react';
import { useGallery } from '@/hooks/api/useGallery';

export default function GalleriesTab() {
  const { galleries, loading } = useGallery();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Galleries</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          Create Gallery
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleries.map((gallery) => (
          <div key={gallery.id} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2">{gallery.title}</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {gallery.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-700 rounded flex items-center justify-center">
                  🖼️
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{gallery.images.length} images</span>
              <span>{new Date(gallery.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 