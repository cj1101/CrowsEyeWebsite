'use client';

import React from 'react';
import { useStoryFormatter } from '@/hooks/api/useStoryFormatter';

export default function StoriesTab() {
  const { stories, loading, error } = useStoryFormatter();

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
        <p className="text-red-400">Error loading stories: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Stories</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          Create Story
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story) => (
          <div key={story.id} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2">{story.title}</h3>
            <p className="text-gray-300 text-sm mb-3">{story.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{story.media.length} media items</span>
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 