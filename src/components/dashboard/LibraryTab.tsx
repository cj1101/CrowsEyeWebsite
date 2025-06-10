'use client';

import React, { useState } from 'react';
import { useMediaLibrary, MediaItem } from '@/hooks/api/useMediaLibrary';
import MediaUpload from '@/components/media/MediaUpload';
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
  ListBulletIcon,
  DocumentCheckIcon,
  FilmIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

type DashboardMode = 'completed' | 'unedited';

export default function LibraryTab() {
  const { media, loading, uploadMedia, deleteMedia, processMedia, refetch } = useMediaLibrary();
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('unedited');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);

  // Debug: Log media changes
  React.useEffect(() => {
    console.log('Media library updated:', media.length, 'items');
    console.log('Media items:', media);
  }, [media]);

  // Filter media based on dashboard mode
  const dashboardMedia = media.filter((item: MediaItem) => {
    if (dashboardMode === 'completed') {
      return item.status === 'completed' || item.isProcessed === true;
    } else {
      return item.status !== 'completed' && item.isProcessed !== true;
    }
  });

  // Split media into video content and other content
  const videoContent = dashboardMedia.filter((item: MediaItem) => 
    item.type === 'video' || item.subtype === 'reel' || item.subtype === 'short'
  );

  const otherContent = dashboardMedia.filter((item: MediaItem) => 
    item.type !== 'video' && item.subtype !== 'reel' && item.subtype !== 'short'
  );

  // Apply search filter
  const filteredVideoContent = videoContent.filter((item: MediaItem) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredOtherContent = otherContent.filter((item: MediaItem) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUpload = async (files: File[]) => {
    try {
      console.log('Starting upload of', files.length, 'files');
      
      // Upload each file and wait for completion
      const uploadPromises = files.map(async (file) => {
        console.log('Uploading file:', file.name);
        return await uploadMedia(file);
      });
      
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      
      setShowUploadModal(false);
      console.log('All uploads completed, modal closed');
      
      // Show success message (optional)
      // You could add a toast notification here
      
    } catch (error) {
      console.error('Upload failed:', error);
      // You could add error handling/toast here
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getFileIcon = (type: string, subtype?: string) => {
    if (subtype === 'reel' || subtype === 'short') return <FilmIcon className="h-5 w-5" />;
    switch (type) {
      case 'image': return <PhotoIcon className="h-5 w-5" />;
      case 'video': return <VideoCameraIcon className="h-5 w-5" />;
      case 'audio': return <MusicalNoteIcon className="h-5 w-5" />;
      default: return <PhotoIcon className="h-5 w-5" />;
    }
  };

  const MediaCard = ({ item }: { item: MediaItem }) => (
    <div 
      key={item.id} 
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer ${
        selectedItems.includes(item.id) ? 'ring-2 ring-purple-500 bg-purple-500/10' : ''
      }`}
      onClick={() => toggleSelection(item.id)}
    >
      {/* Media Preview */}
      <div className="aspect-video bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
        {item.thumbnail ? (
          <>
            <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
            {(item.type === 'video' || item.subtype === 'reel' || item.subtype === 'short') && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
                  <PlayIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-4xl text-gray-500">
            {item.subtype === 'reel' || item.subtype === 'short' ? '🎬' : 
             item.type === 'image' ? '🖼️' : 
             item.type === 'video' ? '🎥' : '🎵'}
          </div>
        )}
        
        {/* Type indicator */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {item.subtype || item.type}
        </div>
      </div>

      {/* Media Info */}
      <div className="space-y-2">
        <h3 className="text-white font-medium truncate" title={item.name}>{item.name}</h3>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-1">
            {getFileIcon(item.type, item.subtype)}
            <span>{item.subtype || item.type}</span>
          </div>
          <span>{(item.size / 1024 / 1024).toFixed(1)} MB</span>
        </div>

        {item.dimensions && (
          <p className="text-xs text-gray-500">{item.dimensions.width} × {item.dimensions.height}</p>
        )}

        {/* Status indicator for completed posts */}
        {dashboardMode === 'completed' && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <DocumentCheckIcon className="h-3 w-3" />
            <span>Ready to publish</span>
          </div>
        )}

        {/* Duration for video content */}
        {(item.type === 'video' || item.subtype === 'reel' || item.subtype === 'short') && item.duration && (
          <p className="text-xs text-blue-400">Duration: {item.duration}s</p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {/* Show local storage indicator for local uploads */}
          {(item.id?.startsWith('local-') || item.tags?.includes('local-storage')) && (
            <span className="text-xs bg-yellow-600/30 text-yellow-200 px-2 py-1 rounded border border-yellow-500/30">
              📱 Local Only
            </span>
          )}
          {item.tags?.filter(tag => tag !== 'local-storage').slice(0, 2).map((tag, index) => (
            <span key={index} className="text-xs bg-purple-600/30 text-purple-200 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {(item.tags?.filter(tag => tag !== 'local-storage').length || 0) > 2 && (
            <span className="text-xs text-gray-400">+{(item.tags?.filter(tag => tag !== 'local-storage').length || 0) - 2}</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
        <button className="text-gray-400 hover:text-white transition-colors">
          <EyeIcon className="h-4 w-4" />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <PencilIcon className="h-4 w-4" />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <ArrowDownTrayIcon className="h-4 w-4" />
        </button>
        <button className="text-gray-400 hover:text-red-400 transition-colors">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Status Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-200 mb-1">
              Development Mode - Local Storage Active
            </h3>
            <p className="text-sm text-yellow-300/80">
              The backend API is not fully implemented yet. Uploaded files are stored locally in your browser 
              and will persist across sessions, but won't be available on other devices or after clearing browser data.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Mode Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setDashboardMode('unedited')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                dashboardMode === 'unedited' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <PlusIcon className="h-4 w-4 inline mr-2" />
              Unedited Media
            </button>
            <button
              onClick={() => setDashboardMode('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                dashboardMode === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <DocumentCheckIcon className="h-4 w-4 inline mr-2" />
              Completed Posts
            </button>
          </div>

          <div className="text-white">
            <h2 className="text-xl font-bold">
              {dashboardMode === 'completed' ? 'Completed Posts' : 'Unedited Media'}
            </h2>
            <p className="text-sm text-gray-400">
              Videos: {filteredVideoContent.length} • Other: {filteredOtherContent.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {dashboardMode === 'unedited' && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 transition-all"
            >
              <PlusIcon className="h-4 w-4" />
              Upload Media
            </button>
          )}
          
          {selectedItems.length > 0 && (
            <button 
              onClick={() => setShowProcessModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all"
            >
              <SparklesIcon className="h-4 w-4" />
              AI Process ({selectedItems.length})
            </button>
          )}

          {/* Refresh Button */}
          <button 
            onClick={() => {
              console.log('Manual refresh triggered');
              refetch();
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-all"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

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

      {/* Search Bar */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${dashboardMode === 'completed' ? 'completed posts' : 'unedited media'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Split Layout: Video Content (Left) | Other Content (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Video Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <FilmIcon className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">
              Video Content ({filteredVideoContent.length})
            </h3>
          </div>
          
          {filteredVideoContent.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {dashboardMode === 'completed' 
                  ? 'No completed video content yet' 
                  : 'No unedited video content yet'}
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 xl:grid-cols-2 gap-4" 
              : "space-y-4"
            }>
              {filteredVideoContent.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Other Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <PhotoIcon className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              Other Media ({filteredOtherContent.length})
            </h3>
          </div>
          
          {filteredOtherContent.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {dashboardMode === 'completed' 
                  ? 'No completed media yet' 
                  : 'No unedited media yet'}
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 xl:grid-cols-2 gap-4" 
              : "space-y-4"
            }>
              {filteredOtherContent.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Upload Media</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <MediaUpload 
              onUpload={handleUpload}
              multiple={true}
              className="text-white"
            />
          </div>
        </div>
      )}

      {/* AI Processing Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">AI Process Media</h3>
            <p className="text-gray-400 mb-4">Processing {selectedItems.length} selected items</p>
            <textarea
              placeholder="Describe how you want to process the media..."
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowProcessModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Process Media
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 