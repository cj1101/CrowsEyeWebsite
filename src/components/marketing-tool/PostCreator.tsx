'use client';

import React, { useState, useRef } from 'react';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  PaintBrushIcon,
  SparklesIcon,
  CloudArrowUpIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ShareIcon,
  DocumentTextIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import FeatureGate from '@/components/FeatureGate';
import { useUsageTracking } from '@/hooks/useUsageTracking';

interface MediaFile {
  file: File;
  url: string;
  type: 'image' | 'video';
}

export default function PostCreator() {
  const { trackUsage } = useUsageTracking();
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [caption, setCaption] = useState('');
  const [instructions, setInstructions] = useState('');
  const [photoEditInstructions, setPhotoEditInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const mediaFile: MediaFile = {
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image'
      };
      setSelectedMedia(mediaFile);
    }
  };

  const generateCaption = async () => {
    if (!selectedMedia && !instructions) return;
    
    // Track AI credit usage
    const result = await trackUsage('ai_credits', 1);
    if (!result.success) {
      alert(result.message || 'Unable to generate caption - usage limit reached');
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI caption generation
    setTimeout(() => {
      const sampleCaptions = [
        "✨ Discover the magic in everyday moments! This stunning visual captures the essence of creativity and inspiration. What story does it tell you? 🎨 #CreativeLife #Inspiration #ArtisticVision",
        "🌟 Behind every great post is a vision waiting to be shared. This image speaks volumes about the power of visual storytelling. Ready to make your mark? 📸 #VisualStorytelling #ContentCreation #BrandStory",
        "💫 Sometimes the most powerful messages come through visuals. This piece embodies the perfect blend of artistry and meaning. What's your interpretation? 🎭 #ArtisticExpression #VisualArt #CreativeContent"
      ];
      
      const randomCaption = sampleCaptions[Math.floor(Math.random() * sampleCaptions.length)];
      setCaption(randomCaption);
      setIsGenerating(false);
    }, 2000);
  };

  const applyPhotoEdits = async () => {
    if (!selectedMedia || !photoEditInstructions) return;
    
    // Track AI edit usage
    const result = await trackUsage('ai_edits', 1);
    if (!result.success) {
      alert(result.message || 'Unable to apply edits - usage limit reached');
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate photo editing
    setTimeout(() => {
      // In a real implementation, this would apply AI-powered photo edits
      console.log('Applying photo edits:', photoEditInstructions);
      setIsGenerating(false);
    }, 3000);
  };

  const formatPost = (type: 'story' | 'carousel' | 'reel') => {
    console.log(`Formatting post as ${type}`);
    // Implementation for different post formats
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Create Post</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Media Upload and Preview */}
        <div className="space-y-6">
          {/* Media Upload */}
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Media Upload</h3>
            
            {!selectedMedia ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
              >
                <CloudArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Click to upload media</p>
                <p className="text-gray-500 text-sm">Supports images and videos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Media Preview */}
                <div className="relative bg-gray-600 rounded-lg overflow-hidden">
                  {selectedMedia.type === 'image' ? (
                    <img
                      src={selectedMedia.url}
                      alt="Selected media"
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center">
                      <VideoCameraIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Media Actions */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <PhotoIcon className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Media Info */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{selectedMedia.file.name}</span>
                  <span>{(selectedMedia.file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>

                {/* Format Options */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => formatPost('story')}
                    className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Story Format
                  </button>
                  <button
                    onClick={() => formatPost('carousel')}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Carousel
                  </button>
                  <button
                    onClick={() => formatPost('reel')}
                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Reel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Photo Editing */}
          {selectedMedia?.type === 'image' && (
            <FeatureGate feature="ai_edits" requiredTier="creator">
              <div className="bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">AI Photo Editing</h3>
                <div className="space-y-4">
                  <textarea
                    value={photoEditInstructions}
                    onChange={(e) => setPhotoEditInstructions(e.target.value)}
                    placeholder="Describe how you want to edit this photo... (e.g., 'Make it brighter and add a vintage filter', 'Remove the background', 'Enhance colors')"
                    className="w-full h-24 p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={applyPhotoEdits}
                    disabled={!photoEditInstructions || isGenerating}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Applying Edits...</span>
                      </>
                    ) : (
                      <>
                        <PaintBrushIcon className="h-4 w-4" />
                        <span>Apply AI Edits</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </FeatureGate>
          )}
        </div>

        {/* Right Column - Content Generation */}
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Content Instructions</h3>
            <div className="space-y-4">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Describe what you want to communicate... (e.g., 'Create an engaging post about our new product launch', 'Write something inspirational about creativity')"
                className="w-full h-32 p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              
              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Product showcase',
                  'Behind the scenes',
                  'Inspirational quote',
                  'Tutorial content',
                  'Brand story'
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setInstructions(prompt)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 text-sm rounded-full transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Caption Generation */}
          <FeatureGate feature="ai_credits" requiredTier="spark">
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">AI Caption Generation</h3>
              <div className="space-y-4">
                <button
                  onClick={generateCaption}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating Caption...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5" />
                      <span>Generate AI Caption</span>
                    </>
                  )}
                </button>

                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Your generated caption will appear here, or write your own..."
                  className="w-full h-40 p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                {/* Caption Tools */}
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors">
                    <AdjustmentsHorizontalIcon className="h-4 w-4" />
                    <span>Tone</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>Length</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors">
                    <MicrophoneIcon className="h-4 w-4" />
                    <span>Voice</span>
                  </button>
                </div>
              </div>
            </div>
          </FeatureGate>

          {/* Post Actions */}
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Post Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <ShareIcon className="h-4 w-4" />
                <span>Publish Now</span>
              </button>
              <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <span>Schedule</span>
              </button>
              <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors">
                <span>Save Draft</span>
              </button>
              <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                <span>Add to Library</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
} 