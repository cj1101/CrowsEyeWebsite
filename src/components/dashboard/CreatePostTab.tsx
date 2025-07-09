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
import { usePostStore } from '@/stores/postStore';
import { useRouter } from 'next/navigation';
import { useMediaLibrary } from '@/hooks/api/useMediaLibrary';
import type { MediaItem } from '@/types/api';
import { PostService } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { usageService, USAGE_COSTS } from '@/services/usageService';
import { useAuth } from '@/contexts/AuthContext';

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
  acceptedMedia: ('image' | 'video' | 'audio')[];
  aspectRatios: string[];
  postTypes: string[];
  selectedAspectRatio?: string;
  selectedPostType?: string;
}

const platforms: PlatformOption[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    color: 'from-purple-500 to-pink-500',
    enabled: false,
    connected: true,
    characterLimit: 2200,
    acceptedMedia: ['image', 'video'],
    aspectRatios: ['original', '1:1', '4:5', '16:9'],
    postTypes: ['post', 'reel', 'story'],
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
    acceptedMedia: ['image', 'video'],
    aspectRatios: ['original', '1.91:1', '4:5', '16:9'],
    postTypes: ['post', 'reel', 'story'],
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
    acceptedMedia: ['image', 'video'],
    aspectRatios: ['original', '1:1', '4:5', '16:9'],
    postTypes: ['post'],
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
    acceptedMedia: ['image', 'video'],
    aspectRatios: ['original', '1:1', '4:5', '16:9'],
    postTypes: ['post'],
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
    acceptedMedia: ['image', 'video'],
    aspectRatios: ['original', '4:3', '16:9'],
    postTypes: ['post'],
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
    acceptedMedia: ['video'],
    aspectRatios: ['original', '9:16', '1:1', '16:9'],
    postTypes: ['post'],
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
    acceptedMedia: ['video'],
    aspectRatios: ['original', '16:9', '9:16', '1:1'],
    postTypes: ['video', 'shorts'],
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
    acceptedMedia: ['image', 'video'],
    aspectRatios: ['original', '2:3', '1000:1500', '9:16'],
    postTypes: ['pin'],
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
  const { files: libraryFilesInStore, addFiles } = useMediaStore();
  const { media: allLibraryMedia, uploadMedia } = useMediaLibrary();
  const { addPost } = usePostStore();
  const router = useRouter();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brandProfile = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('crows_eye_brand_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Filter unedited media (not post-ready/processed)
  const uneditedLibraryFiles: MediaItem[] = React.useMemo(() => {
    return allLibraryMedia.filter((item) => !item.isPostReady && !item.isProcessed);
  }, [allLibraryMedia]);

  // Allow multi-selection in modal
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<string[]>([]);

  const toggleLibrarySelection = (id: string) => {
    setSelectedLibraryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addSelectedFromLibrary = () => {
    const items = uneditedLibraryFiles.filter((f) => selectedLibraryIds.includes(f.id));
    if (items.length === 0) return;
    const mapped: MediaFile[] = items.map((libFile) => ({
      id: libFile.id,
      file: new File([], libFile.filename || 'unnamed'), // placeholder – we only need URL for preview/posting
      type: libFile.mediaType as 'image' | 'video' | 'audio',
      url: libFile.url,
      thumbnail: libFile.thumbnail || libFile.url,
      processed: libFile.isProcessed,
      processing: false,
    })) as any;
    setMediaFiles((prev) => [...prev, ...mapped]);
    setShowLibrary(false);
    setSelectedLibraryIds([]);
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => prev.map(platform => {
      if (platform.id === platformId && platform.connected) {
        const newEnabled = !platform.enabled;
        return {
          ...platform,
          enabled: newEnabled,
          selectedAspectRatio: newEnabled ? (platform.selectedAspectRatio || platform.aspectRatios[0]) : undefined,
          selectedPostType: newEnabled ? (platform.selectedPostType || platform.postTypes[0]) : undefined,
        };
      }
      return platform;
    }));
  };

  const handleMediaUpload = async (files: FileList | File[]) => {
    console.log('📁 Media upload started:', files.length, 'files');
    
    try {
      const newMediaFiles: MediaFile[] = [];
      
      const fileArray: File[] = Array.isArray(files) ? files as File[] : Array.from(files as FileList);
      
      // Validate files first
      for (const file of fileArray) {
        console.log('📄 Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        // Check file size (100MB limit)
        if (file.size > 100 * 1024 * 1024) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 100MB.`);
        }
        
        // Check file type
        const extFile = file.name.split('.').pop()?.toLowerCase();
        const img = file.type.startsWith('image/') || ['heic', 'heif', 'heic-sequence', 'heif-sequence'].includes(extFile || '');
        const vid = file.type.startsWith('video/');
        const isAud = file.type.startsWith('audio/');

        if (!img && !vid && !isAud) {
          throw new Error(`File "${file.name}" is not a supported media type. Please use images (including HEIC/HEIF), videos, or audio files.`);
        }
      }
      
      // Process files if validation passes
      for (let i = 0; i < fileArray.length; i++) {
        let file = fileArray[i];

        try {
          const extFile = file.name.split('.').pop()?.toLowerCase();
          const img = file.type.startsWith('image/') || ['heic', 'heif', 'heic-sequence', 'heif-sequence'].includes(extFile || '');
          const vid = file.type.startsWith('video/');

          // If HEIC/HEIF, convert to JPEG for preview & downstream compatibility
          if (img && ['heic', 'heif', 'heic-sequence', 'heif-sequence'].includes(extFile || '')) {
            // @ts-ignore – heic2any has no types
            const heic2any = (await import('heic2any')).default as any;
            const convertedBlob: Blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
            const convertedFile = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
            file = convertedFile; // replace original
          }

          const mediaFile: MediaFile = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            type: img ? 'image' : vid ? 'video' : 'audio',
            url: URL.createObjectURL(file),
            processing: false,
            processed: false
          };
          
          if (vid) {
            // Get video duration and create thumbnail
            try {
              const video = document.createElement('video');
              video.src = mediaFile.url;
              video.onloadedmetadata = () => {
                mediaFile.duration = video.duration;
                console.log('🎥 Video duration loaded:', video.duration, 'seconds');
              };
            } catch (videoError) {
              console.warn('⚠️ Failed to load video metadata:', videoError);
            }
          }
          
          newMediaFiles.push(mediaFile);
          console.log('✅ Media file prepared:', file.name, 'Type:', mediaFile.type);
          
        } catch (fileError) {
          console.error('❌ Failed to process file:', file.name, fileError);
          throw new Error(`Failed to process file "${file.name}": ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        }
      }
      
      // Add files to state
      setMediaFiles(prev => {
        const updated = [...prev, ...newMediaFiles];
        console.log('📚 Total media files now:', updated.length);
        return updated;
      });
      
      // Show success message
      if (newMediaFiles.length === 1) {
        console.log('🎉 Successfully added 1 file for post creation');
      } else {
        console.log(`🎉 Successfully added ${newMediaFiles.length} files for post creation`);
      }
      
    } catch (error) {
      console.error('❌ Media upload error:', error);
      
      // Show user-friendly error
      const errorMessage = error instanceof Error ? error.message : 'Failed to process media files';
      alert(`Upload Error: ${errorMessage}`);
    }
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

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const { userProfile } = useAuth();

  const handleGenerateAICaption = async () => {
    setIsGeneratingAI(true);

    try {
      // 1. Check usage and handle cost
      const usageResult = await usageService.handleUsage(userProfile, USAGE_COSTS.CAPTION_GENERATION);
      if (!usageResult.success) {
        alert(usageResult.error); // Using alert for now as there's no dedicated error state here
        setIsGeneratingAI(false);
        return;
      }

      // 2. Proceed with generation
      const mediaData = await Promise.all(
        mediaFiles.map(async (m) => {
          let data: string | undefined = undefined;
          
          const ext2 = m.file?.name.split('.').pop()?.toLowerCase();
          const isImg2 = m.type === 'image' || ['heic', 'heif', 'heic-sequence', 'heif-sequence'].includes(ext2 || '');

          if (
            isImg2 &&
            m.file &&
            m.file.size > 0
          ) {
            try {
              data = await fileToBase64(m.file);
            } catch (error) {
              console.warn('Failed to convert image to base64:', error);
            }
          }

          return {
            id: m.id,
            type: m.type,
            duration: m.duration,
            filename: m.file?.name,
            data: data
          };
        })
      );

      const enabledPlatforms = selectedPlatforms.filter(p => p.enabled);
      const primaryPlatform = enabledPlatforms.length > 0 ? enabledPlatforms[0].name.toLowerCase() : 'general';

      let style: 'professional' | 'casual' | 'funny' | 'engaging' | 'creative' = 'engaging';
      const contextLower = contextInput.toLowerCase();
      if (contextLower.includes('funny') || contextLower.includes('humor')) {
        style = 'funny';
      } else if (contextLower.includes('professional')) {
        style = 'professional';
      } else if (contextLower.includes('creative')) {
        style = 'creative';
      } else if (contextLower.includes('casual')) {
        style = 'casual';
      }

      const payload = {
        context: contextInput || 'Create an engaging social media post',
        media: mediaData,
        branding: useBranding ? brandProfile : null,
        platform: primaryPlatform,
        style: style,
        includeHashtags: true
      };

      const response = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setPostContent(result.caption || result.fullCaption);
        if (result.hashtags && result.hashtags.length > 0) {
          const cleanHashtags = result.hashtags.map((tag: string) => tag.replace('#', ''));
          setHashtags(cleanHashtags);
        }
      } else {
        throw new Error(result.details || 'Failed to generate caption');
      }

    } catch (error) {
      console.error('Failed to generate AI caption:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate caption: ${errorMessage}`);
      if (contextInput.trim()) {
        setPostContent(contextInput.trim());
      }
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
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required. Please sign in to create posts.');
      }

      console.log('🚀 Creating post with Firestore...');
      
      // Create the post in Firestore
      const postData = {
        userId: user.uid,
        title: postContent.substring(0, 50) + (postContent.length > 50 ? '...' : ''),
        content: postContent,
        tags: hashtags,
        platforms: enabledPlatforms.map(p => p.id),
        status: 'published' as const,
        publishedAt: new Date(),
      };

      const newPost = await PostService.createPost(postData);
      console.log('✅ Post created successfully:', newPost);

      // If there are media files, mark them as part of this post
      if (mediaFiles.length > 0) {
        console.log('📎 Updating media items to link with post...');
        // This would typically involve updating media items to reference the post
        // For now, we'll keep this as a placeholder since media linking can be complex
      }
      
      // Reset form
      setPostContent('');
      setHashtags([]);
      setMediaFiles([]);
      
      alert('Post created successfully!');
      
    } catch (error) {
      console.error('Failed to create post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to create post: ${errorMessage}`);
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

  const handleAspectRatioChange = (platformId: string, ratio: string) => {
    setSelectedPlatforms(prev => prev.map(p => p.id === platformId ? { ...p, selectedAspectRatio: ratio } : p));
  };

  const handlePostTypeChange = (platformId: string, postType: string) => {
    setSelectedPlatforms(prev => prev.map(p => p.id === platformId ? { ...p, selectedPostType: postType } : p));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
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
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-medium text-white">Add Media</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => setShowLibrary(true)}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <FolderOpen className="h-4 w-4 mr-1" />
                      Add from Media Library
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload New
                    </Button>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleMediaUpload(e.target.files);
                    }
                  }}
                  className="hidden"
                />

                {/* Media Files Display */}
                {mediaFiles.length > 0 && (
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">Selected Media ({mediaFiles.length})</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {mediaFiles.map((media) => (
                        <div key={media.id} className="relative group">
                          <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                            {media.type === 'image' ? (
                              <img src={media.url} alt="" className="w-full h-full object-cover" />
                            ) : media.type === 'video' ? (
                              <video src={media.url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleRemoveMedia(media.id)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          
                          <div className="mt-1 text-xs text-gray-400 truncate" title={media.file?.name}>
                            {media.file?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedPlatforms.map((platform) => {
                  const uploadedTypes = new Set(mediaFiles.map(m => m.type));
                  const supportsAll = Array.from(uploadedTypes).every(t => platform.acceptedMedia.includes(t));
                  const galleryIncompatible = contentType === 'gallery' && !platform.features.multipleImages;
                  const disabled = !platform.connected || !supportsAll || galleryIncompatible;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => !disabled && handlePlatformToggle(platform.id)}
                      disabled={disabled}
                      className={`
                        p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-center
                        ${platform.enabled 
                          ? `border-blue-500 bg-blue-500/10` 
                          : `border-gray-600 hover:border-gray-500`
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="mb-2">
                        <BrandIcon platform={platform.id} size={32} className="text-white mx-auto" />
                      </div>
                      <div className="text-sm font-medium text-white">{platform.name}</div>
                    </button>
                  );
                })}
              </div>

              {/* Platform specific options */}
              {selectedPlatforms.filter(p => p.enabled).map((platform) => (
                <div key={platform.id} className="bg-gray-700/40 p-3 rounded-lg mt-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <BrandIcon platform={platform.id} size={20} className="text-white" />
                      <span className="text-sm font-medium text-white">{platform.name} Options</span>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {platform.aspectRatios.length > 1 && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-300">Aspect</label>
                          <select
                            value={platform.selectedAspectRatio || platform.aspectRatios[0]}
                            onChange={(e) => handleAspectRatioChange(platform.id, e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-xs text-white focus:outline-none"
                          >
                            {platform.aspectRatios.map((ar) => (
                              <option key={ar} value={ar}>{ar}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {platform.postTypes.length > 1 && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-300">Type</label>
                          <select
                            value={platform.selectedPostType || platform.postTypes[0]}
                            onChange={(e) => handlePostTypeChange(platform.id, e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-xs text-white focus:outline-none"
                          >
                            {platform.postTypes.map((pt) => (
                              <option key={pt} value={pt}>{pt}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Content Creation */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Caption & Hashtags
                </CardTitle>
                <label className="flex items-center gap-1 text-xs text-gray-300 select-none">
                  <input
                    type="checkbox"
                    checked={useBranding}
                    onChange={(e) => setUseBranding(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-500 rounded bg-gray-700 border-gray-600 focus:ring-blue-500" />
                  Use Brand Profile
                </label>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                placeholder="Describe the context, audience, and tone for the AI..."
                className="w-full h-24 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
              />

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                onClick={handleGenerateAICaption}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : 'Generate with AI'}
              </Button>
              <div className="text-center text-xs text-gray-400">
                Cost: $0.01 or 1 AI Credit
              </div>

              {/* Generated Caption Editor (always visible) */}
              <div className="space-y-2 pt-4">
                <label className="text-sm font-medium text-gray-300">Generated Caption</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Your generated caption will appear here."
                  className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                />
                {characterCount && (
                  <div className="text-right text-sm"
                    style={{ color: characterCount.current > characterCount.max ? '#F87171' : '#9CA3AF' }}>
                    {characterCount.current}/{characterCount.max}
                  </div>
                )}
              </div>

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
                <div className="flex flex-wrap gap-2 pt-2">
                  {hashtags.map((hashtag) => (
                    <Badge key={hashtag} className="bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer" onClick={() => handleRemoveHashtag(hashtag)}>
                      #{hashtag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar removed and integrated into main flow */}
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
          <Card className="bg-gray-800/50 border-gray-700 max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white text-lg">Post Preview</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
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
                          <Button variant="ghost" size="icon" onClick={handlePrev} className="bg-black/30 hover:bg-black/50 text-white">
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleNext} className="bg-black/30 hover:bg-black/50 text-white">
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
                onClick={async () => {
                  if (mediaFiles.length === 0) return;
                  
                  const button = document.activeElement as HTMLButtonElement;
                  const originalText = button.textContent;
                  button.textContent = 'Uploading...';
                  button.disabled = true;
                  
                  try {
                    const uploadPromises = mediaFiles.map(async (mediaFile) => {
                      if (!mediaFile.file) return null;
                      const metadata = {
                        tags: [...hashtags, 'completed-post', 'library'],
                        caption: postContent,
                        platforms: selectedPlatforms.filter((p) => p.enabled).map((p) => p.id),
                        status: 'completed',
                        is_post_ready: true,
                      };
                      await uploadMedia(mediaFile.file, metadata);
                    });
                    
                    await Promise.all(uploadPromises);
                    
                    setShowPreview(false);
                    router.push('/dashboard?tab=library&mode=completed');
                  } catch (error) {
                    alert('Failed to upload to library. Please try again.');
                  } finally {
                    button.textContent = originalText;
                    button.disabled = false;
                  }
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Select Media</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={selectedLibraryIds.length === 0}
                  onClick={addSelectedFromLibrary}
                >
                  Add {selectedLibraryIds.length > 0 ? `(${selectedLibraryIds.length})` : ''} Selected
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowLibrary(false)}>
                  Close
                </Button>
              </div>
            </div>
            {uneditedLibraryFiles.length === 0 ? (
              <p className="text-gray-400">No unedited media available.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {uneditedLibraryFiles.map((item) => {
                  const selected = selectedLibraryIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`relative cursor-pointer group border rounded-lg overflow-hidden ${
                        selected ? 'ring-2 ring-blue-500' : 'border-gray-600'
                      }`}
                      onClick={() => toggleLibrarySelection(item.id)}
                    >
                      {item.mediaType === 'image' ? (
                        <img src={item.thumbnail || item.url} alt="" className="w-full h-32 object-cover" />
                      ) : item.mediaType === 'video' ? (
                        <video src={item.url} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-gray-700 text-white text-sm">Audio</div>
                      )}
                      {selected && (
                        <div className="absolute inset-0 bg-blue-500/40 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <p className="mt-1 text-xs truncate text-gray-300 px-1 pb-1">{item.filename}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 