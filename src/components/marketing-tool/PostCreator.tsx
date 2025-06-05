'use client';

import React, { useState, useEffect } from 'react';
import { 
  PhotoIcon, 
  SparklesIcon,
  HashtagIcon,
  ClockIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface Platform {
  id: string;
  name: string;
  enabled: boolean;
  maxLength: number;
}

interface UserSettings {
  apiKeys: {
    openai?: string;
    gemini?: string;
  };
  preferences: {
    defaultPlatform?: string;
    defaultTone?: string;
  };
}

export default function PostCreator() {
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 'instagram', name: 'Instagram', enabled: true, maxLength: 2200 },
    { id: 'facebook', name: 'Facebook', enabled: false, maxLength: 63206 },
    { id: 'twitter', name: 'Twitter/X', enabled: false, maxLength: 280 },
    { id: 'linkedin', name: 'LinkedIn', enabled: false, maxLength: 3000 },
    { id: 'tiktok', name: 'TikTok', enabled: false, maxLength: 2200 },
    { id: 'youtube', name: 'YouTube', enabled: false, maxLength: 5000 },
  ]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]); // Reserved for media upload feature
  const [hashtags, setHashtags] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [settings, setSettings] = useState<UserSettings>({
    apiKeys: {},
    preferences: { defaultPlatform: 'instagram', defaultTone: 'professional' }
  });

  const tones = [
    'professional',
    'casual',
    'friendly',
    'formal',
    'humorous',
    'inspiring'
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings.preferences.defaultTone) {
      setTone(settings.preferences.defaultTone);
    }
  }, [settings]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/marketing-tool/settings?userId=demo-user');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev => 
      prev.map(p => 
        p.id === platformId ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const generateAIContent = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt for AI content generation.');
      return;
    }

    const enabledPlatformIds = platforms.filter(p => p.enabled).map(p => p.id);
    if (enabledPlatformIds.length === 0) {
      alert('Please select at least one platform.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/marketing-tool/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          platform: enabledPlatformIds[0], // Use first enabled platform
          tone,
          apiKeys: settings.apiKeys
        })
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setPrompt(''); // Clear prompt after successful generation
      } else {
        alert('Failed to generate content. Please try again.');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDraft = async () => {
    if (!content.trim()) {
      alert('Please enter some content before saving.');
      return;
    }

    const enabledPlatformIds = platforms.filter(p => p.enabled).map(p => p.id);
    if (enabledPlatformIds.length === 0) {
      alert('Please select at least one platform.');
      return;
    }

    try {
      const response = await fetch('/api/marketing-tool/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content + (hashtags ? `\n\n${hashtags}` : ''),
          platform: enabledPlatformIds[0],
          status: 'draft',
          userId: 'demo-user'
        })
      });

      if (response.ok) {
        alert('Draft saved successfully!');
        clearForm();
      } else {
        alert('Failed to save draft.');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft.');
    }
  };

  const schedulePost = async () => {
    if (!content.trim()) {
      alert('Please enter some content before scheduling.');
      return;
    }

    const enabledPlatformIds = platforms.filter(p => p.enabled).map(p => p.id);
    if (enabledPlatformIds.length === 0) {
      alert('Please select at least one platform.');
      return;
    }

    let scheduledTime = null;
    if (scheduleDate && scheduleTime) {
      scheduledTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    } else {
      // Default to 1 hour from now
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      scheduledTime = defaultTime.toISOString();
    }

    try {
      const response = await fetch('/api/marketing-tool/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content + (hashtags ? `\n\n${hashtags}` : ''),
          platform: enabledPlatformIds[0],
          status: 'scheduled',
          scheduledTime,
          userId: 'demo-user'
        })
      });

      if (response.ok) {
        alert('Post scheduled successfully!');
        clearForm();
      } else {
        alert('Failed to schedule post.');
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('Error scheduling post.');
    }
  };

  const clearForm = () => {
    setContent('');
    setPrompt('');
    setHashtags('');
    setSelectedMedia([]);
    setScheduleDate('');
    setScheduleTime('');
  };

  const enabledPlatforms = platforms.filter(p => p.enabled);
  const minMaxLength = enabledPlatforms.length > 0 ? 
    Math.min(...enabledPlatforms.map(p => p.maxLength)) : 2200;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Create Post</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => window.location.href = '#ai-tools'}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <CogIcon className="h-5 w-5" />
            <span>AI Settings</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* AI Content Generation */}
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <SparklesIcon className="h-6 w-6 mr-2" />
            AI Content Generator
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Describe what you want to post about:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., 'New product launch for eco-friendly water bottles'"
                className="w-full h-20 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tone:</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {tones.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={generateAIContent}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>{isGenerating ? 'Generating...' : 'Generate Content'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Select Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          {enabledPlatforms.length === 0 && (
            <p className="text-yellow-400 text-sm mt-2">⚠️ Please select at least one platform</p>
          )}
        </div>

        {/* Content Creation */}
        <div className="bg-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-2" />
              Post Content
            </h3>
            <div className="text-sm text-gray-400">
              {content.length}/{minMaxLength}
            </div>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your story..."
            className="w-full h-40 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
          <h3 className="text-lg font-semibold text-white mb-4">Add Media (Coming Soon)</h3>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Media upload functionality coming soon</p>
            <p className="text-gray-500 text-sm">Upload images, videos, and other media files</p>
          </div>
        </div>

        {/* Scheduling */}
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ClockIcon className="h-6 w-6 mr-2" />
            Schedule Post (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
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
          <p className="text-gray-400 text-sm mt-2">
            Leave empty to schedule for 1 hour from now
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={saveDraft}
            disabled={!content.trim() || enabledPlatforms.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>Save as Draft</span>
          </button>

          <button
            onClick={schedulePost}
            disabled={!content.trim() || enabledPlatforms.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <ClockIcon className="h-5 w-5" />
            <span>Schedule Post</span>
          </button>

          <button
            onClick={clearForm}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Clear All</span>
          </button>
        </div>

        {/* Tips */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-400 font-medium mb-2">💡 Pro Tips:</h4>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Use AI generation for inspiration, then customize the content</li>
            <li>• Different platforms have different character limits</li>
            <li>• Add relevant hashtags to increase discoverability</li>
            <li>• Schedule posts for optimal engagement times</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 