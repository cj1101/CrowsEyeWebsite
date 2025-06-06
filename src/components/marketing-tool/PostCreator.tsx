'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  SparklesIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  PhotoIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Platform {
  id: string;
  name: string;
  enabled: boolean;
  maxLength: number;
}

interface PostCreatorProps {
  defaultPlatform?: string;
}

export default function PostCreator({ defaultPlatform }: PostCreatorProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [aiCreditsRemaining, setAiCreditsRemaining] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 'instagram', name: 'Instagram', enabled: true, maxLength: 2200 },
    { id: 'facebook', name: 'Facebook', enabled: false, maxLength: 63206 },
    { id: 'tiktok', name: 'TikTok', enabled: false, maxLength: 2200 },
    { id: 'youtube', name: 'YouTube', enabled: false, maxLength: 5000 },
    { id: 'pinterest', name: 'Pinterest', enabled: false, maxLength: 500 },
    { id: 'snapchat', name: 'Snapchat', enabled: false, maxLength: 250 },
    { id: 'discord', name: 'Discord', enabled: false, maxLength: 2000 },
    { id: 'telegram', name: 'Telegram', enabled: false, maxLength: 4096 },
  ]);

  const [preferences] = useState({
    preferences: { defaultPlatform: defaultPlatform || 'instagram', defaultTone: 'professional' }
  });

  useEffect(() => {
    fetchAiCredits();
  }, []);

  const fetchAiCredits = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/marketing-tool/ai', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiCreditsRemaining(data.usage.remaining);
      }
    } catch (error) {
      console.error('Error fetching AI credits:', error);
    }
  };

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev =>
      prev.map(p =>
        p.id === platformId ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const generateAiContent = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for AI generation');
      return;
    }

    if (aiCreditsRemaining <= 0) {
      setError('No AI credits remaining. Please upgrade your plan.');
      return;
    }

    const enabledPlatformIds = platforms.filter(p => p.enabled).map(p => p.id);
    if (enabledPlatformIds.length === 0) {
      setError('Please select at least one platform.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/marketing-tool/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt,
          platform: enabledPlatformIds[0],
          tone,
          hashtags: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setContent(data.content);
        setAiCreditsRemaining(data.creditsRemaining);
        setSuccess('Content generated successfully!');
        
        if (data.fallback) {
          setError('AI service temporarily unavailable. Generated fallback content.');
        }
      } else {
        setError(data.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDraft = async () => {
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    const enabledPlatformIds = platforms.filter(p => p.enabled).map(p => p.id);
    if (enabledPlatformIds.length === 0) {
      setError('Please select at least one platform.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/marketing-tool/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          platform: enabledPlatformIds[0],
          status: 'draft',
          mediaUrls: selectedMedia,
          isAiGenerated: prompt.trim() !== '',
          aiPrompt: prompt
        })
      });

      if (response.ok) {
        setSuccess('Draft saved successfully!');
        setContent('');
        setPrompt('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setError('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const schedulePost = async () => {
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    if (!scheduledTime) {
      setError('Please select a scheduled time');
      return;
    }

    const enabledPlatformIds = platforms.filter(p => p.enabled).map(p => p.id);
    if (enabledPlatformIds.length === 0) {
      setError('Please select at least one platform.');
      return;
    }

    setIsScheduling(true);
    setError('');

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/marketing-tool/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          platform: enabledPlatformIds[0],
          status: 'scheduled',
          scheduledTime,
          mediaUrls: selectedMedia,
          isAiGenerated: prompt.trim() !== '',
          aiPrompt: prompt
        })
      });

      if (response.ok) {
        setSuccess('Post scheduled successfully!');
        setContent('');
        setPrompt('');
        setScheduledTime('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to schedule post');
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      setError('Failed to schedule post. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const clearContent = () => {
    setContent('');
    setPrompt('');
    setError('');
    setSuccess('');
  };

  const enabledPlatforms = platforms.filter(p => p.enabled);
  const minMaxLength = enabledPlatforms.length > 0 ?
    Math.min(...enabledPlatforms.map(p => p.maxLength)) : 2200;

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="vision-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tech-heading">Create Content</h2>
            <p className="text-gray-300 tech-body">Generate AI-powered content for your social media</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 tech-body">AI Credits Remaining</div>
            <div className="text-2xl font-bold text-purple-400 tech-heading">{aiCreditsRemaining}</div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <span className="text-red-300 tech-body">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
            <span className="text-green-300 tech-body">{success}</span>
          </div>
        )}

        {/* Platform Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 tech-subheading">Select Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  platform.enabled
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-black/20 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="text-sm font-medium tech-subheading">{platform.name}</div>
                <div className="text-xs text-gray-400 tech-body">
                  {platform.maxLength} chars
                </div>
              </button>
            ))}
          </div>
          {enabledPlatforms.length === 0 && (
            <p className="text-yellow-400 text-sm mt-2 tech-body">⚠️ Please select at least one platform</p>
          )}
        </div>

        {/* AI Generation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 tech-subheading">AI Content Generation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2 tech-body">
                  What would you like to post about?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., New product launch, industry insights, behind-the-scenes..."
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none tech-body"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2 tech-body">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent tech-body"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="creative">Creative</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>

              <button
                onClick={generateAiContent}
                disabled={isGenerating || !prompt.trim() || aiCreditsRemaining <= 0}
                className="w-full flex items-center justify-center space-x-2 vision-button text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed tech-subheading"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>{isGenerating ? 'Generating...' : 'Generate Content'}</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4 tech-subheading">Content Preview</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2 tech-body">
                  Content ({content.length}/{minMaxLength} characters)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Your content will appear here..."
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none tech-body"
                  rows={8}
                  maxLength={minMaxLength}
                />
                {content.length > minMaxLength * 0.8 && (
                  <p className="text-yellow-400 text-sm mt-1 tech-body">
                    ⚠️ Approaching character limit
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2 tech-body">
                  Schedule Time (optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent tech-body"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-8">
          <button
            onClick={saveDraft}
            disabled={!content.trim() || enabledPlatforms.length === 0 || isSaving}
            className="flex items-center space-x-2 vision-card text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tech-subheading"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={schedulePost}
            disabled={!content.trim() || enabledPlatforms.length === 0 || !scheduledTime || isScheduling}
            className="flex items-center space-x-2 vision-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed tech-subheading"
          >
            <CalendarIcon className="h-5 w-5" />
            <span>{isScheduling ? 'Scheduling...' : 'Schedule Post'}</span>
          </button>

          <button
            onClick={clearContent}
            className="flex items-center space-x-2 text-gray-400 hover:text-white px-6 py-3 rounded-xl transition-all duration-300 tech-subheading"
          >
            <span>Clear</span>
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <h4 className="text-blue-300 font-semibold mb-2 tech-subheading">💡 Pro Tips</h4>
          <ul className="text-blue-200 text-sm space-y-1 tech-body">
            <li>• Be specific in your prompts for better AI-generated content</li>
            <li>• Different platforms have different character limits</li>
            <li>• Use scheduling to maintain consistent posting</li>
            <li>• AI-generated content can be edited and customized</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 