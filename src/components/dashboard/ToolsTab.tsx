'use client';

import React, { useState } from 'react';
import { 
  SparklesIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  MusicalNoteIcon,
  HashtagIcon,
  PencilIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  BeakerIcon,
  CpuChipIcon,
  EyeIcon,
  ScissorsIcon,
  PaintBrushIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

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
  // AI Tools
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
    id: 'ai-optimize',
    name: 'Content Optimizer',
    description: 'Optimize your content for different platforms',
    icon: AdjustmentsHorizontalIcon,
    category: 'ai',
    color: 'from-orange-500 to-red-500'
  },

  // Media Tools
  {
    id: 'image-editor',
    name: 'Image Editor',
    description: 'Edit and enhance your images with AI',
    icon: PhotoIcon,
    category: 'media',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'video-processor',
    name: 'Video Processor',
    description: 'Process and optimize videos for social media',
    icon: VideoCameraIcon,
    category: 'media',
    color: 'from-indigo-500 to-purple-500',
    isPro: true
  },
  {
    id: 'audio-editor',
    name: 'Audio Editor',
    description: 'Edit audio files and add effects',
    icon: MusicalNoteIcon,
    category: 'media',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Remove backgrounds from images automatically',
    icon: ScissorsIcon,
    category: 'media',
    color: 'from-yellow-500 to-orange-500',
    isNew: true
  },
  {
    id: 'image-enhancer',
    name: 'Image Enhancer',
    description: 'Enhance image quality with AI upscaling',
    icon: PaintBrushIcon,
    category: 'media',
    color: 'from-violet-500 to-purple-500',
    isPro: true
  },

  // Analytics Tools
  {
    id: 'performance-tracker',
    name: 'Performance Tracker',
    description: 'Track and analyze your content performance',
    icon: ChartBarIcon,
    category: 'analytics',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis',
    description: 'Analyze competitor content and strategies',
    icon: MagnifyingGlassIcon,
    category: 'analytics',
    color: 'from-red-500 to-pink-500',
    isPro: true
  },
  {
    id: 'trend-analyzer',
    name: 'Trend Analyzer',
    description: 'Discover trending topics and hashtags',
    icon: ArrowPathIcon,
    category: 'analytics',
    color: 'from-green-500 to-teal-500'
  },

  // Utilities
  {
    id: 'bulk-uploader',
    name: 'Bulk Uploader',
    description: 'Upload multiple files at once',
    icon: CloudArrowUpIcon,
    category: 'utilities',
    color: 'from-gray-500 to-slate-500'
  },
  {
    id: 'format-converter',
    name: 'Format Converter',
    description: 'Convert between different file formats',
    icon: ArrowPathIcon,
    category: 'utilities',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'preview-generator',
    name: 'Preview Generator',
    description: 'Generate previews for different platforms',
    icon: EyeIcon,
    category: 'utilities',
    color: 'from-emerald-500 to-green-500'
  },
  {
    id: 'ai-lab',
    name: 'AI Lab',
    description: 'Experimental AI features and tools',
    icon: BeakerIcon,
    category: 'utilities',
    color: 'from-purple-500 to-indigo-500',
    isNew: true,
    isPro: true
  }
];

export default function ToolsTab() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'media' | 'analytics' | 'utilities'>('all');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showToolModal, setShowToolModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All Tools', icon: CpuChipIcon },
    { id: 'ai', name: 'AI Tools', icon: SparklesIcon },
    { id: 'media', name: 'Media Tools', icon: PhotoIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'utilities', name: 'Utilities', icon: AdjustmentsHorizontalIcon }
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
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Tool Content */}
            <div className="space-y-6">
              {selectedTool.id === 'ai-caption' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Content Description</label>
                    <textarea
                      placeholder="Describe your content or upload an image..."
                      className="w-full h-24 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Tone</label>
                      <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="humorous">Humorous</option>
                        <option value="inspiring">Inspiring</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Platform</label>
                      <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="twitter">Twitter</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                    Generate Caption
                  </button>
                </div>
              )}

              {selectedTool.id === 'ai-hashtags' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Content Topic</label>
                    <input
                      type="text"
                      placeholder="e.g., fitness, food, travel, business..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Number of Hashtags</label>
                      <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="5">5 hashtags</option>
                        <option value="10">10 hashtags</option>
                        <option value="15">15 hashtags</option>
                        <option value="20">20 hashtags</option>
                        <option value="30">30 hashtags</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Popularity</label>
                      <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="mixed">Mixed</option>
                        <option value="popular">Popular</option>
                        <option value="niche">Niche</option>
                        <option value="trending">Trending</option>
                      </select>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all">
                    Generate Hashtags
                  </button>
                </div>
              )}

              {selectedTool.id === 'image-editor' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Upload an image to edit</p>
                    <p className="text-sm text-gray-400">Supports JPG, PNG, WebP formats</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white/10 border border-white/20 text-white py-2 rounded-lg hover:bg-white/20 transition-all">
                      Resize
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white py-2 rounded-lg hover:bg-white/20 transition-all">
                      Crop
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white py-2 rounded-lg hover:bg-white/20 transition-all">
                      Filters
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white py-2 rounded-lg hover:bg-white/20 transition-all">
                      Enhance
                    </button>
                  </div>
                </div>
              )}

              {selectedTool.id === 'performance-tracker' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Total Posts</h4>
                      <p className="text-2xl font-bold text-purple-400">247</p>
                      <p className="text-sm text-gray-400">+12% this month</p>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Engagement Rate</h4>
                      <p className="text-2xl font-bold text-green-400">4.2%</p>
                      <p className="text-sm text-gray-400">+0.8% this month</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Top Performing Platform</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📷</span>
                      <span className="text-white">Instagram</span>
                      <span className="text-sm text-gray-400">• 5.8% engagement</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all">
                    View Detailed Analytics
                  </button>
                </div>
              )}

              {selectedTool.id === 'ai-content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Content Type</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="post">Social Media Post</option>
                      <option value="story">Story Content</option>
                      <option value="reel">Reel Ideas</option>
                      <option value="caption">Caption Ideas</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Industry/Niche</label>
                    <input
                      type="text"
                      placeholder="e.g., fitness, technology, food..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all">
                    Generate Content Ideas
                  </button>
                </div>
              )}

              {selectedTool.id === 'ai-optimize' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Upload content to optimize</p>
                    <p className="text-sm text-gray-400">Paste text or upload image/video</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Target Platform</label>
                      <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">Twitter</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Goal</label>
                      <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="engagement">Engagement</option>
                        <option value="reach">Reach</option>
                        <option value="conversion">Conversion</option>
                        <option value="awareness">Awareness</option>
                      </select>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all">
                    Optimize Content
                  </button>
                </div>
              )}

              {selectedTool.id === 'video-processor' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                    <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Upload video to process</p>
                    <p className="text-sm text-gray-400">Max file size: 500MB</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <button className="bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-all text-sm">
                      Trim
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-all text-sm">
                      Resize
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-all text-sm">
                      Compress
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-all text-sm">
                      Add Captions
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-all text-sm">
                      Extract Audio
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-all text-sm">
                      Add Effects
                    </button>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                    Process Video
                  </button>
                </div>
              )}

              {selectedTool.id === 'audio-editor' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                    <MusicalNoteIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Upload audio file</p>
                    <p className="text-sm text-gray-400">Supports MP3, WAV, FLAC formats</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white/10 border border-white/20 text-white py-2 rounded-lg hover:bg-white/20 transition-all">
                      Trim Audio
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white py-2 rounded-lg hover:bg-white/20 transition-all">
                      Normalize
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white py-2 rounded-lg hover:bg-white/20 transition-all">
                      Add Effects
                    </button>
                    <button className="bg-white/10 border border-white/20 text-white py-2 rounded-lg hover:bg-white/20 transition-all">
                      Remove Noise
                    </button>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all">
                    Process Audio
                  </button>
                </div>
              )}

              {/* Add interfaces for all remaining tools */}
              {!['ai-caption', 'ai-hashtags', 'image-editor', 'performance-tracker', 'ai-content', 'ai-optimize', 'video-processor', 'audio-editor'].includes(selectedTool.id) && (
                <div className="space-y-4">
                  <div className="bg-white/5 p-6 rounded-lg text-center">
                    <selectedTool.icon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">{selectedTool.name}</h4>
                    <p className="text-gray-400 mb-4">{selectedTool.description}</p>
                    
                    {selectedTool.isPro && (
                      <div className="mb-4">
                        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                          Pro Feature
                        </span>
                      </div>
                    )}
                    
                    <button className={`w-full bg-gradient-to-r ${selectedTool.color} text-white py-3 rounded-lg transition-all`}>
                      Launch {selectedTool.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 