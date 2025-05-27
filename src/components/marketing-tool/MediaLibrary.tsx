'use client';

import React, { useState, useRef } from 'react';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  FolderIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  ShareIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  size: number;
  uploadDate: Date;
  caption?: string;
  tags: string[];
  isPostReady: boolean;
}

export default function MediaLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      type: 'image',
      url: '/api/placeholder/400/300',
      name: 'Summer Collection 1.jpg',
      size: 2048000,
      uploadDate: new Date('2024-01-15'),
      caption: 'Beautiful summer collection showcase',
      tags: ['summer', 'fashion', 'collection'],
      isPostReady: true
    },
    {
      id: '2',
      type: 'video',
      url: '/api/placeholder/400/300',
      name: 'Product Demo.mp4',
      size: 15728640,
      uploadDate: new Date('2024-01-14'),
      caption: 'Product demonstration video',
      tags: ['demo', 'product', 'tutorial'],
      isPostReady: false
    },
    {
      id: '3',
      type: 'image',
      url: '/api/placeholder/400/300',
      name: 'Brand Logo.png',
      size: 512000,
      uploadDate: new Date('2024-01-13'),
      tags: ['logo', 'brand', 'identity'],
      isPostReady: true
    }
  ]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', name: 'All Media', count: mediaItems.length },
    { id: 'images', name: 'Images', count: mediaItems.filter(item => item.type === 'image').length },
    { id: 'videos', name: 'Videos', count: mediaItems.filter(item => item.type === 'video').length },
    { id: 'post-ready', name: 'Post Ready', count: mediaItems.filter(item => item.isPostReady).length },
    { id: 'raw', name: 'Raw Media', count: mediaItems.filter(item => !item.isPostReady).length }
  ];

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' ||
                           (selectedCategory === 'images' && item.type === 'image') ||
                           (selectedCategory === 'videos' && item.type === 'video') ||
                           (selectedCategory === 'post-ready' && item.isPostReady) ||
                           (selectedCategory === 'raw' && !item.isPostReady);
    
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newItem: MediaItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          uploadDate: new Date(),
          tags: [],
          isPostReady: false
        };
        setMediaItems(prev => [newItem, ...prev]);
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const deleteSelectedItems = () => {
    setMediaItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Media Library</h2>
        <div className="flex items-center space-x-4">
          {selectedItems.length > 0 && (
            <button
              onClick={deleteSelectedItems}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete ({selectedItems.length})</span>
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <CloudArrowUpIcon className="h-4 w-4" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search media by name or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{category.name}</span>
              <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`relative group bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedItems.includes(item.id) ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => toggleItemSelection(item.id)}
          >
            {/* Media Preview */}
            <div className="aspect-square bg-gray-600 flex items-center justify-center">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : (
                <VideoCameraIcon className="h-12 w-12 text-gray-400" />
              )}
              <div className="hidden flex items-center justify-center w-full h-full">
                {item.type === 'image' ? (
                  <PhotoIcon className="h-12 w-12 text-gray-400" />
                ) : (
                  <VideoCameraIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex space-x-2">
                <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                  <EyeIcon className="h-4 w-4 text-white" />
                </button>
                <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                  <ShareIcon className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Status Badge */}
            {item.isPostReady && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Ready
              </div>
            )}

            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                selectedItems.includes(item.id)
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-gray-400 bg-transparent'
              }`}>
                {selectedItems.includes(item.id) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            {/* Media Info */}
            <div className="p-3">
              <h3 className="text-white text-sm font-medium truncate">{item.name}</h3>
              <p className="text-gray-400 text-xs">{formatFileSize(item.size)}</p>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-gray-400 text-xs">+{item.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No media found</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Upload some media to get started'}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Upload Media</span>
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
} 