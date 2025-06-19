'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  PhotoIcon, 
  CloudArrowUpIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LinkIcon,
  FolderIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { CrowsEyeAPI, GooglePhotosAuth, GooglePhotosAlbum, GooglePhotosMediaItem } from '@/services/api';

interface GooglePhotosIntegrationProps {
  onMediaImported?: (mediaItems: any[]) => void;
}

export default function GooglePhotosIntegration({ onMediaImported }: GooglePhotosIntegrationProps) {
  const [api] = useState(() => new CrowsEyeAPI());
  const [authStatus, setAuthStatus] = useState<GooglePhotosAuth>({ isConnected: false });
  const [albums, setAlbums] = useState<GooglePhotosAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<GooglePhotosAlbum | null>(null);
  const [albumMedia, setAlbumMedia] = useState<GooglePhotosMediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GooglePhotosMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Load initial data
  useEffect(() => {
    loadAuthStatus();
  }, []);

  // Load albums when connected
  useEffect(() => {
    if (authStatus.isConnected) {
      loadAlbums();
    }
  }, [authStatus.isConnected]);

  const loadAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await api.getGooglePhotosStatus();
      setAuthStatus(response.data);
    } catch (error) {
      console.error('Failed to load Google Photos auth status:', error);
      setError('Failed to check connection status');
    } finally {
      setLoading(false);
    }
  };

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const response = await api.listGooglePhotosAlbums();
      setAlbums(response.data);
    } catch (error) {
      console.error('Failed to load albums:', error);
      setError('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const loadAlbumMedia = async (album: GooglePhotosAlbum) => {
    try {
      setLoading(true);
      setSelectedAlbum(album);
      const response = await api.getAlbumMedia(album.id);
      setAlbumMedia(response.data);
      setSelectedMedia(new Set());
    } catch (error) {
      console.error('Failed to load album media:', error);
      setError('Failed to load album media');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const response = await api.connectGooglePhotos();
      
      // Open OAuth popup
      const popup = window.open(
        response.data.authUrl,
        'google-photos-auth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      // Monitor for completion
      const pollTimer = setInterval(() => {
        try {
          if (popup?.closed) {
            clearInterval(pollTimer);
            // Refresh auth status
            loadAuthStatus();
          }
        } catch (error) {
          // Ignore cross-origin errors
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to initiate Google Photos connection:', error);
      setError('Failed to connect to Google Photos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await api.searchGooglePhotos(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelection = (mediaId: string) => {
    const newSelection = new Set(selectedMedia);
    if (newSelection.has(mediaId)) {
      newSelection.delete(mediaId);
    } else {
      newSelection.add(mediaId);
    }
    setSelectedMedia(newSelection);
  };

  const handleImport = async () => {
    if (!selectedAlbum || selectedMedia.size === 0) return;

    try {
      setImporting(true);
      setImportProgress(0);
      setShowImportDialog(true);

      const mediaIds = Array.from(selectedMedia);
      const response = await api.importFromGooglePhotos(selectedAlbum.id, mediaIds);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 1000);

      // Complete import
      setTimeout(() => {
        setImportProgress(100);
        clearInterval(progressInterval);
        setImporting(false);
        setShowImportDialog(false);
        setSelectedMedia(new Set());
        
        // Notify parent component
        if (onMediaImported) {
          const importedItems = albumMedia.filter(item => 
            selectedMedia.has(item.id)
          );
          onMediaImported(importedItems);
        }

        // Show success message
        setError(null);
      }, 2000);

    } catch (error) {
      console.error('Import failed:', error);
      setError('Import failed');
      setImporting(false);
      setShowImportDialog(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await api.syncGooglePhotos();
      await loadAuthStatus();
      await loadAlbums();
    } catch (error) {
      console.error('Sync failed:', error);
      setError('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (!authStatus.isConnected) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <PhotoIcon className="h-6 w-6 text-blue-400" />
            Google Photos Integration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Connect your Google Photos to import and manage your media library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PhotoIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Connect Google Photos</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Access your Google Photos albums, import media, and keep your content synchronized
            </p>
            <Button 
              onClick={handleConnect} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Connect to Google Photos
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircleIcon className="h-6 w-6 text-green-400" />
            Google Photos Connected
          </CardTitle>
          <CardDescription className="text-gray-400">
            Connected as {authStatus.userEmail} • {authStatus.albumCount} albums available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Last sync: {authStatus.lastSync ? new Date(authStatus.lastSync).toLocaleString() : 'Never'}
            </div>
            <Button 
              onClick={handleSync} 
              disabled={syncing}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {syncing ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value="albums" onValueChange={() => {}} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger value="albums" className="text-gray-300 data-[state=active]:text-white">
            Browse Albums
          </TabsTrigger>
          <TabsTrigger value="search" className="text-gray-300 data-[state=active]:text-white">
            Search Photos
          </TabsTrigger>
        </TabsList>

        {/* Albums Tab */}
        <TabsContent value="albums" className="space-y-6">
          {/* Albums Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((album) => (
              <Card 
                key={album.id}
                className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
                onClick={() => loadAlbumMedia(album)}
              >
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {album.coverPhotoUrl ? (
                      <img 
                        src={album.coverPhotoUrl} 
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FolderIcon className="h-12 w-12 text-gray-500" />
                    )}
                  </div>
                  <h3 className="font-medium text-white truncate">{album.title}</h3>
                  <p className="text-sm text-gray-400">{album.mediaItemsCount} items</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Album Media */}
          {selectedAlbum && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{selectedAlbum.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {selectedAlbum.mediaItemsCount} items • {selectedMedia.size} selected
                    </CardDescription>
                  </div>
                  {selectedMedia.size > 0 && (
                    <Button onClick={handleImport} disabled={importing}>
                      <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                      Import Selected ({selectedMedia.size})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {albumMedia.map((item) => (
                    <div 
                      key={item.id}
                      className={`relative aspect-square bg-gray-700 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                        selectedMedia.has(item.id) 
                          ? 'border-blue-500' 
                          : 'border-transparent hover:border-gray-600'
                      }`}
                      onClick={() => handleMediaSelection(item.id)}
                    >
                      <img 
                        src={item.baseUrl} 
                        alt={item.filename}
                        className="w-full h-full object-cover"
                      />
                      {item.mediaMetadata.video && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayIcon className="h-8 w-8 text-white drop-shadow-lg" />
                        </div>
                      )}
                      {selectedMedia.has(item.id) && (
                        <div className="absolute top-1 right-1">
                          <CheckCircleIcon className="h-5 w-5 text-blue-400 bg-white rounded-full" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                        <p className="text-xs text-white truncate">{item.filename}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Search Google Photos</CardTitle>
              <CardDescription className="text-gray-400">
                Use natural language to find specific photos and videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Search for photos (e.g., 'sunset', 'dogs', 'vacation 2023')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Search Results</CardTitle>
                <CardDescription className="text-gray-400">
                  Found {searchResults.length} items matching "{searchQuery}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {searchResults.map((item) => (
                    <div 
                      key={item.id}
                      className="relative aspect-square bg-gray-700 rounded-lg overflow-hidden"
                    >
                      <img 
                        src={item.baseUrl} 
                        alt={item.filename}
                        className="w-full h-full object-cover"
                      />
                      {item.mediaMetadata.video && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayIcon className="h-8 w-8 text-white drop-shadow-lg" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                        <p className="text-xs text-white truncate">{item.filename}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Import Progress Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Importing Media</DialogTitle>
            <DialogDescription className="text-gray-400">
              Importing {selectedMedia.size} items from "{selectedAlbum?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Progress value={importProgress} className="w-full" />
            <div className="text-center">
              <p className="text-sm text-gray-400">
                {importProgress < 100 ? 'Processing...' : 'Import completed!'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-300 text-sm">{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 