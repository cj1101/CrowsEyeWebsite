'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useMediaLibrary } from '@/hooks/api/useMediaLibrary';
import type { MediaItem } from '@/types/api';
import MediaUpload from '@/components/media/MediaUpload';
import GalleryManager from '@/components/media/GalleryManager';
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
  PlayIcon,
  FolderIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';

type DashboardMode = 'completed' | 'unedited';

function LibraryTabContent() {
  const router = useRouter();
  const { 
    media, 
    galleries, 
    loading, 
    error: mediaError, 
    uploadMedia, 
    deleteMedia, 
    fetchMedia 
  } = useMediaLibrary();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as DashboardMode) || 'completed';

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'galleries'>('library');
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>(initialMode);

  // Media fetch error from the useMediaLibrary hook – keep the descriptive name to avoid shadowing
  const mediaFetchError = mediaError;

  // Debug: Log media changes
  React.useEffect(() => {
    console.log('Media library updated:', media.length, 'items');
    console.log('Media items:', media);
  }, [media]);

  // Filter content based on dashboard mode
  const filteredAllContent = useMemo(() => {
    console.log('🔍 Filtering content for mode:', dashboardMode);
    console.log('📊 All media items:', media.length);
    
    const filtered = media.filter((item) => {
      // Updated logic to work with new unified MediaItem interface
      const isCompleted = item.status === 'published' || 
                         item.isPostReady === true ||
                         (item.tags && item.tags.includes('completed-post')) ||
                         (item.aiTags && item.aiTags.some(tag => 
                           typeof tag === 'string' ? tag.includes('completed-post') : tag.tag.includes('completed-post')
                         )) ||
                         (item.tags && item.tags.includes('library')) ||
                         item.isProcessed;
      
      const hasContent = !!(item.caption || item.description);
      
      console.log(`📝 Item ${item.id} (${item.filename || 'unnamed'}):`, {
        isPostReady: item.isPostReady,
        status: item.status,
        isProcessed: item.isProcessed,
        tags: item.tags,
        aiTags: item.aiTags,
        hasContent,
        caption: item.caption,
        description: item.description,
        categorizedAs: isCompleted ? 'completed' : 'unedited',
        shouldShow: dashboardMode === 'completed' ? isCompleted : !isCompleted
      });

      if (dashboardMode === 'completed') {
        // Show items that are marked as completed posts (status='completed' or is_post_ready=true)
        return isCompleted;
      } else {
        // Show unedited/raw media (not completed posts)
        return !isCompleted;
      }
    });
    
    console.log(`📋 Filtered ${filtered.length} items for ${dashboardMode} mode`);
    return filtered;
  }, [media, dashboardMode]);

  // Apply search filter to the already categorized content
  const searchFilteredContent = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredAllContent;
    }
    
    return filteredAllContent.filter((item: MediaItem) =>
      (item.filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.aiTags && item.aiTags.some(tag => 
        (typeof tag === 'string' ? tag : tag.tag).toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
  }, [filteredAllContent, searchQuery]);

  // Split search-filtered content into video and other content
  const filteredVideoContent = searchFilteredContent.filter((item: MediaItem) => 
    item.type === 'video' || item.subtype === 'reel' || item.subtype === 'short'
  );

  const filteredOtherContent = searchFilteredContent.filter((item: MediaItem) => 
    item.type !== 'video' && item.subtype !== 'reel' && item.subtype !== 'short'
  );

  const handleUpload = async (files: File[]) => {
    try {
      console.log('👀 Auth UID at upload call →', auth.currentUser?.uid);

      // Diagnostic: verify single Firebase app instance
      try {
        const { getApps } = await import('firebase/app');
        const apps = getApps();
        console.log(`🔍 Firebase apps count = ${apps.length} (should be 1)`, apps.map(a => a.name));
      } catch (err) {
        console.warn('⚠️ Could not get Firebase apps list:', err);
      }

      if (!auth.currentUser) {
        console.error('🚫 Upload attempted without authenticated user');
        alert('Please sign in before uploading files.');
        return;
      }

      console.log('Starting upload of', files.length, 'files');
      
      // Upload all files at once
      console.log('Uploading files:', files.map(f => f.name));
      await uploadMedia(files);
      
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

  const MediaCard = ({ item }: { item: MediaItem }) => {
    const [imageError, setImageError] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Debug logging for media URLs
    useEffect(() => {
      console.log('🖼️ MediaCard for item:', {
        id: item.id,
        name: item.name,
        type: item.type,
        url: item.url,
        thumbnail: item.thumbnail,
        gcs_path: item.gcs_path,
        filename: item.filename
      });
    }, [item]);

    return (
      <div 
        key={item.id} 
        className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group ${
          selectedItems.includes(item.id) ? 'ring-2 ring-purple-500 bg-purple-500/10' : ''
        }`}
        onClick={() => toggleSelection(item.id)}
      >
        {/* Media Preview */}
        <div className="aspect-video bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
          {/* Debug info overlay in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-0 left-0 bg-black/80 text-white text-xs p-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity max-w-full">
              <div>ID: {item.id}</div>
              <div>URL: {item.url?.substring(0, 50)}...</div>
              {imageError && <div className="text-red-400">Error: {imageError}</div>}
            </div>
          )}

          {item.type === 'image' && (item.url || item.thumbnail) ? (
            <>
              {(() => {
                const rawUrl = (item.url && item.url !== '#' ? item.url : undefined) || item.thumbnail;
                const displayUrl = rawUrl && rawUrl !== '#' ? rawUrl : '/images/placeholder-image.jpg';
                return (
                  <img
                    src={displayUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onLoad={() => {
                      console.log('✅ Image loaded successfully for:', item.name);
                      setImageLoaded(true);
                      setImageError(null);
                    }}
                    onError={(e) => {
                      const error = `Failed to load image: ${displayUrl}`;
                      console.error('❌ Image load error for:', item.name, error);
                      setImageError(error);
                      setImageLoaded(false);
                      (e.target as HTMLImageElement).src = '/images/placeholder-image.jpg';
                    }}
                  />
                );
              })()}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </>
          ) : (item.type === 'video' || item.subtype === 'reel' || item.subtype === 'short') && item.thumbnail ? (
            <>
              <img 
                src={item.thumbnail}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onLoad={() => {
                  console.log('✅ Thumbnail loaded successfully for:', item.name);
                }}
                onError={(e) => {
                  console.error('❌ Thumbnail load error for:', item.name, item.thumbnail);
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
                onLoadedData={() => {
                  console.log('✅ Video loaded successfully for:', item.name);
                }}
                onError={(e) => {
                  console.error('❌ Video load error for:', item.name, item.url);
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
              <img 
                src={item.thumbnail} 
                alt={item.name} 
                className="w-full h-full object-cover"
                onLoad={() => {
                  console.log('✅ Fallback thumbnail loaded for:', item.name);
                }}
                onError={(e) => {
                  console.error('❌ Fallback thumbnail error for:', item.name, item.thumbnail);
                  (e.target as HTMLImageElement).src = '/images/video-thumb.jpg';
                }}
              />
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

        {/* Action buttons overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewMedia(item);
            }}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
            title={dashboardMode === 'completed' ? 'Preview Post' : 'View Media'}
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          
          {/* Generate thumbnail button for placeholder thumbnails */}
          {(item.thumbnail === '/images/placeholder-image.jpg' || 
            item.thumbnail === '/static/img/placeholder-image.jpg' ||
            item.thumbnail_url === '/images/placeholder-image.jpg' || 
            item.thumbnail_url === '/static/img/placeholder-image.jpg') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateThumbnail(item);
              }}
              className="bg-yellow-500/20 backdrop-blur-sm hover:bg-yellow-500/40 text-yellow-300 p-2 rounded-lg transition-colors"
              title="Generate Thumbnail"
            >
              <PhotoIcon className="h-4 w-4" />
            </button>
          )}
          
          {dashboardMode === 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const caption = item.caption || item.description || '';
                const hashtags = item.ai_tags?.filter(tag => tag.startsWith('#')).join(' ') || '';
                const content = `${caption}${hashtags ? '\n\n' + hashtags : ''}`;
                navigator.clipboard.writeText(content);
                // Could add toast notification here
              }}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
              title="Copy Caption & Hashtags"
            >
              <DocumentCheckIcon className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadMedia(item);
            }}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
            title="Download"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMedia(item);
            }}
            className="bg-red-500/20 backdrop-blur-sm hover:bg-red-500/40 text-red-300 p-2 rounded-lg transition-colors"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

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

  const handleGenerateThumbnail = async (item: MediaItem) => {
    try {
      console.log('🎬 Generating thumbnail for:', item.name);
      // TODO: Implement thumbnail generation API call
      // This could call a backend endpoint that generates a proper thumbnail
      // For now, show a placeholder message
      alert(`Thumbnail generation for "${item.name}" will be implemented soon. This feature will automatically generate a proper thumbnail for this media item.`);
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      alert('Failed to generate thumbnail. Please try again.');
    }
  };

  // Enhanced completed post preview modal
  const CompletedPostPreviewModal = ({ item, onClose }: { item: MediaItem | null; onClose: () => void }) => {
    if (!item) return null;

    // Extract post metadata - updated for new backend structure
    const caption = item.caption || item.description || '';
    const hashtags = item.ai_tags?.filter(tag => tag.startsWith('#')) || [];
    const regularTags = item.ai_tags?.filter(tag => !tag.startsWith('#')) || [];
    const postMetadata = item.post_metadata || {};
    
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-600 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">Completed Post Preview</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Media Preview */}
            <div className="rounded-xl overflow-hidden bg-gray-800">
              {item.type === 'image' ? (
                <img 
                  src={item.url} 
                  alt={item.name} 
                  className="w-full max-h-96 object-contain"
                />
              ) : item.type === 'video' ? (
                <video 
                  src={item.url} 
                  controls 
                  className="w-full max-h-96"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-white">
                  <MusicalNoteIcon className="h-16 w-16 text-gray-400" />
                  <span className="ml-2">Audio File: {item.name}</span>
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <DocumentCheckIcon className="h-5 w-5 text-green-400" />
                Post Caption & Content
              </h4>
              
              {caption ? (
                <div className="text-white whitespace-pre-wrap bg-gray-700/30 rounded p-3">
                  {caption}
                </div>
              ) : (
                <div className="text-gray-400 italic">No caption provided</div>
              )}

              {/* Hashtags */}
              {hashtags.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-blue-400 font-medium text-sm">Hashtags:</h5>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Tags */}
              {regularTags.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-purple-400 font-medium text-sm">Tags:</h5>
                  <div className="flex flex-wrap gap-2">
                    {regularTags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Post Metadata */}
            <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
              <h4 className="text-white font-medium">Post Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">File Name:</span>
                  <span className="text-white ml-2">{item.name}</span>
                </div>
                
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white ml-2">{(item.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                
                {item.dimensions && (
                  <div>
                    <span className="text-gray-400">Dimensions:</span>
                    <span className="text-white ml-2">{item.dimensions.width} × {item.dimensions.height}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white ml-2">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => handleDownloadMedia(item)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </Button>
              
              <Button
                onClick={() => handleEditMedia(item)}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Post
              </Button>
              
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${caption}\n\n${hashtags.join(' ')}`);
                  // Could add a toast notification here
                }}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
              >
                Copy Caption
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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
      {/* Tab Navigation */}
      <div className="flex items-center bg-white/5 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'library' 
              ? 'bg-purple-500 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <PhotoIcon className="h-4 w-4 inline mr-2" />
          Media Library
        </button>
        <button
          onClick={() => setActiveTab('galleries')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'galleries' 
              ? 'bg-purple-500 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <FolderIcon className="h-4 w-4 inline mr-2" />
          Gallery Manager
        </button>
      </div>

      {/* Gallery Manager View */}
      {activeTab === 'galleries' && (
        <GalleryManager 
          selectedMediaIds={selectedItems}
          onSelectionChange={setSelectedItems}
        />
      )}

      {/* Traditional Library View */}
      {activeTab === 'library' && (
        <>
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
              Total: {searchFilteredContent.length} items • Videos: {filteredVideoContent.length} • Other: {filteredOtherContent.length}
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
        {searchFilteredContent.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">
              {dashboardMode === 'completed' ? '📝' : '📁'}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {dashboardMode === 'completed' ? 'No Completed Posts' : 'No Media Files'}
            </h3>
            <p className="text-gray-400 mb-6">
              {dashboardMode === 'completed' 
                ? 'Create posts in the Create tab and add them to your library to see them here.'
                : 'Upload some media files to get started with your content creation.'
              }
            </p>
            {dashboardMode === 'unedited' && (
              <Button onClick={() => setShowUploadModal(true)} className="bg-purple-600 hover:bg-purple-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Content Display */}
            {dashboardMode === 'completed' ? (
              // Show all completed posts in a unified grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {searchFilteredContent.map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              // Show unedited content split by type
              <>
                {/* Video Content Section */}
                {filteredVideoContent.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <VideoCameraIcon className="h-5 w-5 mr-2" />
                      Video Content ({filteredVideoContent.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {filteredVideoContent.map((item) => (
                        <MediaCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Content Section */}
                {filteredOtherContent.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <PhotoIcon className="h-5 w-5 mr-2" />
                      Images & Audio ({filteredOtherContent.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {filteredOtherContent.map((item) => (
                        <MediaCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      
      </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
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
              key={dashboardMode}
              onUpload={handleUpload}
              multiple={true}
              className="text-white"
            />
          </div>
        </div>
      )}

      {/* AI Processing Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-auto">
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
            <div className="text-center text-xs text-gray-400 mt-2">
              Cost: $0.10 or 10 AI Credits per item
            </div>
          </div>
        </div>
      )}

      {/* Media View Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white truncate pr-4">{selectedMedia.name}</h3>
              <button
                onClick={() => setShowMediaModal(false)}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Media Display */}
            <div className="bg-gray-900 rounded-lg p-2 sm:p-4 mb-4">
              {selectedMedia.type === 'image' && selectedMedia.url ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="w-full h-auto max-h-[60vh] object-contain rounded"
                  onError={(e) => {
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
                >
                  Your browser does not support the video tag.
                </video>
              ) : selectedMedia.type === 'audio' && selectedMedia.url ? (
                <audio
                  src={selectedMedia.url}
                  controls
                  preload="metadata"
                  className="w-full"
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

            {/* Post Preview for completed items */}
            {dashboardMode === 'completed' && (
              <div className="bg-gray-700/40 rounded-lg p-4 mb-4 text-white text-sm whitespace-pre-wrap">
                {selectedMedia.description || 'No caption available.'}
                {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                  <div className="mt-2 text-blue-400 text-sm">
                    {selectedMedia.tags.map((tag: string) => `#${tag}`).join(' ')}
                  </div>
                )}
              </div>
            )}

            {/* Media Info */}
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="flex flex-wrap justify-end gap-3 mt-6">
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

      {/* Completed Post Preview Modal */}
      {showMediaModal && dashboardMode === 'completed' && (
        <CompletedPostPreviewModal
          item={selectedMedia}
          onClose={() => setShowMediaModal(false)}
        />
      )}
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function LibraryTab() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    }>
      <LibraryTabContent />
    </Suspense>
  );
} 