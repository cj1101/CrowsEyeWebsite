'use client';

import React, { useState } from 'react';
import { useMediaLibrary, MediaItem, Gallery } from '@/hooks/api/useMediaLibrary';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PhotoIcon, 
  TrashIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  FolderIcon,
  FolderPlusIcon,
  ListBulletIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  CheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface GalleryManagerProps {
  selectedMediaIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  className?: string;
}

type ViewMode = 'galleries' | 'media' | 'gallery-detail';

export default function GalleryManager({ 
  selectedMediaIds = [], 
  onSelectionChange,
  className = ''
}: GalleryManagerProps) {
  const { 
    media, 
    galleries, 
    loading, 
    createGallery, 
    addMediaToGallery, 
    removeMediaFromGallery, 
    refetch 
  } = useMediaLibrary();
  
  const [viewMode, setViewMode] = useState<ViewMode>('galleries');
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddToGalleryModal, setShowAddToGalleryModal] = useState(false);
  const [newGalleryName, setNewGalleryName] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [gridView, setGridView] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<string[]>(selectedMediaIds);
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingToGallery, setIsAddingToGallery] = useState(false);

  // Filter galleries based on search
  const filteredGalleries = galleries.filter(gallery =>
    gallery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (gallery.caption && gallery.caption.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter media based on search
  const filteredMedia = media.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateGallery = async () => {
    if (!newGalleryName.trim()) return;
    
    setIsCreating(true);
    try {
      const gallery = await createGallery(newGalleryName, newGalleryCaption);
      console.log('Gallery created:', gallery);
      
      // If we have selected media, add them to the new gallery
      if (selectedMedia.length > 0) {
        await addMediaToGallery(gallery.id, selectedMedia);
        setSelectedMedia([]);
        if (onSelectionChange) {
          onSelectionChange([]);
        }
      }
      
      setNewGalleryName('');
      setNewGalleryCaption('');
      setShowCreateModal(false);
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error('Failed to create gallery:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddToGallery = async (galleryId: string) => {
    if (selectedMedia.length === 0) return;
    
    setIsAddingToGallery(true);
    try {
      await addMediaToGallery(galleryId, selectedMedia);
      setSelectedMedia([]);
      if (onSelectionChange) {
        onSelectionChange([]);
      }
      setShowAddToGalleryModal(false);
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error('Failed to add media to gallery:', error);
    } finally {
      setIsAddingToGallery(false);
    }
  };

  const handleRemoveFromGallery = async (galleryId: string, mediaIds: string[]) => {
    try {
      await removeMediaFromGallery(galleryId, mediaIds);
      
      // Update selected gallery if it's currently viewed
      if (selectedGallery && selectedGallery.id === galleryId) {
        setSelectedGallery(prev => prev ? {
          ...prev,
          mediaItems: prev.mediaItems.filter(item => !mediaIds.includes(item.id))
        } : null);
      }
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error('Failed to remove media from gallery:', error);
    }
  };

  const toggleMediaSelection = (mediaId: string) => {
    const newSelection = selectedMedia.includes(mediaId)
      ? selectedMedia.filter(id => id !== mediaId)
      : [...selectedMedia, mediaId];
    
    setSelectedMedia(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  const MediaCard = ({ item, isSelected, onToggle, showCheckbox = true }: { 
    item: MediaItem; 
    isSelected: boolean; 
    onToggle: () => void;
    showCheckbox?: boolean;
  }) => (
    <div 
      className={`relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer group ${
        isSelected ? 'ring-2 ring-purple-500 bg-purple-500/10' : ''
      }`}
      onClick={onToggle}
    >
      {/* Media Preview */}
      <div className="aspect-video bg-gray-800 flex items-center justify-center overflow-hidden relative">
        {item.type === 'image' && item.url ? (
          <img 
            src={item.url} 
            alt={item.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder-image.jpg';
            }}
          />
        ) : item.type === 'video' && item.thumbnail ? (
          <img 
            src={item.thumbnail}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl text-gray-500">
            {item.type === 'image' ? '🖼️' : item.type === 'video' ? '🎥' : '🎵'}
          </div>
        )}
        
        {/* Selection Checkbox */}
        {showCheckbox && (
          <div className="absolute top-2 right-2">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-purple-500 border-purple-500' 
                : 'bg-black/50 border-white/50 group-hover:border-white'
            }`}>
              {isSelected && <CheckIcon className="h-4 w-4 text-white" />}
            </div>
          </div>
        )}
      </div>
      
      {/* Media Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400 capitalize">{item.type}</span>
          <span className="text-xs text-gray-400">
            {(item.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
        {item.dimensions && (
          <div className="text-xs text-gray-500 mt-1">
            {item.dimensions.width} × {item.dimensions.height}
          </div>
        )}
      </div>
    </div>
  );

  const GalleryCard = ({ gallery }: { gallery: Gallery }) => (
    <div 
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group"
      onClick={() => {
        setSelectedGallery(gallery);
        setViewMode('gallery-detail');
      }}
    >
      {/* Gallery Preview */}
      <div className="aspect-video bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
        {gallery.mediaItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 w-full h-full">
            {gallery.mediaItems.slice(0, 4).map((item, index) => (
              <div key={item.id} className="relative overflow-hidden">
                {item.type === 'image' && item.url ? (
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                ) : item.type === 'video' && item.thumbnail ? (
                  <img 
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-2xl">
                      {item.type === 'image' ? '🖼️' : item.type === 'video' ? '🎥' : '🎵'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-6xl text-gray-600">
            <FolderIcon className="h-16 w-16" />
          </div>
        )}
      </div>
      
      {/* Gallery Info */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">{gallery.name}</h3>
        {gallery.caption && (
          <p className="text-sm text-gray-400 mb-2 line-clamp-2">{gallery.caption}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {gallery.mediaItems.length} {gallery.mediaItems.length === 1 ? 'item' : 'items'}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(gallery.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {viewMode === 'gallery-detail' && (
            <Button
              variant="ghost"
              onClick={() => {
                setViewMode('galleries');
                setSelectedGallery(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              ← Back to Galleries
            </Button>
          )}
          <h2 className="text-2xl font-bold text-white">
            {viewMode === 'galleries' ? 'Media Galleries' : 
             viewMode === 'media' ? 'Media Library' :
             selectedGallery?.name || 'Gallery'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/5 rounded-lg p-1">
            <Button
              variant={viewMode === 'galleries' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('galleries')}
              className="h-8 px-3"
            >
              <FolderIcon className="h-4 w-4 mr-1" />
              Galleries
            </Button>
            <Button
              variant={viewMode === 'media' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('media')}
              className="h-8 px-3"
            >
              <PhotoIcon className="h-4 w-4 mr-1" />
              Media
            </Button>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center bg-white/5 rounded-lg p-1">
            <Button
              variant={gridView ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setGridView(true)}
              className="h-8 w-8 p-0"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </Button>
            <Button
              variant={!gridView ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setGridView(false)}
              className="h-8 w-8 p-0"
            >
              <ListBulletIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Actions */}
          {viewMode === 'galleries' && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <FolderPlusIcon className="h-4 w-4 mr-2" />
              New Gallery
            </Button>
          )}
          
          {selectedMedia.length > 0 && (
            <Button
              onClick={() => setShowAddToGalleryModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowRightIcon className="h-4 w-4 mr-2" />
              Add to Gallery ({selectedMedia.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${viewMode === 'galleries' ? 'galleries' : 'media'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Content */}
      {viewMode === 'galleries' && (
        <div className={gridView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredGalleries.map((gallery) => (
            <GalleryCard key={gallery.id} gallery={gallery} />
          ))}
          {filteredGalleries.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FolderIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No galleries found</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Create Your First Gallery
              </Button>
            </div>
          )}
        </div>
      )}

      {viewMode === 'media' && (
        <div className={gridView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
          {filteredMedia.map((item) => (
            <MediaCard 
              key={item.id} 
              item={item} 
              isSelected={selectedMedia.includes(item.id)}
              onToggle={() => toggleMediaSelection(item.id)}
            />
          ))}
          {filteredMedia.length === 0 && (
            <div className="col-span-full text-center py-12">
              <PhotoIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No media found</p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'gallery-detail' && selectedGallery && (
        <div className="space-y-6">
          {/* Gallery Info */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{selectedGallery.name}</h3>
                {selectedGallery.caption && (
                  <p className="text-gray-400 mb-4">{selectedGallery.caption}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{selectedGallery.mediaItems.length} items</span>
                  <span>Created {new Date(selectedGallery.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Gallery Media */}
          <div className={gridView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
            {selectedGallery.mediaItems.map((item) => (
              <div key={item.id} className="relative group">
                <MediaCard 
                  item={item} 
                  isSelected={false}
                  onToggle={() => {}}
                  showCheckbox={false}
                />
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveFromGallery(selectedGallery.id, [item.id])}
                    className="h-6 w-6 p-0"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {selectedGallery.mediaItems.length === 0 && (
              <div className="col-span-full text-center py-12">
                <PhotoIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">This gallery is empty</p>
                <Button
                  onClick={() => setViewMode('media')}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  Add Media
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Gallery Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Create New Gallery</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gallery Name *
                  </label>
                  <input
                    type="text"
                    value={newGalleryName}
                    onChange={(e) => setNewGalleryName(e.target.value)}
                    placeholder="Enter gallery name"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newGalleryCaption}
                    onChange={(e) => setNewGalleryCaption(e.target.value)}
                    placeholder="Enter gallery description"
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                
                {selectedMedia.length > 0 && (
                  <div className="text-sm text-gray-400">
                    {selectedMedia.length} selected media will be added to this gallery
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateGallery}
                  disabled={!newGalleryName.trim() || isCreating}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isCreating ? 'Creating...' : 'Create Gallery'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add to Gallery Modal */}
      <AnimatePresence>
        {showAddToGalleryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Add {selectedMedia.length} Item{selectedMedia.length !== 1 ? 's' : ''} to Gallery
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddToGalleryModal(false)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {galleries.map((gallery) => (
                  <div
                    key={gallery.id}
                    onClick={() => handleAddToGallery(gallery.id)}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <h4 className="text-white font-medium">{gallery.name}</h4>
                      <p className="text-sm text-gray-400">
                        {gallery.mediaItems.length} items
                      </p>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
                {galleries.length === 0 && (
                  <div className="text-center py-8">
                    <FolderIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">No galleries available</p>
                    <Button
                      onClick={() => {
                        setShowAddToGalleryModal(false);
                        setShowCreateModal(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Create Gallery
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowAddToGalleryModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 