'use client';

import React, { useState } from 'react';
import { 
  PhotoIcon, 
  SparklesIcon,
  PaperAirplaneIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';

interface Platform {
  id: string;
  name: string;
  enabled: boolean;
  maxLength: number;
}

export default function PostCreator() {
  const [content, setContent] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 'instagram', name: 'Instagram', enabled: true, maxLength: 2200 },
    { id: 'twitter', name: 'Twitter/X', enabled: false, maxLength: 280 },
    { id: 'linkedin', name: 'LinkedIn', enabled: false, maxLength: 3000 },
    { id: 'facebook', name: 'Facebook', enabled: false, maxLength: 63206 },
  ]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev => 
      prev.map(p => 
        p.id === platformId ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const generateAIContent = async () => {
    // TODO: Implement AI content generation
    alert('AI content generation coming soon!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const postData = {
      content,
      platforms: platforms.filter(p => p.enabled).map(p => p.id),
      hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
      mediaFiles: selectedMedia,
      scheduledFor: scheduleDate && scheduleTime ? 
        new Date(`${scheduleDate}T${scheduleTime}`).toISOString() : null
    };

    try {
      const response = await fetch('/api/marketing-tool/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        alert('Post created successfully!');
        // Reset form
        setContent('');
        setHashtags('');
        setSelectedMedia([]);
        setScheduleDate('');
        setScheduleTime('');
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post');
    }
  };

  const enabledPlatforms = platforms.filter(p => p.enabled);
  const minMaxLength = enabledPlatforms.length > 0 ? 
    Math.min(...enabledPlatforms.map(p => p.maxLength)) : 2200;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Create Post</h2>
        <button
          onClick={generateAIContent}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <SparklesIcon className="h-5 w-5" />
          <span>AI Generate</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform Selection */}
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Select Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  platform.enabled
                    ? 'border-primary-500 bg-primary-500/20 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-medium">{platform.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {platform.maxLength} chars
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Creation */}
        <div className="bg-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Post Content</h3>
            <div className="text-sm text-gray-400">
              {content.length}/{minMaxLength}
            </div>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your story..."
            className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            maxLength={minMaxLength}
          />

          {/* Hashtags */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hashtags
            </label>
            <div className="relative">
              <HashtagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#marketing #socialmedia #content"
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Media Selection */}
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Add Media</h3>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Select media from your library or upload new files</p>
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Browse Library
              </button>
              <button
                type="button"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Upload New
              </button>
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Schedule Post</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Leave empty to post immediately
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Save Draft
          </button>
          <button
            type="submit"
            disabled={!content.trim() || enabledPlatforms.length === 0}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            <span>{scheduleDate ? 'Schedule Post' : 'Post Now'}</span>
          </button>
        </div>
      </form>

      {/* Preview */}
      {content && (
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-white whitespace-pre-wrap">{content}</div>
            {hashtags && (
              <div className="mt-2 text-primary-400">
                {hashtags}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 