'use client';

import React, { useState } from 'react';
import { useMediaLibrary, MediaItem } from '@/hooks/api/useMediaLibrary';
import ContentValidator from '@/components/compliance/ContentValidator';
import { apiService, CreatePostRequest } from '@/services/api';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  PlusIcon, 
  SparklesIcon,
  CalendarIcon,
  ClockIcon,
  GlobeAltIcon,
  HashtagIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  maxLength: number;
  aspectRatios: string[];
}

const platforms: Platform[] = [
  { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500', maxLength: 2200, aspectRatios: ['1:1', '4:5', '16:9'] },
  { id: 'facebook', name: 'Facebook', icon: '👥', color: 'bg-blue-600', maxLength: 63206, aspectRatios: ['16:9', '1:1', '4:5'] },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'bg-black', maxLength: 280, aspectRatios: ['16:9', '1:1'] },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700', maxLength: 3000, aspectRatios: ['16:9', '1:1'] },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black', maxLength: 2200, aspectRatios: ['9:16'] },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-600', maxLength: 5000, aspectRatios: ['16:9'] },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: 'bg-red-500', maxLength: 500, aspectRatios: ['2:3', '1:1'] },
  { id: 'snapchat', name: 'Snapchat', icon: '👻', color: 'bg-yellow-400', maxLength: 250, aspectRatios: ['9:16'] }
];

export default function CreatePostTab() {
  const { media, uploadMedia } = useMediaLibrary();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  
  // Unified Natural Language Input
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState('');
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [isProcessingNL, setIsProcessingNL] = useState(false);
  const [showPostPreview, setShowPostPreview] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{
    caption: string;
    hashtags: string;
    processedMedia?: string;
    platforms: string[];
  } | null>(null);

  const handleMediaUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const newMedia = await uploadMedia(files[i]);
      if (!selectedMedia) {
        setSelectedMedia(newMedia);
      }
    }
    setShowMediaUpload(false);
  };

  const generateCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      // Mock AI caption generation - showing actual demo results
      const mockCaptions = [
        "🌟 Elevating your brand to new heights! ✨ Ready to make an impact? Our latest campaign shows 300% increased engagement when using AI-powered content creation. #BrandSuccess #DigitalMarketing",
        "💡 Innovation meets creativity. This is where magic happens! Behind the scenes at our content studio where we're crafting the future of social media. What's your creative process like? #Innovation #ContentCreation",
        "🚀 Taking your content strategy to the next level. Let's grow together! New case study: How we helped a startup achieve 50K followers in 3 months using strategic content planning. #ContentStrategy #GrowthHacking",
        "✨ Crafting moments that matter. Your story deserves to be told beautifully. Every pixel, every word, every emotion - we put heart into everything we create for your brand. #StoryTelling #BrandNarrative",
        "🎯 Strategic content that converts. Building connections that last. Data shows that authentic storytelling increases conversion rates by 20%. Ready to transform your content? #ConversionOptimization #AuthenticBranding"
      ];
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      const randomCaption = mockCaptions[0]; // Use first caption to avoid hydration issues
      setCaption(randomCaption);
    } catch (error) {
      console.error('Error generating caption:', error);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const generateHashtags = async () => {
    setIsGeneratingHashtags(true);
    try {
      // Mock hashtag generation - showing actual demo results
      const mockHashtags = [
        "#marketing #socialmedia #contentcreator #digitalmarketing #branding #engagement #growthhacking #brandstrategy #contentmarketing #socialmediamarketing",
        "#business #entrepreneur #success #motivation #growth #startup #innovation #leadership #businessgrowth #mindset",
        "#creative #design #innovation #strategy #engagement #visualcontent #creativeprocess #designthinking #brandidentity #userexperience",
        "#socialmediamarketing #contentmarketing #brandstrategy #digitalcontent #onlinemarketing #influencermarketing #socialmediatips #contentcreation #digitalbranding #marketingcampaign",
        "#marketingtips #businessgrowth #onlinemarketing #brandbuilding #digitalstrategy #contentplanning #socialmediaexpert #brandawareness #marketingagency #socialmediastrategy"
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      const randomHashtags = mockHashtags[0]; // Use first hashtag set to avoid hydration issues
      setHashtags(randomHashtags);
    } catch (error) {
      console.error('Error generating hashtags:', error);
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const processNaturalLanguage = async () => {
    setIsProcessingNL(true);
    try {
      // Mock comprehensive AI processing - showing actual demo results
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call
      
      const mockResults = [
        {
          caption: "🚀 Exciting news! We're launching our revolutionary new product that will transform how you create content. Built with cutting-edge AI technology, this tool understands your brand voice and creates engaging posts in seconds. Early beta users report 5x faster content creation and 300% higher engagement rates. Ready to join the future of content creation? 💫\n\nSign up for early access (link in bio) and be among the first to experience the power of AI-driven social media marketing. Your audience is waiting for content that truly resonates! ✨",
          hashtags: "#productlaunch #AI #contentcreation #socialmedia #marketing #innovation #startup #earlyaccess #engagement #futuretech #brandvoice #contentmarketing #digitalmarketing #growthhacking #techstartup",
          processedMedia: selectedMedia?.thumbnail || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
          platforms: selectedPlatforms
        },
        {
          caption: "Behind the scenes at our content studio! 🎬 Watch how we transform a simple idea into a viral social media campaign. From brainstorming to execution, every step is carefully crafted to maximize engagement and drive results.\n\nOur secret? We combine human creativity with AI precision to create content that not only looks amazing but performs exceptionally well. This campaign generated 2.5M impressions and 150K engagements across all platforms! 📈\n\nWhat's your content creation process like? Share below! 👇",
          hashtags: "#behindthescenes #contentcreation #socialmediamarketing #viralcontent #campaignresults #creativeprocess #contentmarketing #engagement #brandstrategy #socialmedia #digitalmarketing #contentproduction #marketing #brandbuilding #creativestudio",
          processedMedia: selectedMedia?.thumbnail || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop",
          platforms: selectedPlatforms
        },
        {
          caption: "📊 Case Study Alert! How we helped a small business achieve 1000% ROI with strategic content marketing. The challenge: Limited budget, saturated market, and generic content that wasn't connecting with their audience.\n\nOur solution: AI-powered content personalization + data-driven strategy + authentic storytelling = INCREDIBLE RESULTS! 🎯\n\n✅ 500K+ new followers in 6 months\n✅ 25% increase in conversion rates\n✅ 300% boost in engagement\n✅ 1000% ROI on marketing spend\n\nReady to transform your content strategy? DM us 'STRATEGY' for a free consultation! 💬",
          hashtags: "#casestudy #ROI #contentmarketing #smallbusiness #marketingsuccess #digitalmarketing #contentstrategy #businessgrowth #marketingresults #socialmediamarketing #brandtransformation #leadgeneration #conversionoptimization #marketingagency #businesssuccess",
          processedMedia: selectedMedia?.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
          platforms: selectedPlatforms
        }
      ];
      
      const randomResult = mockResults[0]; // Use first result to avoid hydration issues
      setGeneratedPost(randomResult);
      setCaption(randomResult.caption);
      setHashtags(randomResult.hashtags);
      setShowPostPreview(true);
      
    } catch (error) {
      console.error('Error processing natural language:', error);
    } finally {
      setIsProcessingNL(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const getCharacterCount = () => {
    const fullText = `${caption} ${hashtags}`.trim();
    return fullText.length;
  };

  const getMaxLength = () => {
    if (selectedPlatforms.length === 0) return 0;
    return Math.min(...selectedPlatforms.map(id => 
      platforms.find(p => p.id === id)?.maxLength || 0
    ));
  };

  const handlePublish = async () => {
    try {
      // Prepare data for the marketing tool API
      const scheduledFor = isScheduled && scheduledDate && scheduledTime 
        ? `${scheduledDate}T${scheduledTime}:00.000Z`
        : undefined;

      const marketingPostData: CreatePostRequest = {
        content: caption.trim(),
        platforms: selectedPlatforms,
        hashtags: hashtags.split('#').filter(h => h.trim()).map(h => `#${h.trim()}`),
        mediaFiles: selectedMedia ? [selectedMedia.id] : [],
        scheduledFor
      };

      console.log('🚀 Publishing post via marketing tool API:', marketingPostData);
      
      // Call the marketing tool API
      const response = await apiService.createMarketingPost(marketingPostData);
      
      if (response.data?.success) {
        console.log('✅ Post created successfully:', response.data);
        
        // Reset form
        setCaption('');
        setHashtags('');
        setSelectedMedia(null);
        setIsScheduled(false);
        setScheduledDate('');
        setScheduledTime('');
        setShowPostPreview(false);
        setGeneratedPost(null);
        setNaturalLanguagePrompt('');
        setContextFiles([]);
        
        alert(`Post ${isScheduled ? 'scheduled' : 'published'} successfully! Post ID: ${response.data.postId}`);
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error: any) {
      console.error('❌ Error publishing post:', error);
      alert(`Error ${isScheduled ? 'scheduling' : 'publishing'} post: ${error.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Create Post</h2>
          <p className="text-gray-400 mt-1">Design and schedule your social media content with AI</p>
        </div>
      </div>

      <div className={`grid ${showPostPreview ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
        {/* Left Column - Content Creation */}
        <div className="space-y-6">
          {/* Media Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Media</h3>
            
            {selectedMedia ? (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  {selectedMedia.thumbnail ? (
                    <img src={selectedMedia.thumbnail} alt={selectedMedia.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
                      {selectedMedia.type === 'image' ? '🖼️' : selectedMedia.type === 'video' ? '🎥' : '🎵'}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{selectedMedia.name}</p>
                    <p className="text-sm text-gray-400">
                      {selectedMedia.type} • {(selectedMedia.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setShowMediaUpload(true)}
                  className="w-full border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-500 transition-colors"
                >
                  <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Upload Media</p>
                  <p className="text-sm text-gray-400">Images, videos, or audio files</p>
                </button>

                {/* Quick Media Selection */}
                <div className="grid grid-cols-3 gap-2">
                  {media.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className="aspect-square bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
                    >
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-500">
                          {item.type === 'image' ? '🖼️' : item.type === 'video' ? '🎥' : '🎵'}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Unified Natural Language Input Section */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-purple-400" />
              AI Content Assistant
            </h3>
            
            <div className="space-y-4">
              {/* Unified Natural Language Input */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">
                  Describe What You Want to Create
                </label>
                <textarea
                  value={naturalLanguagePrompt}
                  onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
                  placeholder="Describe everything you want in natural language. For example:

• 'Create a professional post about our new product launch targeting tech entrepreneurs. Make it engaging, include statistics, and add a call-to-action.'

• 'Resize the image to Instagram square format, add a blue filter, brighten by 20%, create a carousel post with 3 slides about sustainable living tips.'

• 'Generate a LinkedIn post about our company culture, include our team photo, optimize for maximum engagement, and schedule for tomorrow at 2 PM.'

Be as detailed as possible - include content ideas, media editing instructions, platform preferences, scheduling, and any brand guidelines or context you want the AI to consider."
                  className="w-full h-40 bg-white/10 border border-purple-300/30 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm leading-relaxed"
                />
              </div>

              {/* Context Files */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">
                  Context Files (Optional)
                </label>
                <div className="border-2 border-dashed border-purple-300/30 rounded-lg p-4">
                  <input 
                    type="file" 
                    multiple 
                    accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files && setContextFiles(Array.from(e.target.files))}
                    className="hidden"
                    id="context-files"
                  />
                  <label htmlFor="context-files" className="cursor-pointer block text-center">
                    <div className="flex flex-col items-center">
                      <DocumentTextIcon className="h-8 w-8 text-purple-400 mb-2" />
                      <p className="text-white text-sm">Upload brand assets & guidelines</p>
                      <p className="text-xs text-gray-400">Brand guidelines, logos, previous content, style guides</p>
                    </div>
                  </label>
                  
                  {contextFiles.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {contextFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-purple-500/20 rounded px-3 py-1">
                          <span className="text-sm text-white">{file.name}</span>
                          <button
                            onClick={() => setContextFiles(prev => prev.filter((_, i) => i !== index))}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={processNaturalLanguage}
                disabled={isProcessingNL || !naturalLanguagePrompt.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-all text-lg"
              >
                <SparklesIcon className="h-6 w-6" />
                {isProcessingNL ? 'Processing with AI...' : 'Generate Complete Post with AI'}
              </button>
            </div>
          </div>

          {/* Manual Caption Override */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Caption {generatedPost && "(AI Generated - Edit if needed)"}</h3>
              <button
                onClick={generateCaption}
                disabled={isGeneratingCaption}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center gap-2 text-sm transition-all"
              >
                <SparklesIcon className="h-4 w-4" />
                {isGeneratingCaption ? 'Generating...' : 'AI Generate'}
              </button>
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption here or use AI generation above..."
              className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />

            <div className="flex items-center justify-between mt-2">
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="humorous">Humorous</option>
                <option value="inspiring">Inspiring</option>
              </select>
              <span className={`text-sm ${getCharacterCount() > getMaxLength() ? 'text-red-400' : 'text-gray-400'}`}>
                {getCharacterCount()}/{getMaxLength() || '∞'}
              </span>
            </div>
          </div>

          {/* Manual Hashtags Override */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Hashtags {generatedPost && "(AI Generated - Edit if needed)"}</h3>
              <button
                onClick={generateHashtags}
                disabled={isGeneratingHashtags}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 flex items-center gap-2 text-sm transition-all"
              >
                <HashtagIcon className="h-4 w-4" />
                {isGeneratingHashtags ? 'Generating...' : 'AI Generate'}
              </button>
            </div>

            <textarea
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#hashtag #socialmedia #marketing"
              className="w-full h-20 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Content Validation */}
          {(caption.trim() || hashtags.trim()) && selectedPlatforms.length > 0 && (
            <ContentValidator
              content={`${caption} ${hashtags}`.trim()}
              platform={selectedPlatforms[0]} // Use primary platform for validation
              contentType="text"
              mediaUrls={selectedMedia ? [selectedMedia.url] : []}
              metadata={{
                platforms: selectedPlatforms,
                scheduledFor: isScheduled ? `${scheduledDate} ${scheduledTime}` : undefined
              }}
              onValidationComplete={(result) => {
                console.log('Validation result:', result);
              }}
              autoValidate={true}
              className="mt-6"
            />
          )}
        </div>

        {/* Middle Column - Settings & Controls */}
        <div className="space-y-6">
          {/* Platform Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Platforms</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{platform.icon}</span>
                    <span className="text-white text-sm font-medium">{platform.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Max: {platform.maxLength} chars</p>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Schedule</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-white">Schedule for later</span>
              </label>
            </div>

            {isScheduled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-white">Advanced Settings</h3>
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Auto-optimize for platforms</label>
                  <input
                    type="checkbox"
                    className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Add watermark</label>
                  <input
                    type="checkbox"
                    className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cross-post to all platforms</label>
                  <input
                    type="checkbox"
                    className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePublish}
              disabled={!selectedMedia || selectedPlatforms.length === 0}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              {isScheduled ? 'Schedule Post' : 'Publish Now'}
            </button>

            <button 
              onClick={() => setShowPostPreview(!showPostPreview)}
              className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-lg hover:bg-white/20 flex items-center justify-center gap-2 transition-all"
            >
              <EyeIcon className="h-5 w-5" />
              {showPostPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        {/* Right Column - Live Post Preview */}
        {showPostPreview && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Live Post Preview</h3>
              
              {/* Instagram Style Preview */}
              <div className="bg-white rounded-xl p-4 max-w-sm mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">CE</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-black font-semibold text-sm">crows_eye_official</p>
                    <p className="text-gray-600 text-xs">Sponsored</p>
                  </div>
                  <button className="text-gray-600">⋯</button>
                </div>

                {/* Media */}
                <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                  {(generatedPost?.processedMedia || selectedMedia?.thumbnail) ? (
                    <img 
                      src={generatedPost?.processedMedia || selectedMedia?.thumbnail} 
                      alt="Post preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      📷
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-4">
                    <HeartIcon className="h-6 w-6 text-black" />
                    <ChatBubbleLeftIcon className="h-6 w-6 text-black" />
                    <ShareIcon className="h-6 w-6 text-black" />
                  </div>
                  <BookmarkIcon className="h-6 w-6 text-black" />
                </div>

                {/* Likes */}
                <p className="text-black font-semibold text-sm mb-2">1,234 likes</p>

                {/* Caption */}
                <div className="text-black text-sm">
                  <span className="font-semibold">crows_eye_official</span>{' '}
                  <span className="whitespace-pre-wrap">
                    {caption.length > 150 ? `${caption.substring(0, 150)}...` : caption}
                  </span>
                </div>

                {/* Hashtags */}
                {hashtags && (
                  <div className="mt-1">
                    <p className="text-blue-600 text-sm">
                      {hashtags.split(' ').slice(0, 5).join(' ')}
                      {hashtags.split(' ').length > 5 && '...'}
                    </p>
                  </div>
                )}

                {/* Comments */}
                <p className="text-gray-600 text-sm mt-2">View all 127 comments</p>
                <p className="text-gray-600 text-xs mt-1">2 hours ago</p>
              </div>

              {/* Platform Indicators */}
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Publishing to:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPlatforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return platform ? (
                      <span key={platformId} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                        {platform.icon} {platform.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Post Stats Prediction */}
              <div className="mt-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3">
                <p className="text-white text-sm font-semibold mb-2">🔮 AI Performance Prediction</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Estimated Reach</p>
                    <p className="text-white font-medium">2.5K - 5.2K</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Expected Engagement</p>
                    <p className="text-white font-medium">180 - 350</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Best Time to Post</p>
                    <p className="text-white font-medium">2:00 PM</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Engagement Rate</p>
                    <p className="text-white font-medium">7.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Upload Media</h3>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*,audio/*"
                onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-2">Click to upload files</p>
                <p className="text-sm text-gray-400">Support for images, videos, and audio files</p>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowMediaUpload(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 