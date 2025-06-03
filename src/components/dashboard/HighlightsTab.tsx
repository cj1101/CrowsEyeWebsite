'use client';

import React from 'react';
import { useHighlightReel } from '@/hooks/api/useHighlightReel';

export default function HighlightsTab() {
  const { highlights, loading } = useHighlightReel();

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
        <h2 className="text-xl font-semibold text-white">Highlight Reels</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          Create Highlight Reel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((highlight) => (
          <div key={highlight.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="aspect-video bg-gray-700 rounded mb-3 flex items-center justify-center">
              🎬
            </div>
            <h3 className="text-white font-medium mb-2">{highlight.title}</h3>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{highlight.clips.length} clips</span>
              <span>{Math.floor(highlight.duration / 60)}:{(highlight.duration % 60).toString().padStart(2, '0')}</span>
              <span>{new Date(highlight.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 