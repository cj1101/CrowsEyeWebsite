'use client';

import React, { useState } from 'react';
import { useMediaLibrary, MediaItem } from '@/hooks/api/useMediaLibrary';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  MusicalNoteIcon, 
  PlusIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

export default function LibraryTab() {
  const { media, loading, uploadMedia, deleteMedia, processMedia } = useMediaLibrary();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processingInstructions, setProcessingInstructions] = useState('');

  const filteredMedia = media.filter((item: MediaItem) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      await uploadMedia(files[i]);
    }
    setShowUploadModal(false);
  };

  const handleProcessMedia = async (mediaId: string, instructions: string) => {
    await processMedia(mediaId, instructions);
    setShowProcessModal(false);
    setProcessingInstructions('');
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <PhotoIcon className="h-5 w-5" />;
      case 'video': return <VideoCameraIcon className="h-5 w-5" />;
      case 'audio': return <MusicalNoteIcon className="h-5 w-5" />;
      default: return <PhotoIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Media Library</h2>
          <p className="text-gray-400 mt-1">{media.length} items • {selectedItems.length} selected</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            Upload Media
          </button>
          
          {selectedItems.length > 0 && (
            <button 
              onClick={() => setShowProcessModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all"
            >
              <SparklesIcon className="h-4 w-4" />
              AI Process ({selectedItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMedia.map((item: MediaItem) => (
            <div 
              key={item.id} 
              className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer ${
                selectedItems.includes(item.id) ? 'ring-2 ring-purple-500 bg-purple-500/10' : ''
              }`}
              onClick={() => toggleSelection(item.id)}
            >
              {/* Media Preview */}
              <div className="aspect-video bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl text-gray-500">
                    {item.type === 'image' ? '🖼️' : item.type === 'video' ? '🎥' : '🎵'}
                  </div>
                )}
              </div>

              {/* Media Info */}
              <div className="space-y-2">
                <h3 className="text-white font-medium truncate" title={item.name}>{item.name}</h3>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    {getFileIcon(item.type)}
                    <span>{item.type}</span>
                  </div>
                  <span>{(item.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>

                {item.dimensions && (
                  <p className="text-xs text-gray-500">{item.dimensions.width} × {item.dimensions.height}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs bg-purple-600/30 text-purple-200 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-xs text-gray-400">+{item.tags.length - 3} more</span>
                  )}
                </div>

                {/* Platform Indicators */}
                <div className="flex flex-wrap gap-1">
                  {item.platforms.map((platform, index) => (
                    <span key={index} className="text-xs bg-blue-600/30 text-blue-200 px-2 py-1 rounded">
                      {platform}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
                  <div className="flex gap-1">
                    <button className="p-1 text-gray-400 hover:text-white transition-colors" title="View">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-white transition-colors" title="Edit">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-white transition-colors" title="Download">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMedia(item.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors" 
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="divide-y divide-white/10">
            {filteredMedia.map((item: MediaItem) => (
              <div 
                key={item.id}
                className={`p-4 hover:bg-white/5 transition-all cursor-pointer ${
                  selectedItems.includes(item.id) ? 'bg-purple-500/10 border-l-4 border-purple-500' : ''
                }`}
                onClick={() => toggleSelection(item.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-400">
                        {item.type} • {(item.size / 1024 / 1024).toFixed(1)} MB
                        {item.dimensions && ` • ${item.dimensions.width} × ${item.dimensions.height}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {item.platforms.slice(0, 3).map((platform, index) => (
                        <span key={index} className="text-xs bg-blue-600/30 text-blue-200 px-2 py-1 rounded">
                          {platform}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-1">
                      <button className="p-2 text-gray-400 hover:text-white transition-colors" title="View">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Edit">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Download">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMedia(item.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors" 
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Upload Media</h3>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*,audio/*"
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-2">Click to upload files</p>
                <p className="text-sm text-gray-400">Support for images, videos, and audio files</p>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced AI Processing Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-purple-400" />
              Natural Language Media Processing
            </h3>
            <p className="text-gray-400 mb-6">
              Processing {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''} with AI
            </p>

            <div className="space-y-4">
              {/* Quick Actions */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">Quick Actions</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setProcessingInstructions("Resize all images to 1080x1080 for Instagram posts")}
                    className="text-left p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <p className="text-white text-sm font-medium">Instagram Square</p>
                    <p className="text-gray-400 text-xs">Resize to 1080x1080</p>
                  </button>
                  <button
                    onClick={() => setProcessingInstructions("Create Instagram story format (1080x1920) with subtle background blur")}
                    className="text-left p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <p className="text-white text-sm font-medium">Story Format</p>
                    <p className="text-gray-400 text-xs">Vertical 9:16 ratio</p>
                  </button>
                  <button
                    onClick={() => setProcessingInstructions("Add watermark in bottom right corner with 50% opacity")}
                    className="text-left p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <p className="text-white text-sm font-medium">Add Watermark</p>
                    <p className="text-gray-400 text-xs">Brand protection</p>
                  </button>
                  <button
                    onClick={() => setProcessingInstructions("Enhance image quality, increase brightness by 15%, add subtle saturation boost")}
                    className="text-left p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <p className="text-white text-sm font-medium">Auto Enhance</p>
                    <p className="text-gray-400 text-xs">Quality improvement</p>
                  </button>
                </div>
              </div>

              {/* Natural Language Instructions */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">
                  Natural Language Instructions
                </label>
                <textarea
                  value={processingInstructions}
                  onChange={(e) => setProcessingInstructions(e.target.value)}
                  placeholder="Describe exactly what you want to do with these media files. Examples:
• 'Resize all images to Instagram square format, add a subtle vintage filter, and brighten by 20%'
• 'Create TikTok vertical videos from these images with a 3-second duration each'
• 'Remove backgrounds from all images and replace with a soft gradient'
• 'Add our company logo to the bottom right corner of all images with 30% opacity'
• 'Convert all videos to MP4 format, compress to under 50MB, and add captions'"
                  className="w-full h-32 bg-white/10 border border-purple-300/30 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                />
              </div>

              {/* Processing Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">Output Format</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="auto">Auto (Keep Original)</option>
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                    <option value="mp4">MP4 (Video)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">Quality</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="high">High Quality</option>
                    <option value="medium">Medium Quality</option>
                    <option value="low">Low Quality (Smaller File)</option>
                  </select>
                </div>
              </div>

              {/* Platform Optimization */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">Platform Optimization</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Instagram', 'TikTok', 'YouTube', 'LinkedIn'].map((platform) => (
                    <label key={platform} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-sm text-white">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowProcessModal(false);
                  setProcessingInstructions('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  selectedItems.forEach(id => handleProcessMedia(id, processingInstructions));
                  setSelectedItems([]);
                }}
                disabled={!processingInstructions.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <SparklesIcon className="h-4 w-4" />
                Process with AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No media files found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery || filterType !== 'all' ? 'Try adjusting your search or filters' : 'Upload your first media file to get started'}
          </p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Upload Media
          </button>
        </div>
      )}
    </div>
  );
} 