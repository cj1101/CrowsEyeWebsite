'use client';

import React, { useState } from 'react';
import { 
  SparklesIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  HashtagIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  CpuChipIcon,
  EyeIcon,
  PlayIcon,
  FilmIcon,
  RectangleStackIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAI } from '../../hooks/api/useAI';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'ai' | 'media' | 'analytics' | 'utilities';
  color: string;
  isNew?: boolean;
  isPro?: boolean;
}

const tools: Tool[] = [
  // AI Tools (matching Python implementation)
  {
    id: 'ai-caption',
    name: 'AI Caption Generator',
    description: 'Generate engaging captions with AI for any platform',
    icon: SparklesIcon,
    category: 'ai',
    color: 'from-purple-500 to-pink-500',
    isNew: true
  },
  {
    id: 'ai-hashtags',
    name: 'Smart Hashtags',
    description: 'AI-powered hashtag suggestions for maximum reach',
    icon: HashtagIcon,
    category: 'ai',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'ai-content',
    name: 'Content Ideas',
    description: 'Get AI-generated content ideas and suggestions',
    icon: DocumentTextIcon,
    category: 'ai',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'image-generator',
    name: 'Imagen 3 Generator',
    description: 'Generate stunning images from text prompts with Google Imagen 3',
    icon: PhotoIcon,
    category: 'ai',
    color: 'from-pink-500 to-rose-500',
    isPro: true
  },
  {
    id: 'video-generator',
    name: 'Veo Video Generator',
    description: 'Create professional videos with AI using Google Veo',
    icon: VideoCameraIcon,
    category: 'ai',
    color: 'from-indigo-500 to-purple-500',
    isPro: true
  },

  // Media Tools (matching Python implementation)
  {
    id: 'highlight-reel',
    name: 'Highlight Reel Generator',
    description: 'Create engaging highlight reels from your content',
    icon: FilmIcon,
    category: 'media',
    color: 'from-orange-500 to-red-500',
    isNew: true
  },
  {
    id: 'video-processor',
    name: 'Video Processor',
    description: 'Process and optimize videos for social media',
    icon: PlayIcon,
    category: 'media',
    color: 'from-teal-500 to-cyan-500',
    isPro: true
  },
  {
    id: 'thumbnail-generator',
    name: 'Thumbnail Generator',
    description: 'Generate thumbnails and preview images',
    icon: RectangleStackIcon,
    category: 'media',
    color: 'from-yellow-500 to-orange-500'
  },

  // Analytics Tools (matching Python implementation)
  {
    id: 'performance-tracker',
    name: 'Performance Tracker',
    description: 'Track and analyze your content performance across platforms',
    icon: ChartBarIcon,
    category: 'analytics',
    color: 'from-blue-500 to-indigo-500'
  },

  // Utilities (matching Python implementation)
  {
    id: 'bulk-uploader',
    name: 'Bulk Operations',
    description: 'Mass content creation and scheduling operations',
    icon: CloudArrowUpIcon,
    category: 'utilities',
    color: 'from-gray-500 to-slate-500'
  },
  {
    id: 'preview-generator',
    name: 'Platform Previews',
    description: 'Preview content across different social platforms',
    icon: EyeIcon,
    category: 'utilities',
    color: 'from-emerald-500 to-green-500'
  }
];

export default function ToolsTab() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'media' | 'analytics' | 'utilities'>('all');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showToolModal, setShowToolModal] = useState(false);
  
  // AI Hook
  const { generateCaptions, generateHashtags, generateContentIdeas, generateImages, generateVideos, loading, error } = useAI();

  // Tool state
  const [toolState, setToolState] = useState<Record<string, any>>({
    'ai-caption': { content: '', platform: 'instagram', style: 'engaging' },
    'ai-hashtags': { content: '', count: 15, niche: '', trending: true },
    'ai-content': { topic: '', platform: 'instagram', contentType: 'post', audience: '', brandVoice: 'engaging', count: 5 },
    'image-generator': { prompt: '', style: 'photorealistic', aspectRatio: '16:9', quality: 'hd', count: 1 },
    'video-generator': { prompt: '', duration: 10, style: 'cinematic', aspectRatio: '16:9', fps: 24 },
    'highlight-reel': { mediaIds: [], duration: 30, style: 'dynamic', includeText: true, includeMusic: true, instructions: '' }
  });

  const [results, setResults] = useState<Record<string, any>>({});

  const categories = [
    { id: 'all', name: 'All Tools', icon: CpuChipIcon },
    { id: 'ai', name: 'AI Tools', icon: SparklesIcon },
    { id: 'media', name: 'Media Tools', icon: PhotoIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'utilities', name: 'Utilities', icon: ArrowPathIcon }
  ];

  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
    setShowToolModal(true);
  };

  const getCategoryCount = (category: string) => {
    if (category === 'all') return tools.length;
    return tools.filter(tool => tool.category === category).length;
  };

  const updateToolState = (toolId: string, updates: any) => {
    setToolState(prev => ({
      ...prev,
      [toolId]: { ...prev[toolId], ...updates }
    }));
  };

  const handleToolAction = async (toolId: string) => {
    const state = toolState[toolId];
    
    try {
      let result = null;
      
      switch (toolId) {
        case 'ai-caption':
          if (!state.content.trim()) {
            alert('Please enter content to generate captions for');
            return;
          }
          // For demo, using content as media ID 1
          result = await generateCaptions({
            media_ids: [1],
            style: state.style,
            platform: state.platform,
            auto_apply: false
          });
          break;
          
        case 'ai-hashtags':
          if (!state.content.trim()) {
            alert('Please enter content to generate hashtags for');
            return;
          }
          result = await generateHashtags({
            content: state.content,
            count: state.count,
            niche: state.niche || undefined,
            trending: state.trending,
            platforms: [state.platform || 'instagram']
          });
          break;
          
        case 'ai-content':
          result = await generateContentIdeas({
            topic: state.topic || undefined,
            platform: state.platform,
            content_type: state.contentType,
            audience: state.audience || undefined,
            brand_voice: state.brandVoice,
            count: state.count
          });
          break;
          
        case 'image-generator':
          if (!state.prompt.trim()) {
            alert('Please enter a prompt to generate images');
            return;
          }
          result = await generateImages({
            prompt: state.prompt,
            style: state.style,
            aspect_ratio: state.aspectRatio,
            quality: state.quality,
            count: state.count
          });
          break;
          
        case 'video-generator':
          if (!state.prompt.trim()) {
            alert('Please enter a prompt to generate videos');
            return;
          }
          result = await generateVideos({
            prompt: state.prompt,
            duration: state.duration,
            style: state.style,
            aspect_ratio: state.aspectRatio,
            fps: state.fps
          });
          break;
          
        default:
          alert('This tool is not yet implemented');
          return;
      }
      
      if (result) {
        setResults(prev => ({ ...prev, [toolId]: result }));
      }
    } catch (err) {
      console.error('Tool action failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Tools & Utilities</h2>
          <p className="text-gray-400 mt-1">Powerful tools to enhance your content creation workflow</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = getCategoryCount(category.id);
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.name}
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer group"
            >
              {/* Tool Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                
                <div className="flex gap-1">
                  {tool.isNew && (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                  {tool.isPro && (
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                      Pro
                    </span>
                  )}
                </div>
              </div>

              {/* Tool Info */}
              <div className="space-y-2">
                <h3 className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Category Badge */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {tool.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <CpuChipIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No tools found</h3>
          <p className="text-gray-400 mb-6">Try selecting a different category</p>
        </div>
      )}

      {/* Tool Modal */}
      {showToolModal && selectedTool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${selectedTool.color}`}>
                  <selectedTool.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedTool.name}</h3>
                  <p className="text-gray-400 mt-1">{selectedTool.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowToolModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tool Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Input */}
              <div className="space-y-4">
                {selectedTool.id === 'ai-caption' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Content Description</label>
                      <textarea
                        value={toolState['ai-caption']?.content || ''}
                        onChange={(e) => updateToolState('ai-caption', { content: e.target.value })}
                        placeholder="Describe the content you want to generate captions for..."
                        className="w-full h-24 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Style</label>
                        <select 
                          value={toolState['ai-caption']?.style || 'engaging'}
                          onChange={(e) => updateToolState('ai-caption', { style: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="engaging">Engaging</option>
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="funny">Funny</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Platform</label>
                        <select 
                          value={toolState['ai-caption']?.platform || 'instagram'}
                          onChange={(e) => updateToolState('ai-caption', { platform: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="tiktok">TikTok</option>
                          <option value="youtube">YouTube</option>
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleToolAction('ai-caption')}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Generating...' : 'Generate Caption'}
                    </button>
                  </>
                )}

                {selectedTool.id === 'ai-hashtags' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Content Topic</label>
                      <input
                        type="text"
                        value={toolState['ai-hashtags']?.content || ''}
                        onChange={(e) => updateToolState('ai-hashtags', { content: e.target.value })}
                        placeholder="e.g., Amazing sunset photo from my vacation"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Number of Hashtags</label>
                        <select 
                          value={toolState['ai-hashtags']?.count || 15}
                          onChange={(e) => updateToolState('ai-hashtags', { count: parseInt(e.target.value) })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={5}>5 hashtags</option>
                          <option value={10}>10 hashtags</option>
                          <option value={15}>15 hashtags</option>
                          <option value={20}>20 hashtags</option>
                          <option value={30}>30 hashtags</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Niche (Optional)</label>
                        <input
                          type="text"
                          value={toolState['ai-hashtags']?.niche || ''}
                          onChange={(e) => updateToolState('ai-hashtags', { niche: e.target.value })}
                          placeholder="e.g., travel, fitness, food"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="trending"
                        checked={toolState['ai-hashtags']?.trending || false}
                        onChange={(e) => updateToolState('ai-hashtags', { trending: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="trending" className="text-sm text-gray-400">
                        Include trending hashtags
                      </label>
                    </div>
                    
                    <button 
                      onClick={() => handleToolAction('ai-hashtags')}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Generating...' : 'Generate Hashtags'}
                    </button>
                  </>
                )}

                {selectedTool.id === 'ai-content' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Topic (Optional)</label>
                      <input
                        type="text"
                        value={toolState['ai-content']?.topic || ''}
                        onChange={(e) => updateToolState('ai-content', { topic: e.target.value })}
                        placeholder="e.g., fitness motivation, cooking tips..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Platform</label>
                        <select 
                          value={toolState['ai-content']?.platform || 'instagram'}
                          onChange={(e) => updateToolState('ai-content', { platform: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="tiktok">TikTok</option>
                          <option value="youtube">YouTube</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Content Type</label>
                        <select 
                          value={toolState['ai-content']?.contentType || 'post'}
                          onChange={(e) => updateToolState('ai-content', { contentType: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="post">Post</option>
                          <option value="story">Story</option>
                          <option value="reel">Reel</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Target Audience (Optional)</label>
                        <input
                          type="text"
                          value={toolState['ai-content']?.audience || ''}
                          onChange={(e) => updateToolState('ai-content', { audience: e.target.value })}
                          placeholder="e.g., fitness enthusiasts, young professionals"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Brand Voice</label>
                        <select 
                          value={toolState['ai-content']?.brandVoice || 'engaging'}
                          onChange={(e) => updateToolState('ai-content', { brandVoice: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="engaging">Engaging</option>
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="motivational">Motivational</option>
                          <option value="humorous">Humorous</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Number of Ideas</label>
                      <select 
                        value={toolState['ai-content']?.count || 5}
                        onChange={(e) => updateToolState('ai-content', { count: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value={3}>3 ideas</option>
                        <option value={5}>5 ideas</option>
                        <option value={10}>10 ideas</option>
                      </select>
                    </div>
                    
                    <button 
                      onClick={() => handleToolAction('ai-content')}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Generating...' : 'Generate Ideas'}
                    </button>
                  </>
                )}

                {selectedTool.id === 'image-generator' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Image Description</label>
                      <textarea
                        value={toolState['image-generator']?.prompt || ''}
                        onChange={(e) => updateToolState('image-generator', { prompt: e.target.value })}
                        placeholder="Describe the image you want to generate (e.g., A beautiful sunset over mountains with vibrant colors)"
                        className="w-full h-24 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Style</label>
                        <select 
                          value={toolState['image-generator']?.style || 'photorealistic'}
                          onChange={(e) => updateToolState('image-generator', { style: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="photorealistic">Photorealistic</option>
                          <option value="artistic">Artistic</option>
                          <option value="cartoon">Cartoon</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Aspect Ratio</label>
                        <select 
                          value={toolState['image-generator']?.aspectRatio || '16:9'}
                          onChange={(e) => updateToolState('image-generator', { aspectRatio: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="1:1">Square (1:1)</option>
                          <option value="16:9">Landscape (16:9)</option>
                          <option value="4:5">Portrait (4:5)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Quality</label>
                        <select 
                          value={toolState['image-generator']?.quality || 'hd'}
                          onChange={(e) => updateToolState('image-generator', { quality: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="standard">Standard</option>
                          <option value="hd">HD</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Number of Images</label>
                        <select 
                          value={toolState['image-generator']?.count || 1}
                          onChange={(e) => updateToolState('image-generator', { count: parseInt(e.target.value) })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value={1}>1 image</option>
                          <option value={2}>2 images</option>
                          <option value={4}>4 images</option>
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleToolAction('image-generator')}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Generating...' : 'Generate Images'}
                    </button>
                  </>
                )}

                {selectedTool.id === 'video-generator' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Video Description</label>
                      <textarea
                        value={toolState['video-generator']?.prompt || ''}
                        onChange={(e) => updateToolState('video-generator', { prompt: e.target.value })}
                        placeholder="Describe the video you want to generate (e.g., A serene lake with gentle waves and morning mist)"
                        className="w-full h-24 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Duration (seconds)</label>
                        <select 
                          value={toolState['video-generator']?.duration || 10}
                          onChange={(e) => updateToolState('video-generator', { duration: parseInt(e.target.value) })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value={5}>5 seconds</option>
                          <option value={10}>10 seconds</option>
                          <option value={15}>15 seconds</option>
                          <option value={30}>30 seconds</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Style</label>
                        <select 
                          value={toolState['video-generator']?.style || 'cinematic'}
                          onChange={(e) => updateToolState('video-generator', { style: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="cinematic">Cinematic</option>
                          <option value="natural">Natural</option>
                          <option value="artistic">Artistic</option>
                          <option value="dynamic">Dynamic</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Aspect Ratio</label>
                        <select 
                          value={toolState['video-generator']?.aspectRatio || '16:9'}
                          onChange={(e) => updateToolState('video-generator', { aspectRatio: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="1:1">Square (1:1)</option>
                          <option value="16:9">Landscape (16:9)</option>
                          <option value="9:16">Portrait (9:16)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Frame Rate</label>
                        <select 
                          value={toolState['video-generator']?.fps || 24}
                          onChange={(e) => updateToolState('video-generator', { fps: parseInt(e.target.value) })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value={24}>24 FPS</option>
                          <option value={30}>30 FPS</option>
                          <option value={60}>60 FPS</option>
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleToolAction('video-generator')}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Generating...' : 'Generate Video'}
                    </button>
                  </>
                )}

                {/* Other tools coming soon */}
                {!['ai-caption', 'ai-hashtags', 'ai-content', 'image-generator', 'video-generator'].includes(selectedTool.id) && (
                  <div className="text-center py-8">
                    <selectedTool.icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
                    <p className="text-gray-400">This tool will be available in the next update.</p>
                  </div>
                )}
              </div>

              {/* Right Column - Results */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Results</h4>
                
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {results[selectedTool.id] ? (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(results[selectedTool.id], null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                    <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Results will appear here after generation</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 