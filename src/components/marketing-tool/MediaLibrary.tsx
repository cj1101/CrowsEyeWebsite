'use client';

import React, { useState, useEffect } from 'react';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  CloudArrowUpIcon,
  TrashIcon,
  EyeIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
  uploadedAt: string;
  tags: string[];
}

export default function MediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing-tool/media');
      if (response.ok) {
        const data = await response.json();
        setMediaFiles(data.media || []);
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // TODO: Implement actual file upload
    console.log('Files to upload:', files);
    alert('File upload functionality coming soon!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="h-8 w-8 text-blue-500" />;
      case 'video':
        return <VideoCameraIcon className="h-8 w-8 text-green-500" />;
      default:
        return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Media Library</h2>
        <label className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center space-x-2 transition-colors">
          <CloudArrowUpIcon className="h-5 w-5" />
          <span>Upload Files</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {mediaFiles.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No media files yet</h3>
          <p className="text-gray-400 mb-6">Upload your first image or video to get started</p>
          <label className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg cursor-pointer inline-flex items-center space-x-2 transition-colors">
            <CloudArrowUpIcon className="h-5 w-5" />
            <span>Upload Files</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mediaFiles.map((file) => (
            <div key={file.id} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-colors">
              <div className="flex items-center justify-between mb-3">
                {getFileIcon(file.type)}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedFile(file)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-red-400 transition-colors">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-white font-medium mb-2 truncate">{file.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{formatFileSize(file.size)}</p>
              <p className="text-gray-500 text-xs">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
              
              {file.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {file.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary-600/20 text-primary-300 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">{selectedFile.name}</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {selectedFile.type === 'image' ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-w-full max-h-96 object-contain mx-auto"
                />
              ) : selectedFile.type === 'video' ? (
                <video
                  src={selectedFile.url}
                  controls
                  className="max-w-full max-h-96 mx-auto"
                />
              ) : (
                <div className="text-center py-8">
                  <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">Preview not available for this file type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 