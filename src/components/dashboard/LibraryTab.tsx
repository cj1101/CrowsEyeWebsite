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
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type DashboardMode = 'completed' | 'unedited';

export default function LibraryTab() {
  const router = useRouter();
  const { media, loading, uploadMedia, deleteMedia, processMedia, refetch } = useMediaLibrary();
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('unedited');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

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

    // Google Photos functionality has been discontinued

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
        {item.type === 'image' && item.url ? (
          <>
            <img 
              src={item.url} 
              alt={item.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                (e.target as HTMLImageElement).src = '/images/placeholder-image.jpg';
              }}
            />
          </>
        ) : (item.type === 'video' || item.subtype === 'reel' || item.subtype === 'short') && item.thumbnail ? (
          <>
            <img 
              src={item.thumbnail}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/video-thumb.jpg';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 backdrop-blur-sm rounded-full p-3">
                <PlayIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </>
        ) : item.type === 'video' && item.url ? (
          <>
            <video 
              src={item.url}
              className="w-full h-full object-cover"
              muted
              preload="none"
              onError={(e) => {
                console.error('Video preview error:', e);
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 backdrop-blur-sm rounded-full p-4 hover:bg-black/80 transition-colors">
                <PlayIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </>
        ) : item.thumbnail ? (
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

        {item.dimensions && item.dimensions.width > 0 && (
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
        <button 
          className="text-gray-400 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleViewMedia(item);
          }}
          title="View media"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
        <button 
          className="text-gray-400 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleEditMedia(item);
          }}
          title="Edit/Process media"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button 
          className="text-gray-400 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleDownloadMedia(item);
          }}
          title="Download media"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </button>
        <button 
          className="text-gray-400 hover:text-red-400 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteMedia(item);
          }}
          title="Delete media"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const handleViewMedia = (item: MediaItem) => {
    setSelectedMedia(item);
    setShowMediaModal(true);
  };

  const handleDownloadMedia = (item: MediaItem) => {
    if (item.url) {
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDeleteMedia = async (item: MediaItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteMedia(item.id);
        console.log('Media deleted successfully');
      } catch (error) {
        console.error('Failed to delete media:', error);
      }
    }
  };

  const handleEditMedia = (item: MediaItem) => {
    // For now, just select the item for processing
    setSelectedItems([item.id]);
    setShowProcessModal(true);
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
      {/* Header Controls */}
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
              Total: {dashboardMedia.length} items • Videos: {filteredVideoContent.length} • Other: {filteredOtherContent.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Upload Media Button */}
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2 px-4 py-3"
            title="Upload Media"
          >
            <PlusIcon className="h-5 w-5" />
            Upload Media
          </Button>

          {/* AI Highlight Generator Button */}
          <Button
            onClick={() => router.push('/highlight-generator')}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white flex items-center gap-2 px-4 py-3"
            title="AI Highlight Generator"
          >
            <SparklesIcon className="h-5 w-5" />
            AI Highlight Generator
          </Button>

          {/* Action Button Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => router.push('/ai-tools/photo-generation')}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white flex items-center gap-2 px-4 py-3 min-w-[150px]"
              title="Generate Photo"
            >
              <SparklesIcon className="h-4 w-4" />
              Generate Photo
            </Button>
            <Button
              onClick={() => router.push('/ai-tools/video-generation')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white flex items-center gap-2 px-4 py-3 min-w-[150px]"
              title="Generate Video"
            >
              <VideoCameraIcon className="h-4 w-4" />
              Generate Video
            </Button>
            <Button
              onClick={() => router.push('/ai-tools/photo-editor')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2 px-4 py-3 min-w-[150px]"
              title="Image Editing"
            >
              <PencilIcon className="h-4 w-4" />
              Image Editing
            </Button>
            <Button
              onClick={() => router.push('/ai-tools/video-processing')}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white flex items-center gap-2 px-4 py-3 min-w-[150px]"
              title="Video Processing"
            >
              <FilmIcon className="h-4 w-4" />
              Video Processing
            </Button>
          </div>

          {/* Google Photos functionality has been discontinued */}
        </div>
      </div>

      {/* Combined Media Display */}
      <div className="space-y-6">
        {/* All Media in One Area */}
        {(filteredVideoContent.length === 0 && filteredOtherContent.length === 0) ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <VideoCameraIcon className="h-16 w-16 text-gray-400" />
                  <PhotoIcon className="h-12 w-12 text-gray-500 absolute -bottom-2 -right-2" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {dashboardMode === 'completed' 
                  ? 'No completed content yet' 
                  : 'No media uploaded yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {dashboardMode === 'completed' 
                  ? 'Complete some posts to see them here' 
                  : 'Upload your first images, videos, or audio files to get started'}
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
                {/* Google Photos functionality has been discontinued */}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Video Content Section */}
            {filteredVideoContent.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <FilmIcon className="h-5 w-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Video Content ({filteredVideoContent.length})
                  </h3>
                </div>
                
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 xl:grid-cols-2 gap-4" 
                  : "space-y-4"
                }>
                  {filteredVideoContent.map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Divider - Only show if both sections have content */}
            {filteredVideoContent.length > 0 && filteredOtherContent.length > 0 && (
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                  <div className="bg-gray-900 px-4 py-2 rounded-full border border-white/10">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>Other Media</span>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Media Section */}
            {filteredOtherContent.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <PhotoIcon className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Other Media ({filteredOtherContent.length})
                  </h3>
                </div>
                
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 xl:grid-cols-2 gap-4" 
                  : "space-y-4"
                }>
                  {filteredOtherContent.map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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

      {/* Media View Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedMedia.name}</h3>
              <button
                onClick={() => setShowMediaModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Media Display */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              {selectedMedia.type === 'image' && selectedMedia.url ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="w-full h-auto max-h-[60vh] object-contain rounded"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    (e.target as HTMLImageElement).src = '/images/placeholder-image.jpg';
                  }}
                />
              ) : selectedMedia.type === 'video' && selectedMedia.url ? (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay={false}
                  preload="metadata"
                  className="w-full h-auto max-h-[60vh] object-contain rounded"
                  onError={(e) => {
                    console.error('Video playback error:', e);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : selectedMedia.type === 'audio' && selectedMedia.url ? (
                <audio
                  src={selectedMedia.url}
                  controls
                  preload="metadata"
                  className="w-full"
                  onError={(e) => {
                    console.error('Audio playback error:', e);
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {selectedMedia.type === 'image' ? '🖼️' : 
                       selectedMedia.type === 'video' ? '🎥' : '🎵'}
                    </div>
                    <p>Media preview not available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Media Info */}
            <div className="space-y-3 text-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <span className="ml-2">{selectedMedia.subtype || selectedMedia.type}</span>
                </div>
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="ml-2">{(selectedMedia.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                {selectedMedia.dimensions && selectedMedia.dimensions.width > 0 && (
                  <div>
                    <span className="text-gray-400">Dimensions:</span>
                    <span className="ml-2">{selectedMedia.dimensions.width} × {selectedMedia.dimensions.height}</span>
                  </div>
                )}
                {selectedMedia.duration && (
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <span className="ml-2">{selectedMedia.duration}s</span>
                  </div>
                )}
              </div>
              
              {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                <div>
                  <span className="text-gray-400">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMedia.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-purple-600/30 text-purple-200 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <span className="text-gray-400">Created:</span>
                <span className="ml-2">{new Date(selectedMedia.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => handleDownloadMedia(selectedMedia)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={() => {
                  setShowMediaModal(false);
                  handleEditMedia(selectedMedia);
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit/Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 