'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Wand2, 
  Calendar, 
  Send, 
  Eye,
  Hash,
  MapPin,
  Users,
  Clock,
  Sparkles,
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
  MessageSquare
} from 'lucide-react';
import MediaUpload from '@/components/media/MediaUpload';

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
  icon: string;
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
    icon: '📷',
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
    icon: '📘',
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
    id: 'twitter',
    name: 'X (Twitter)',
    icon: '🐦',
    color: 'from-gray-800 to-black',
    enabled: false,
    connected: true,
    characterLimit: 280,
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
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'from-blue-700 to-blue-800',
    enabled: false,
    connected: false,
    characterLimit: 3000,
    features: {
      hashtags: true,
      location: false,
      mentions: true,
      scheduling: true,
      stories: false,
      multipleImages: false
    }
  }
];

export default function CreatePostTab() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformOption[]>(platforms);
  const [postContent, setPostContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [location, setLocation] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [useBranding, setUseBranding] = useState(true);
  const [aiTone, setAiTone] = useState<'professional' | 'casual' | 'engaging'>('casual');
  const [isPublishing, setIsPublishing] = useState(false);
  
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

  const handleMediaUpload = async (files: FileList) => {
    const newMediaFiles: MediaFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
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
      // Mock AI generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestions = {
        professional: "Elevating your brand with innovative solutions. Our latest project showcases cutting-edge technology and thoughtful design.",
        casual: "Just dropped something amazing! 🚀 Can't wait for you all to see what we've been working on. This is going to be epic!",
        engaging: "Ready to be amazed? ✨ We've been cooking up something special and today's the day we share it with the world! What do you think? Drop your thoughts below! 👇"
      } as Record<typeof aiTone, string>;
      
      // Inject brand context if enabled
      if (useBranding && brandProfile) {
        const brandIntro = brandProfile.tagline || brandProfile.description || brandProfile.name;
        suggestions.professional = `${brandIntro ? brandIntro + ' – ' : ''}${suggestions.professional}`;
        suggestions.casual = `${brandIntro ? brandIntro + ' – ' : ''}${suggestions.casual}`;
        suggestions.engaging = `${brandIntro ? brandIntro + ' – ' : ''}${suggestions.engaging}`;
      }
      
      setPostContent(suggestions[aiTone]);
      
      // Generate relevant hashtags
      let aiHashtags = ['AI', 'Innovation', 'Creative', 'Digital', 'Tech'];
      if (useBranding && brandProfile?.hashtags) {
        const brandTags = brandProfile.hashtags
          .split(',')
          .map((t: string) => t.trim().replace(/^#?/, ''))
          .filter(Boolean);
        aiHashtags = [...new Set([...brandTags, ...aiHashtags])].slice(0, 10);
      }
      setHashtags(aiHashtags);
      
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
      setLocation('');
      setMediaFiles([]);
      setIsScheduled(false);
      setScheduleDate('');
      setScheduleTime('');
      
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
                {selectedPlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformToggle(platform.id)}
                    disabled={!platform.connected}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 text-center
                      ${platform.enabled 
                        ? `border-blue-500 bg-blue-500/10` 
                        : `border-gray-600 hover:border-gray-500`
                      }
                      ${!platform.connected ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="text-2xl mb-2">{platform.icon}</div>
                    <div className="text-sm font-medium text-white">{platform.name}</div>
                    <div className="text-xs text-gray-400">
                      {platform.connected ? 'Connected' : 'Not Connected'}
                    </div>
                    {platform.enabled && (
                      <Badge className="mt-2 bg-blue-500/20 text-blue-300">Selected</Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Creation */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Post Content
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
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value as any)}
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="engaging">Engaging</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAICaption}
                    disabled={isGeneratingAI}
                    className="border-purple-600 hover:border-purple-500 text-purple-400"
                  >
                    {isGeneratingAI ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    <span className="ml-2">AI Generate</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind? Share your story..."
                  className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                />
                {characterCount && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      {characterCount.current}/{characterCount.max} characters
                    </span>
                    <div className={`text-right ${
                      characterCount.current > characterCount.max ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {characterCount.current > characterCount.max && 'Exceeds limit for selected platforms'}
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

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Location (Optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location"
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Media
              </CardTitle>
              <CardDescription>Add images, videos, or audio to your post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
                  className="hidden"
                />
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <div className="text-gray-300">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Click to upload
                    </button>{' '}
                    or drag and drop
                  </div>
                  <div className="text-sm text-gray-400">
                    PNG, JPG, MP4, MP3 up to 100MB
                  </div>
                </div>
              </div>

              {/* Media Preview */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mediaFiles.map((media) => (
                    <div key={media.id} className="relative group">
                      <div className="relative rounded-lg overflow-hidden bg-gray-700">
                        {media.type === 'image' ? (
                          <img
                            src={media.url}
                            alt=""
                            className="w-full h-24 object-cover"
                          />
                        ) : media.type === 'video' ? (
                          <div className="w-full h-24 bg-gray-600 flex items-center justify-center">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        ) : (
                          <div className="w-full h-24 bg-gray-600 flex items-center justify-center">
                            <Music className="h-6 w-6 text-white" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMedia(media.id)}
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-400 truncate">
                        {media.file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Scheduling
              </CardTitle>
              <CardDescription>Post now or schedule for later</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="posting-time"
                    checked={!isScheduled}
                    onChange={() => setIsScheduled(false)}
                    className="text-blue-500"
                  />
                  <span className="text-gray-300">Post Now</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="posting-time"
                    checked={isScheduled}
                    onChange={() => setIsScheduled(true)}
                    className="text-blue-500"
                  />
                  <span className="text-gray-300">Schedule for Later</span>
                </label>
              </div>

              {isScheduled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          {showPreview && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-white text-sm whitespace-pre-wrap">{postContent}</div>
                  {hashtags.length > 0 && (
                    <div className="mt-2 text-blue-400 text-sm">
                      {hashtags.map(tag => `#${tag}`).join(' ')}
                    </div>
                  )}
                  {location && (
                    <div className="mt-2 text-gray-400 text-sm flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {location}
                    </div>
                  )}
                </div>
                
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {mediaFiles.slice(0, 4).map((media) => (
                      <div key={media.id} className="relative rounded overflow-hidden">
                        {media.type === 'image' ? (
                          <img src={media.url} alt="" className="w-full h-16 object-cover" />
                        ) : (
                          <div className="w-full h-16 bg-gray-600 flex items-center justify-center">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Publishing Actions */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || selectedPlatforms.filter(p => p.enabled).length === 0}
                  className={`w-full ${
                    isScheduled 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isPublishing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : isScheduled ? (
                    <Clock className="h-4 w-4 mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isPublishing ? 'Publishing...' : isScheduled ? 'Schedule Post' : 'Publish Now'}
                </Button>
                
                <div className="text-xs text-gray-400 text-center">
                  {selectedPlatforms.filter(p => p.enabled).length > 0 
                    ? `Publishing to ${selectedPlatforms.filter(p => p.enabled).length} platform(s)`
                    : 'Select platforms to publish'
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-gray-600">
                <Copy className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              
              <Button variant="outline" className="w-full justify-start border-gray-600">
                <Download className="h-4 w-4 mr-2" />
                Save Template
              </Button>
              
              <Button variant="outline" className="w-full justify-start border-gray-600">
                <Palette className="h-4 w-4 mr-2" />
                Brand Kit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 