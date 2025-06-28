'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Send, 
  Eye,
  Hash,
  Users,
  Upload,
  X,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Copy,
  Download,
  Share2,
  Target,
  Palette,
  Type,
  Crop,
  Filter,
  Volume2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import MediaUpload from '@/components/media/MediaUpload';
import BrandIcon from '@/components/ui/brand-icons';
import { useMediaStore } from '@/stores/mediaStore';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  duration?: number;
  processing?: boolean;
  processed?: boolean;
}

interface PlatformOption {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  connected: boolean;
  characterLimit: number;
  features: {
    hashtags: boolean;
    location: boolean;
    mentions: boolean;
    scheduling: boolean;
    stories: boolean;
    multipleImages: boolean;
  };
}

const platforms: PlatformOption[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    color: 'from-purple-500 to-pink-500',
    enabled: false,
    connected: true,
    characterLimit: 2200,
    features: {
      hashtags: true,
      location: true,
      mentions: true,
      scheduling: true,
      stories: true,
      multipleImages: true
    }
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: 'from-blue-600 to-blue-700',
    enabled: false,
    connected: true,
    characterLimit: 63206,
    features: {
      hashtags: false,
      location: true,
      mentions: true,
      scheduling: true,
      stories: false,
      multipleImages: true
    }
  },
  {
    id: 'threads',
    name: 'Threads',
    color: 'from-gray-600 to-black',
    enabled: false,
    connected: true,
    characterLimit: 500,
    features: {
      hashtags: true,
      location: false,
      mentions: true,
      scheduling: true,
      stories: false,
      multipleImages: true
    }
  },
  {
    id: 'bluesky',
    name: 'BlueSky',
    color: 'from-blue-400 to-blue-500',
    enabled: false,
    connected: true,
    characterLimit: 300,
    features: {
      hashtags: true,
      location: false,
      mentions: true,
      scheduling: true,
      stories: false,
      multipleImages: true
    }
  },
  {
    id: 'google-mybusiness',
    name: 'Google My Business',
    color: 'from-blue-500 to-green-500',
    enabled: false,
    connected: true,
    characterLimit: 1500,
    features: {
      hashtags: false,
      location: true,
      mentions: false,
      scheduling: true,
      stories: false,
      multipleImages: false
    }
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: 'from-black to-gray-800',
    enabled: false,
    connected: true,
    characterLimit: 2200,
    features: {
      hashtags: true,
      location: false,
      mentions: false,
      scheduling: true,
      stories: false,
      multipleImages: false
    }
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: 'from-red-600 to-red-700',
    enabled: false,
    connected: true,
    characterLimit: 10000,
    features: {
      hashtags: true,
      location: false,
      mentions: false,
      scheduling: true,
      stories: false,
      multipleImages: false
    }
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: 'from-red-500 to-red-600',
    enabled: false,
    connected: true,
    characterLimit: 500,
    features: {
      hashtags: true,
      location: false,
      mentions: false,
      scheduling: true,
      stories: false,
      multipleImages: true
    }
  }
];

export default function CreatePostTab() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformOption[]>(platforms);
  const [postContent, setPostContent] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [useBranding, setUseBranding] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [contentType, setContentType] = useState<'single' | 'gallery'>('single');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLibrary, setShowLibrary] = useState(false);
  const { files: libraryFiles, addFiles } = useMediaStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brandProfile = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('crows_eye_brand_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => prev.map(platform => {
      if (platform.id === platformId && platform.connected) {
        return { ...platform, enabled: !platform.enabled };
      }
      return platform;
    }));
  };

  const handleMediaUpload = async (files: FileList | File[]) => {
    const newMediaFiles: MediaFile[] = [];
    
    const fileArray: File[] = Array.isArray(files) ? files as File[] : Array.from(files as FileList);
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const mediaFile: MediaFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'audio',
        url: URL.createObjectURL(file),
        processing: false,
        processed: false
      };
      
      if (file.type.startsWith('video/')) {
        // Get video duration and create thumbnail
        const video = document.createElement('video');
        video.src = mediaFile.url;
        video.onloadedmetadata = () => {
          mediaFile.duration = video.duration;
        };
      }
      
      newMediaFiles.push(mediaFile);
    }
    
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMediaFiles(prev => prev.filter(media => media.id !== mediaId));
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags(prev => [...prev, hashtagInput.trim()]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (hashtag: string) => {
    setHashtags(prev => prev.filter(h => h !== hashtag));
  };

  const handleGenerateAICaption = async () => {
    setIsGeneratingAI(true);

    try {
      /*
       * 🚧 Placeholder logic — replace with real backend call.
       * The payload now includes:
       *  - contextInput (user guidance)
       *  - an array describing each uploaded media file (type, duration, etc.)
       */
      const payload = {
        context: contextInput,
        media: mediaFiles.map((m) => ({
          id: m.id,
          type: m.type,
          duration: m.duration,
          filename: m.file?.name,
        })),
        branding: useBranding ? brandProfile : null,
      };

      console.log('[AI Caption] Request payload →', payload);

      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Naive mock: craft caption based on first media type
      let captionBase = 'Check this out!';
      if (payload.media.length) {
        const firstType = payload.media[0].type;
        if (firstType === 'video') captionBase = '🎥 New video drop!';
        if (firstType === 'image') captionBase = '📸 Sneak peek photo!';
        if (firstType === 'audio') captionBase = '🎶 Listen up!';
      }

      // Incorporate context if provided
      if (contextInput.trim()) captionBase = `${contextInput.trim()} — ${captionBase}`;

      // Add branding intro if toggled
      if (useBranding && brandProfile) {
        const intro = brandProfile.tagline || brandProfile.description || brandProfile.name;
        captionBase = `${intro ? intro + ' – ' : ''}${captionBase}`;
      }

      setPostContent(captionBase);

      // Simple hashtags: derive from context words
      let tags: string[] = [];
      if (contextInput) {
        tags = contextInput
          .split(/\s+/)
          .filter((w) => w.length > 3)
          .slice(0, 10)
          .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''));
      }

      if (tags.length === 0) {
        tags = ['SocialMedia', 'Update'];
      }

      setHashtags(tags);
    } catch (error) {
      console.error('Failed to generate AI caption:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handlePublish = async () => {
    const enabledPlatforms = selectedPlatforms.filter(p => p.enabled);
    
    if (enabledPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }
    
    if (!postContent.trim() && mediaFiles.length === 0) {
      alert('Please add content or media');
      return;
    }
    
    setIsPublishing(true);
    
    try {
      // Mock publishing process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Reset form
      setPostContent('');
      setHashtags([]);
      
      alert('Post published successfully!');
      
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert('Failed to publish post');
    } finally {
      setIsPublishing(false);
    }
  };

  const getCharacterCount = () => {
    const enabledPlatforms = selectedPlatforms.filter(p => p.enabled);
    if (enabledPlatforms.length === 0) return null;
    
    const minLimit = Math.min(...enabledPlatforms.map(p => p.characterLimit));
    const currentLength = postContent.length + hashtags.join(' #').length + (hashtags.length > 0 ? 1 : 0);
    
    return { current: currentLength, max: minLimit };
  };

  const characterCount = getCharacterCount();

  // Update content type when media changes
  useEffect(() => {
    if (mediaFiles.length > 1) {
      setContentType('gallery');
    } else {
      setContentType('single');
      setCurrentIndex(0);
    }
  }, [mediaFiles]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaFiles.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaFiles.length) % mediaFiles.length);
  };

  const handleAddFromLibrary = (fileId: string) => {
    const libFile = libraryFiles.find(f => f.id === fileId);
    if (!libFile) return;
    const newMedia: MediaFile = {
      id: libFile.id,
      file: new File([], libFile.name),
      type: libFile.type,
      url: libFile.url,
      thumbnail: libFile.preview,
      processed: true,
      processing: false
    } as any;
    setMediaFiles(prev => [...prev, newMedia]);
    setShowLibrary(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Create Post</h1>
          <p className="text-gray-400">Create and share content across your social platforms</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="border-gray-600"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Upload */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Media Upload
              </CardTitle>
              <CardDescription>Add images, videos, or audio. Posts with multiple files will become a gallery carousel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MediaUpload onUpload={(files) => handleMediaUpload(files)} />
              <Button variant="outline" className="border-gray-600 text-gray-300" onClick={() => setShowLibrary(true)}>
                <FolderOpen className="h-4 w-4 mr-2" /> Add from Media Library
              </Button>

              {/* Media Preview / Carousel */}
              {mediaFiles.length > 0 && (
                <div className="relative w-full max-w-lg mx-auto">
                  {contentType === 'gallery' && (
                    <>
                      <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/40 p-1 rounded-full">
                        <ChevronLeft className="h-5 w-5 text-white" />
                      </button>
                      <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/40 p-1 rounded-full">
                        <ChevronRight className="h-5 w-5 text-white" />
                      </button>
                    </>
                  )}

                  {mediaFiles[currentIndex] && (
                    <div className="rounded-lg overflow-hidden">
                      {mediaFiles[currentIndex].type === 'image' ? (
                        <img src={mediaFiles[currentIndex].url} alt="preview" className="w-full h-64 object-cover" />
                      ) : mediaFiles[currentIndex].type === 'video' ? (
                        <video src={mediaFiles[currentIndex].url} controls className="w-full h-64 object-cover" />
                      ) : (
                        <audio src={mediaFiles[currentIndex].url} controls className="w-full" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Select Platforms
              </CardTitle>
              <CardDescription>Choose where to publish your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedPlatforms.map((platform) => {
                  const uploadedTypes = new Set(mediaFiles.map(m => m.type));
                  const supportsAll = Array.from(uploadedTypes).every(t => (platform as any).acceptedMedia?.includes(t));
                  const galleryIncompatible = contentType === 'gallery' && !platform.features.multipleImages;
                  const disabled = !platform.connected || !supportsAll || galleryIncompatible;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => !disabled && handlePlatformToggle(platform.id)}
                      disabled={disabled}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-200 text-center
                        ${platform.enabled 
                          ? `border-blue-500 bg-blue-500/10` 
                          : `border-gray-600 hover:border-gray-500`
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="mb-2">
                        <BrandIcon platform={platform.id} size={32} className="text-white" />
                      </div>
                      <div className="text-sm font-medium text-white">{platform.name}</div>
                      <div className="text-xs text-gray-400">
                        {platform.connected ? 'Connected' : 'Not Connected'}
                      </div>
                      {platform.enabled && (
                        <Badge className="mt-2 bg-blue-500/20 text-blue-300">Selected</Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Content Creation */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Caption & Hashtag Generation
                </CardTitle>
                <div className="flex items-center space-x-4">
                  {/* Branding toggle */}
                  <label className="flex items-center gap-1 text-xs text-gray-300 select-none">
                    <input
                      type="checkbox"
                      checked={useBranding}
                      onChange={(e) => setUseBranding(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-500 rounded bg-gray-700 border-gray-600 focus:ring-blue-500" />
                    Use Brand Profile
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <textarea
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="Describe the context, target audience, tone, or any specifics you want the AI to consider when crafting your caption and hashtags..."
                  className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Generate Caption & Hashtags Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                onClick={handleGenerateAICaption}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Generate Caption & Hashtags'
                )}
              </Button>

              {/* Generated Caption Editor (always visible) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Generated Caption</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Your generated caption will appear here. Feel free to tweak it before publishing."
                  className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                />
                {characterCount && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      {characterCount.current}/{characterCount.max} characters
                    </span>
                    <div
                      className={`text-right ${
                        characterCount.current > characterCount.max ? 'text-red-400' : 'text-gray-400'
                      }`}
                    >
                      {characterCount.current > characterCount.max &&
                        'Exceeds limit for selected platforms'}
                    </div>
                  </div>
                )}
              </div>

              {/* Hashtags */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Hashtags</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddHashtag()}
                    placeholder="Enter hashtag"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <Button onClick={handleAddHashtag} size="sm" variant="outline" className="border-gray-600">
                    <Hash className="h-4 w-4" />
                  </Button>
                </div>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hashtags.map((hashtag) => (
                      <Badge
                        key={hashtag}
                        className="bg-blue-500/20 text-blue-300 border border-blue-500/30 cursor-pointer"
                        onClick={() => handleRemoveHashtag(hashtag)}
                      >
                        #{hashtag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar removed */}
      </div>

      {/* Publish & Preview controls */}
      <div className="pt-4 flex justify-center">
        <Button
          size="lg"
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
          onClick={() => setShowPreview((prev) => !prev)}
        >
          {showPreview ? 'Hide Preview' : 'Create Post Preview'}
        </Button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <Card className="bg-gray-800/50 border-gray-700 max-w-lg w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white text-lg">Post Preview</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mediaFiles.length > 0 && (
                <div className="w-full rounded overflow-hidden">
                  {contentType === 'gallery' ? (
                    <div className="relative">
                      {mediaFiles[currentIndex].type === 'image' ? (
                        <img src={mediaFiles[currentIndex].url} className="w-full object-contain" />
                      ) : (
                        <video src={mediaFiles[currentIndex].url} className="w-full" controls />
                      )}
                      {mediaFiles.length > 1 && (
                        <div className="absolute inset-0 flex justify-between items-center px-2">
                          <Button variant="ghost" size="icon" onClick={handlePrev}>
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleNext}>
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : mediaFiles[0].type === 'image' ? (
                    <img src={mediaFiles[0].url} className="w-full object-contain" />
                  ) : (
                    <video src={mediaFiles[0].url} className="w-full" controls />
                  )}
                </div>
              )}

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-white text-sm whitespace-pre-wrap">{postContent}</div>
                {hashtags.length > 0 && (
                  <div className="mt-2 text-blue-400 text-sm">
                    {hashtags.map((tag) => `#${tag}`).join(' ')}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full justify-center border-gray-600"
                onClick={() => {
                  if (mediaFiles.length === 0) return;
                  const mapped = mediaFiles.map((m) => ({
                    id: m.id,
                    name: m.file?.name || 'untitled',
                    type: m.type,
                    url: m.url,
                    preview: m.thumbnail || m.url,
                    size: m.file?.size || 0,
                    uploadedAt: new Date(),
                    tags: hashtags,
                    description: postContent,
                  }));
                  addFiles(mapped as any);
                }}
              >
                Add to Library
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Media Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Media Library</h3>
              <Button variant="outline" size="sm" onClick={() => setShowLibrary(false)}>Close</Button>
            </div>
            {libraryFiles.length === 0 ? (
              <p className="text-gray-400">No media in library.</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {libraryFiles.map((item) => (
                  <div key={item.id} className="cursor-pointer group" onClick={() => handleAddFromLibrary(item.id)}>
                    <div className="rounded-lg overflow-hidden border border-gray-600 group-hover:border-blue-500">
                      {item.type === 'image' ? (
                        <img src={item.preview || item.url} alt="" className="w-full h-32 object-cover" />
                      ) : item.type === 'video' ? (
                        <video src={item.url} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-gray-700 text-white text-sm">Audio</div>
                      )}
                    </div>
                    <p className="mt-1 text-xs truncate text-gray-300">{item.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 