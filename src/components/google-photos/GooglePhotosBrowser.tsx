'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  PhotoIcon, 
  VideoCameraIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  FolderIcon,
  PlayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface GooglePhotosAlbum {
  id: string;
  title: string;
  productUrl: string;
  coverPhotoUrl?: string;
  mediaItemsCount: number;
  isWriteable: boolean;
}

interface GooglePhotosMediaItem {
  id: string;
  filename: string;
  mimeType: string;
  baseUrl: string;
  productUrl: string;
  description?: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
    photo?: any;
    video?: any;
  };
}

interface GooglePhotosBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (items: GooglePhotosMediaItem[]) => void;
}

export default function GooglePhotosBrowser({ isOpen, onClose, onImportComplete }: GooglePhotosBrowserProps) {
  const [albums, setAlbums] = useState<GooglePhotosAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<GooglePhotosAlbum | null>(null);
  const [albumMedia, setAlbumMedia] = useState<GooglePhotosMediaItem[]>([]);
  const [recentMedia, setRecentMedia] = useState<GooglePhotosMediaItem[]>([]);
  const [searchResults, setSearchResults] = useState<GooglePhotosMediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('albums');

  // Load initial data when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadAlbums(),
        loadRecentMedia()
      ]);
    } catch (error) {
      console.error('Failed to load Google Photos data:', error);
      setError('Failed to load Google Photos data');
    } finally {
      setLoading(false);
    }
  };

  const loadAlbums = async () => {
    try {
      const response = await fetch('/api/google-photos/albums');
      if (!response.ok) throw new Error('Failed to load albums');
      
      const data = await response.json();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error('Failed to load albums:', error);
      throw error;
    }
  };

  const loadRecentMedia = async () => {
    try {
      const response = await fetch('/api/google-photos/media?pageSize=50');
      if (!response.ok) throw new Error('Failed to load recent media');
      
      const data = await response.json();
      setRecentMedia(data.mediaItems || []);
    } catch (error) {
      console.error('Failed to load recent media:', error);
      throw error;
    }
  };

  const loadAlbumMedia = async (album: GooglePhotosAlbum) => {
    setLoading(true);
    setSelectedAlbum(album);
    
    try {
      const response = await fetch(`/api/google-photos/media?albumId=${album.id}&pageSize=100`);
      if (!response.ok) throw new Error('Failed to load album media');
      
      const data = await response.json();
      setAlbumMedia(data.mediaItems || []);
      setActiveTab('album-media');
    } catch (error) {
      console.error('Failed to load album media:', error);
      setError('Failed to load album media');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/google-photos/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, pageSize: 50 })
      });
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data.mediaItems || []);
      setActiveTab('search');
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const selectAll = (items: GooglePhotosMediaItem[]) => {
    const newSelection = new Set(selectedItems);
    items.forEach(item => newSelection.add(item.id));
    setSelectedItems(newSelection);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleImport = async () => {
    if (selectedItems.size === 0) return;
    
    setImporting(true);
    setImportProgress(0);
    
    try {
      const response = await fetch('/api/google-photos/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mediaIds: Array.from(selectedItems),
          albumId: selectedAlbum?.id 
        })
      });
      
      if (!response.ok) throw new Error('Import failed');
      
      const result = await response.json();
      setImportProgress(100);
      
      // Get imported items for callback
      const importedItems = getCurrentMediaItems().filter(item => 
        selectedItems.has(item.id)
      );
      
      if (onImportComplete) {
        onImportComplete(importedItems);
      }
      
      // Clear selection and close
      setSelectedItems(new Set());
      onClose();
      
    } catch (error) {
      console.error('Import failed:', error);
      setError('Import failed');
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const getCurrentMediaItems = (): GooglePhotosMediaItem[] => {
    switch (activeTab) {
      case 'albums':
        return [];
      case 'recent':
        return recentMedia;
      case 'album-media':
        return albumMedia;
      case 'search':
        return searchResults;
      default:
        return [];
    }
  };

  const renderMediaGrid = (items: GooglePhotosMediaItem[]) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <PhotoIcon className="h-12 w-12 mb-2" />
          <p>No media found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedItems.has(item.id) ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'
            }`}
            onClick={() => toggleItemSelection(item.id)}
          >
            <div className="aspect-square relative">
              <img
                src={`${item.baseUrl}=w300-h300-c`}
                alt={item.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {item.mimeType.startsWith('video/') && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <PlayIcon className="h-8 w-8 text-white" />
                </div>
              )}
              {selectedItems.has(item.id) && (
                <div className="absolute top-2 right-2">
                  <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {item.filename}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.mediaMetadata.creationTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">📷</span>
            <span>Google Photos Browser</span>
          </DialogTitle>
          <DialogDescription>
            Browse and import photos and videos from your Google Photos library
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-300 hover:text-red-100"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
                <TabsTrigger value="albums">Albums</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="search">Search</TabsTrigger>
                {selectedAlbum && (
                  <TabsTrigger value="album-media">{selectedAlbum.title}</TabsTrigger>
                )}
              </TabsList>

              {loading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>

            <TabsContent value="albums" className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => loadAlbumMedia(album)}
                  >
                    <div className="aspect-video relative bg-gray-100 dark:bg-gray-700">
                      {album.coverPhotoUrl ? (
                        <img
                          src={album.coverPhotoUrl}
                          alt={album.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {album.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {album.mediaItemsCount} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="flex-1 overflow-auto">
              {renderMediaGrid(recentMedia)}
            </TabsContent>

            <TabsContent value="search" className="flex-1 flex flex-col">
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Search photos and videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                {renderMediaGrid(searchResults)}
              </div>
            </TabsContent>

            {selectedAlbum && (
              <TabsContent value="album-media" className="flex-1 overflow-auto">
                {renderMediaGrid(albumMedia)}
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Selection and Import Controls */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedItems.size} selected
              </span>
              {selectedItems.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              )}
              {getCurrentMediaItems().length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectAll(getCurrentMediaItems())}
                >
                  Select All
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={selectedItems.size === 0 || importing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {importing ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${selectedItems.size} items`
                )}
              </Button>
            </div>
          </div>

          {importing && (
            <div className="mt-4">
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-gray-500 mt-2">
                Importing {selectedItems.size} items from Google Photos...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 