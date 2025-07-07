'use client';

import React, { useState, useRef } from 'react';
import { MediaItem } from '@/hooks/api/useMediaLibrary';
import { 
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon,
  PlayIcon,
  MusicalNoteIcon,
  PlusIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface PostCreationDialogProps {
  mediaItem: MediaItem;
  onClose: () => void;
  onPostCreated: (postData: any) => void;
}

export default function PostCreationDialog({ mediaItem, onClose, onPostCreated }: PostCreationDialogProps) {
  const [caption, setCaption] = useState('');
  const [instructions, setInstructions] = useState('');
  const [editingInstructions, setEditingInstructions] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [generating, setGenerating] = useState(false);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatting options
  const [verticalOptimization, setVerticalOptimization] = useState(false);
  const [captionOverlay, setCaptionOverlay] = useState(false);
  const [captionPosition, setCaptionPosition] = useState('bottom');
  const [captionFontSize, setCaptionFontSize] = useState('medium');

  const platforms = [
    { id: 'instagram', name: 'Instagram', color: 'bg-purple-500', aspects: ['1:1', '4:5', '16:9'] },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', aspects: ['16:9', '1:1', '4:5'] },
    { id: 'bluesky', name: 'BlueSky', color: 'bg-sky-400', aspects: ['16:9', '1:1'] },
    { id: 'snapchat', name: 'Snapchat', color: 'bg-yellow-400', aspects: ['9:16', '1:1'] },
    { id: 'pinterest', name: 'Pinterest', color: 'bg-red-600', aspects: ['2:3', '1:1'] },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black', aspects: ['9:16', '1:1'] },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-500', aspects: ['16:9', '1:1'] },
  ];

  const handleGenerateContent = async () => {
    setGenerating(true);
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedCaption = `🎨 Stunning ${mediaItem.type} content for your social media! 

✨ ${instructions || 'Check out this amazing content that will captivate your audience'}

Perfect for ${selectedPlatforms.map(p => platforms.find(pl => pl.id === p)?.name).join(', ')}

#contentcreation #socialmedia #marketing ${mediaItem.tags.map(tag => `#${tag}`).join(' ')}`;

      setCaption(generatedCaption);
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddContextFile = () => {
    fileInputRef.current?.click();
  };

  const handleContextFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setContextFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeContextFile = (index: number) => {
    setContextFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleCreatePost = () => {
    const postData = {
      id: Date.now().toString(),
      mediaId: mediaItem.id,
      caption,
      instructions,
      editingInstructions,
      platforms: selectedPlatforms,
      formattingOptions: {
        verticalOptimization,
        captionOverlay,
        captionPosition,
        captionFontSize
      },
      contextFiles: contextFiles.map(f => f.name),
      status: 'draft'
    };

    onPostCreated(postData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Panel - Media Preview */}
          <div className="w-2/5 p-6 border-r border-gray-700">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Media Preview</h3>
              
              {/* Media Display */}
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                {mediaItem.type === 'image' ? (
                  <img src={mediaItem.url} alt={mediaItem.name} className="w-full h-full object-cover" />
                ) : mediaItem.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayIcon className="h-16 w-16 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MusicalNoteIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Media Info */}
              <div className="text-sm text-gray-300">
                <p><strong>File:</strong> {mediaItem.name}</p>
                <p><strong>Size:</strong> {(mediaItem.size / 1024).toFixed(1)} KB</p>
                <p><strong>Type:</strong> {mediaItem.type}</p>
              </div>

              {/* Formatting Options */}
              <div className="space-y-3">
                <h4 className="font-medium text-white">Formatting Options</h4>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={verticalOptimization}
                    onChange={(e) => setVerticalOptimization(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Vertical Optimization</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={captionOverlay}
                    onChange={(e) => setCaptionOverlay(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Caption Overlay</span>
                </label>

                {captionOverlay && (
                  <div className="space-y-2 ml-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={captionPosition}
                        onChange={(e) => setCaptionPosition(e.target.value)}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      >
                        <option value="bottom">Bottom</option>
                        <option value="top">Top</option>
                        <option value="center">Center</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                      <select
                        value={captionFontSize}
                        onChange={(e) => setCaptionFontSize(e.target.value)}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="extra_large">Extra Large</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Content Editing */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Target Platforms</h3>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformToggle(platform.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${platform.color}`}></div>
                        <span className="text-white font-medium">{platform.name}</span>
                      </div>
                      {selectedPlatforms.includes(platform.id) && (
                        <CheckIcon className="h-4 w-4 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe what kind of content you want to generate..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  rows={3}
                />
              </div>

              {/* Editing Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Media Editing Instructions
                </label>
                <textarea
                  value={editingInstructions}
                  onChange={(e) => setEditingInstructions(e.target.value)}
                  placeholder="Any specific editing instructions for the media..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  rows={2}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateContent}
                disabled={generating}
                className="w-full vision-button flex items-center justify-center"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                {generating ? 'Generating...' : 'Generate AI Content'}
              </button>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write your caption here or generate with AI..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  rows={6}
                />
              </div>

              {/* Context Files */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Context Files
                  </label>
                  <button
                    onClick={handleAddContextFile}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add File
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleContextFileUpload}
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx"
                />
                {contextFiles.length > 0 && (
                  <div className="space-y-2">
                    {contextFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <span className="text-sm text-gray-300">{file.name}</span>
                        <button
                          onClick={() => removeContextFile(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <div className="flex space-x-3">
            <button
              onClick={handleCreatePost}
              className="vision-button flex items-center"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Create Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 