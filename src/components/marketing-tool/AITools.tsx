'use client';

import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  PhotoIcon, 
  DocumentTextIcon, 
  MicrophoneIcon,
  CogIcon,
  HashtagIcon,
  PaintBrushIcon,
  EyeIcon,
  FilmIcon,
  FolderIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useCrowsEye } from '@/hooks/api/useCrowsEye';
import { useAudioImport } from '@/hooks/api/useAudioImport';
import { useStoryFormatter } from '@/hooks/api/useStoryFormatter';
import { useHighlightReel } from '@/hooks/api/useHighlightReel';
import { useGallery } from '@/hooks/api/useGallery';

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

export default function AITools() {
  const { user } = useAuth(); // Reserved for future permission checks
  const [activeTab, setActiveTab] = useState('content');
  
  // Initialize API hooks
  const crowsEye = useCrowsEye();
  const audioImport = useAudioImport();
  const storyFormatter = useStoryFormatter();
  const highlightReel = useHighlightReel();
  const gallery = useGallery();
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [tone, setTone] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    apiKeys: {},
    preferences: { defaultPlatform: 'instagram', defaultTone: 'professional' }
  });
  const [showApiKeys, setShowApiKeys] = useState(false);
  
  // Crow's Eye specific state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [galleryPrompt, setGalleryPrompt] = useState('');
  const [captionTone, setCaptionTone] = useState('professional');
  const [generatedGallery, setGeneratedGallery] = useState<string[]>([]);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  
  // Highlight reel state
  const [highlightTitle, setHighlightTitle] = useState('');
  const [highlightDescription, setHighlightDescription] = useState('');
  
  // Gallery state
  const [galleryName, setGalleryName] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');

  const platforms = [
    'instagram',
    'facebook', 
    'twitter',
    'linkedin',
    'tiktok',
    'youtube'
  ];

  const tones = [
    'professional',
    'casual',
    'friendly',
    'formal',
    'humorous',
    'inspiring'
  ];

  const tabs = [
    { id: 'content', name: 'Content Generation', icon: DocumentTextIcon },
    { id: 'crowseye', name: 'Crow\'s Eye AI', icon: EyeIcon },
    { id: 'gallery', name: 'Smart Gallery', icon: FolderIcon },
    { id: 'highlights', name: 'Highlight Reels', icon: FilmIcon },
    { id: 'hashtags', name: 'Hashtag Generator', icon: HashtagIcon },
    { id: 'templates', name: 'Templates', icon: PaintBrushIcon },
    { id: 'image', name: 'Image Enhancement', icon: PhotoIcon },
    { id: 'voice', name: 'Voice & Audio', icon: MicrophoneIcon },
    { id: 'settings', name: 'AI Settings', icon: CogIcon },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings.preferences.defaultPlatform) {
      setPlatform(settings.preferences.defaultPlatform);
    }
    if (settings.preferences.defaultTone) {
      setTone(settings.preferences.defaultTone);
    }
  }, [settings]);

  const loadSettings = async () => {
    try {
      const { settingsStore } = await import('@/lib/marketing-tool-store');
      const userSettings = settingsStore.getSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const { settingsStore } = await import('@/lib/marketing-tool-store');
      const updatedSettings = settingsStore.updateSettings(newSettings);
      setSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  };

  const generateContent = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt for content generation.');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('🤖 Generating content... Please wait...');

    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { aiStore } = await import('@/lib/marketing-tool-store');
      const content = aiStore.generateContent(prompt, platform, tone);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAsDraft = async () => {
    if (!generatedContent.trim()) {
      alert('No content to save.');
      return;
    }

    try {
      const { postsStore } = await import('@/lib/marketing-tool-store');
      postsStore.addPost({
        content: generatedContent,
        platform,
        status: 'draft',
        userId: user?.uid || 'anonymous'
      });

      alert('Draft saved successfully!');
      setGeneratedContent('');
      setPrompt('');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft.');
    }
  };

  const schedulePost = async () => {
    if (!generatedContent.trim()) {
      alert('No content to schedule.');
      return;
    }

    try {
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + 1); // Schedule for 1 hour from now

      const { postsStore } = await import('@/lib/marketing-tool-store');
      postsStore.addPost({
        content: generatedContent,
        platform,
        status: 'scheduled',
        scheduledTime: scheduledTime.toISOString(),
        userId: user?.uid || 'anonymous'
      });

      alert('Post scheduled successfully!');
      setGeneratedContent('');
      setPrompt('');
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('Error scheduling post.');
    }
  };

  const generateHashtags = async (topic: string) => {
    if (!topic.trim()) return;

    const hashtags = [
      `#${topic.toLowerCase().replace(/\s+/g, '')}`,
      '#marketing',
      '#socialmedia',
      '#content',
      '#business',
      '#growth',
      '#success',
      '#inspiration',
      '#motivation',
      '#entrepreneur'
    ];

    return hashtags.slice(0, 8).join(' ');
  };

  const contentTemplates = [
    {
      name: 'Product Launch',
      template: '🚀 Exciting news! We\'re thrilled to announce {product}! \n\n✨ Key features:\n• Feature 1\n• Feature 2\n• Feature 3\n\nReady to get started? Check it out! 👇\n\n#productlaunch #innovation #excited'
    },
    {
      name: 'Behind the Scenes',
      template: '👀 Behind the scenes at {company}! \n\nHere\'s a sneak peek at how we {process}. It\'s amazing to see the dedication and creativity that goes into every {output}!\n\n#behindthescenes #teamwork #process #passion'
    },
    {
      name: 'Motivational Quote',
      template: '💪 "{quote}" \n\nThis quote perfectly captures the spirit of {topic}. What motivates you to keep pushing forward?\n\n#motivation #inspiration #success #mindset #growth'
    },
    {
      name: 'Tutorial/Tips',
      template: '📚 Pro Tip: {tip_title}\n\nHere\'s how to {action}:\n\n1️⃣ Step 1\n2️⃣ Step 2  \n3️⃣ Step 3\n\nTry this out and let us know how it works for you! 💬\n\n#tips #tutorial #howto #learning'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">AI Tools</h2>
      
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-700 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content Generation */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Content Generator</h3>
            
            {/* Input Section */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe what you want to post about:
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., 'New product launch for eco-friendly water bottles'"
                  className="w-full h-24 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Platform:</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {platforms.map(p => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>

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
              </div>

              <button 
                onClick={generateContent}
                disabled={isGenerating || !prompt.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>{isGenerating ? 'Generating...' : 'Generate Content'}</span>
              </button>
            </div>

            {/* Generated Content */}
            {generatedContent && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Generated Content:</label>
                <textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full h-40 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                
                <div className="flex space-x-3">
                  <button
                    onClick={saveAsDraft}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={schedulePost}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Schedule Post
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedContent('');
                      setPrompt('');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Crow's Eye AI */}
      {activeTab === 'crowseye' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <EyeIcon className="h-6 w-6 text-primary-500" />
              <span>Crow's Eye AI - Smart Media Organization</span>
            </h3>
            
            {/* Media Search */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Your Media:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for bread, bakery, people, etc..."
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={async () => {
                      const results = await crowsEye.searchMedia(searchQuery);
                      setSearchResults(results);
                    }}
                    disabled={crowsEye.loading}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                    <span>{crowsEye.loading ? 'Searching...' : 'Search'}</span>
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-600/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Raw Photos ({searchResults.raw_photos?.length || 0})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {searchResults.raw_photos?.map((photo: string, index: number) => (
                        <label key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedMedia.includes(photo)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMedia([...selectedMedia, photo]);
                              } else {
                                setSelectedMedia(selectedMedia.filter(m => m !== photo));
                              }
                            }}
                            className="rounded"
                          />
                          <span>{photo.split('/').pop()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-600/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Raw Videos ({searchResults.raw_videos?.length || 0})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {searchResults.raw_videos?.map((video: string, index: number) => (
                        <label key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedMedia.includes(video)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMedia([...selectedMedia, video]);
                              } else {
                                setSelectedMedia(selectedMedia.filter(m => m !== video));
                              }
                            }}
                            className="rounded"
                          />
                          <span>{video.split('/').pop()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-600/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Finished Posts ({searchResults.finished_posts?.length || 0})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {searchResults.finished_posts?.map((post: string, index: number) => (
                        <label key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedMedia.includes(post)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMedia([...selectedMedia, post]);
                              } else {
                                setSelectedMedia(selectedMedia.filter(m => m !== post));
                              }
                            }}
                            className="rounded"
                          />
                          <span>{post.split('/').pop()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Generation */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gallery Generation Prompt:
                </label>
                <textarea
                  value={galleryPrompt}
                  onChange={(e) => setGalleryPrompt(e.target.value)}
                  placeholder="E.g., 'Create a gallery showcasing our best bread products for Instagram'"
                  className="w-full h-20 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <button
                onClick={async () => {
                  if (selectedMedia.length === 0) {
                    alert('Please select some media first');
                    return;
                  }
                  const gallery = await crowsEye.generateGallery({
                    media_paths: selectedMedia,
                    prompt: galleryPrompt,
                    enhance_photos: true
                  });
                  setGeneratedGallery(gallery);
                }}
                disabled={crowsEye.loading || selectedMedia.length === 0}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>{crowsEye.loading ? 'Generating...' : 'Generate Gallery'}</span>
              </button>
            </div>

            {/* Caption Generation */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Caption Tone:</label>
                  <select
                    value={captionTone}
                    onChange={(e) => setCaptionTone(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {tones.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={async () => {
                      if (selectedMedia.length === 0) {
                        alert('Please select some media first');
                        return;
                      }
                      const caption = await crowsEye.generateCaption({
                        media_paths: selectedMedia,
                        tone_prompt: captionTone
                      });
                      setGeneratedCaption(caption);
                    }}
                    disabled={crowsEye.loading || selectedMedia.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>{crowsEye.loading ? 'Generating...' : 'Generate Caption'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Results */}
            {(generatedGallery.length > 0 || generatedCaption) && (
              <div className="space-y-4">
                {generatedGallery.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Generated Gallery ({generatedGallery.length} items):</label>
                    <div className="bg-gray-800 rounded-lg p-4 max-h-32 overflow-y-auto">
                      {generatedGallery.map((item, index) => (
                        <div key={index} className="text-gray-300 text-sm">{item.split('/').pop()}</div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedCaption && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Generated Caption:</label>
                    <textarea
                      value={generatedCaption}
                      onChange={(e) => setGeneratedCaption(e.target.value)}
                      className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                                         onClick={async () => {
                       const name = window.prompt(`Enter gallery name:`) || `Gallery ${Date.now()}`;
                       await crowsEye.saveGallery(name, generatedGallery, generatedCaption);
                       alert('Gallery saved successfully!');
                     }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Save Gallery
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedGallery([]);
                      setGeneratedCaption('');
                      setSelectedMedia([]);
                      setGalleryPrompt('');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {crowsEye.error && (
              <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 text-red-300">
                Error: {crowsEye.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Smart Gallery */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <FolderIcon className="h-6 w-6 text-primary-500" />
              <span>Smart Gallery Management</span>
            </h3>
            
            {/* Create New Gallery */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gallery Name:</label>
                  <input
                    type="text"
                    value={galleryName}
                    onChange={(e) => setGalleryName(e.target.value)}
                    placeholder="E.g., 'Summer Product Collection'"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description:</label>
                  <input
                    type="text"
                    value={galleryDescription}
                    onChange={(e) => setGalleryDescription(e.target.value)}
                    placeholder="Brief description of the gallery"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!galleryName.trim()) {
                    alert('Please enter a gallery name');
                    return;
                  }
                  await gallery.createGallery(
                    galleryName,
                    galleryDescription,
                    { auto_select: true },
                    'chronological'
                  );
                  setGalleryName('');
                  setGalleryDescription('');
                  alert('Gallery created successfully!');
                }}
                disabled={gallery.loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FolderIcon className="h-5 w-5" />
                <span>{gallery.loading ? 'Creating...' : 'Create Gallery'}</span>
              </button>
            </div>

            {/* Existing Galleries */}
            <div>
              <h4 className="text-white font-semibold mb-4">Your Galleries</h4>
              {gallery.loading ? (
                <div className="text-gray-400">Loading galleries...</div>
              ) : gallery.galleries.length === 0 ? (
                <div className="text-gray-400">No galleries found. Create your first gallery above!</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gallery.galleries.map((g) => (
                    <div key={g.id} className="bg-gray-600/50 rounded-lg p-4">
                      <h5 className="text-white font-semibold mb-2">{g.title}</h5>
                      <p className="text-gray-300 text-sm mb-2">{g.description}</p>
                      <p className="text-gray-400 text-xs mb-3">{g.images.length} items</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // View gallery functionality
                            alert(`Viewing gallery: ${g.title}`);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete gallery "${g.title}"?`)) {
                              await gallery.deleteGallery(g.id);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {gallery.error && (
              <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 text-red-300">
                Error: {gallery.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Highlight Reels */}
      {activeTab === 'highlights' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <FilmIcon className="h-6 w-6 text-primary-500" />
              <span>AI Highlight Reels</span>
            </h3>
            
            {/* Create New Highlight Reel */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reel Title:</label>
                  <input
                    type="text"
                    value={highlightTitle}
                    onChange={(e) => setHighlightTitle(e.target.value)}
                    placeholder="E.g., 'Best Moments 2024'"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description:</label>
                  <input
                    type="text"
                    value={highlightDescription}
                    onChange={(e) => setHighlightDescription(e.target.value)}
                    placeholder="Brief description of the highlight reel"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!highlightTitle.trim()) {
                    alert('Please enter a title');
                    return;
                  }
                  await highlightReel.createHighlightReel(
                    highlightTitle,
                    highlightDescription,
                    { auto_select: true, duration: '60s' },
                    '60s',
                    { style: 'dynamic' }
                  );
                  setHighlightTitle('');
                  setHighlightDescription('');
                  alert('Highlight reel created successfully!');
                }}
                disabled={highlightReel.loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FilmIcon className="h-5 w-5" />
                <span>{highlightReel.loading ? 'Creating...' : 'Create Highlight Reel'}</span>
              </button>
            </div>

            {/* Existing Highlight Reels */}
            <div>
              <h4 className="text-white font-semibold mb-4">Your Highlight Reels</h4>
              {highlightReel.loading ? (
                <div className="text-gray-400">Loading highlight reels...</div>
              ) : highlightReel.highlights.length === 0 ? (
                <div className="text-gray-400">No highlight reels found. Create your first reel above!</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {highlightReel.highlights.map((h) => (
                    <div key={h.id} className="bg-gray-600/50 rounded-lg p-4">
                      <h5 className="text-white font-semibold mb-2">{h.title}</h5>
                      <p className="text-gray-300 text-sm mb-2">{h.description}</p>
                      <p className="text-gray-400 text-xs mb-3">{h.duration}s • {h.clips.length} clips</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={async () => {
                            try {
                              const jobId = await highlightReel.renderHighlightReel(h.id);
                              alert(`Rendering started! Job ID: ${jobId}`);
                            } catch (error) {
                              alert('Failed to start rendering');
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Render
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete highlight reel "${h.title}"?`)) {
                              await highlightReel.deleteHighlightReel(h.id);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {highlightReel.error && (
              <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 text-red-300">
                Error: {highlightReel.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hashtag Generator */}
      {activeTab === 'hashtags' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Hashtag Generator</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your topic (e.g., fitness, cooking, travel)..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyPress={async (e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const hashtags = await generateHashtags(target.value);
                                         const resultDiv = document.getElementById('hashtag-result');
                     if (resultDiv) {
                       resultDiv.textContent = hashtags || '';
                    }
                  }
                }}
              />
              <div id="hashtag-result" className="p-4 bg-gray-800 rounded-lg text-gray-300 min-h-[60px] flex items-center">
                Press Enter to generate hashtags...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Content Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contentTemplates.map((template, index) => (
                <div key={index} className="bg-gray-600/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">{template.name}</h4>
                  <p className="text-gray-300 text-sm mb-3">{template.template}</p>
                  <button
                    onClick={() => {
                      setActiveTab('content');
                      setGeneratedContent(template.template);
                    }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Enhancement - Placeholder */}
      {activeTab === 'image' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Image Enhancement</h3>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Upload an image to enhance with AI</p>
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors">
                Upload Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice & Audio */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <MicrophoneIcon className="h-6 w-6 text-primary-500" />
              <span>Voice & Audio Tools</span>
            </h3>
            
            {/* Audio Import */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Import Audio File:
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <MicrophoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Upload an audio file to enhance and edit</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          await audioImport.importAudio(file, {
                            name: file.name,
                            autoEnhance: true,
                            normalizeVolume: true
                          });
                          alert('Audio imported successfully!');
                        } catch (error) {
                          alert('Failed to import audio');
                        }
                      }
                    }}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg cursor-pointer inline-block transition-colors"
                  >
                    Choose Audio File
                  </label>
                </div>
              </div>
            </div>

            {/* Audio Library */}
            <div>
              <h4 className="text-white font-semibold mb-4">Your Audio Library</h4>
              {audioImport.loading ? (
                <div className="text-gray-400">Loading audio files...</div>
              ) : audioImport.audioTracks.length === 0 ? (
                <div className="text-gray-400">No audio files found. Import your first audio file above!</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {audioImport.audioTracks.map((track) => (
                    <div key={track.id} className="bg-gray-600/50 rounded-lg p-4">
                      <h5 className="text-white font-semibold mb-2">{track.name}</h5>
                      <p className="text-gray-400 text-xs mb-2">
                        {track.format} • {Math.round(track.duration)}s • {Math.round(track.size / 1024)}KB
                      </p>
                      {track.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {track.tags.map((tag, index) => (
                            <span key={index} className="bg-primary-600/20 text-primary-300 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={async () => {
                            try {
                              await audioImport.editAudio(track.id, [
                                { type: 'normalize', strength: 0.8 },
                                { type: 'enhance', preset: 'voice' }
                              ]);
                              alert('Audio enhanced successfully!');
                            } catch (error) {
                              alert('Failed to enhance audio');
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Enhance
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete audio "${track.name}"?`)) {
                              await audioImport.deleteAudio(track.id);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {audioImport.error && (
              <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 text-red-300">
                Error: {audioImport.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Settings</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">API Keys Configuration</h4>
                  <button
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    className="text-primary-400 hover:text-primary-300 text-sm"
                  >
                    {showApiKeys ? 'Hide' : 'Show'} API Keys
                  </button>
                </div>
                
                {showApiKeys && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">OpenAI API Key:</label>
                      <input
                        type="password"
                        value={settings.apiKeys.openai || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          apiKeys: { ...settings.apiKeys, openai: e.target.value }
                        })}
                        placeholder="sk-..."
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Google Gemini API Key:</label>
                      <input
                        type="password"
                        value={settings.apiKeys.gemini || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          apiKeys: { ...settings.apiKeys, gemini: e.target.value }
                        })}
                        placeholder="AIza..."
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-white font-medium mb-4">Default Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Platform:</label>
                    <select
                      value={settings.preferences.defaultPlatform || 'instagram'}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, defaultPlatform: e.target.value }
                      })}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {platforms.map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Tone:</label>
                    <select
                      value={settings.preferences.defaultTone || 'professional'}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, defaultTone: e.target.value }
                      })}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {tones.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => saveSettings(settings)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-2">💡 How to get API Keys:</h4>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• <strong>OpenAI:</strong> Visit platform.openai.com → API Keys</li>
                <li>• <strong>Gemini:</strong> Visit aistudio.google.com → Get API Key</li>
                <li>• API keys enable more advanced AI content generation</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 