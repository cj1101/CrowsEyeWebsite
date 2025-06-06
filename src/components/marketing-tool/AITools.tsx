'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  SparklesIcon, 
  PhotoIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  PencilIcon,
  BeakerIcon,
  GlobeAltIcon,
  HashtagIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  TagIcon,
  CalendarIcon,
  EyeIcon,
  MegaphoneIcon,
  StarIcon,
  FireIcon,
  LightBulbIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useCrowsEye } from '@/hooks/api/useCrowsEye';
import { useAudioImport } from '@/hooks/api/useAudioImport';
import { useStoryFormatter } from '@/hooks/api/useStoryFormatter';
import { useHighlightReel } from '@/hooks/api/useHighlightReel';
import { useGallery } from '@/hooks/api/useGallery';

interface UserSettings {
  apiKeys: {
    openai?: string;
    gemini?: string;
  };
  preferences: {
    defaultPlatform?: string;
    defaultTone?: string;
  };
}

const aiTools = [
  {
    id: 'content-generator',
    name: 'AI Content Generator',
    description: 'Generate engaging social media posts with AI',
    icon: <DocumentTextIcon className="h-6 w-6" />,
    category: 'Content Creation',
    color: 'from-purple-500 to-pink-500',
    features: ['Multi-platform optimization', 'Tone customization', 'Brand voice adaptation']
  },
  {
    id: 'image-generator',
    name: 'AI Image Generator',
    description: 'Create stunning visuals with DALL-E powered generation',
    icon: <PhotoIcon className="h-6 w-6" />,
    category: 'Visual Content',
    color: 'from-blue-500 to-cyan-500',
    features: ['Custom styles', 'Brand templates', 'High-resolution output']
  },
  {
    id: 'video-editor',
    name: 'AI Video Editor',
    description: 'Edit videos with AI-powered automation',
    icon: <VideoCameraIcon className="h-6 w-6" />,
    category: 'Video Content',
    color: 'from-red-500 to-orange-500',
    features: ['Auto-editing', 'Music sync', 'Subtitle generation']
  },
  {
    id: 'voice-generator',
    name: 'AI Voice Generator',
    description: 'Generate voiceovers and audio content',
    icon: <MicrophoneIcon className="h-6 w-6" />,
    category: 'Audio Content',
    color: 'from-green-500 to-emerald-500',
    features: ['Multiple voices', 'Language support', 'Emotion control']
  },
  {
    id: 'analytics-insights',
    name: 'AI Analytics Insights',
    description: 'Get intelligent insights from your social media data',
    icon: <ChartBarIcon className="h-6 w-6" />,
    category: 'Analytics',
    color: 'from-yellow-500 to-amber-500',
    features: ['Performance analysis', 'Trend prediction', 'Optimization tips']
  },
  {
    id: 'hashtag-generator',
    name: 'Smart Hashtag Generator',
    description: 'Generate trending and relevant hashtags',
    icon: <HashtagIcon className="h-6 w-6" />,
    category: 'Optimization',
    color: 'from-indigo-500 to-purple-500',
    features: ['Trending hashtags', 'Niche targeting', 'Performance scoring']
  },
  {
    id: 'trend-analyzer',
    name: 'Trend Analyzer',
    description: 'Analyze social media trends and viral content',
    icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
    category: 'Research',
    color: 'from-pink-500 to-rose-500',
    features: ['Real-time trends', 'Competitor analysis', 'Viral prediction']
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis',
    description: 'Analyze competitor strategies and performance',
    icon: <EyeIcon className="h-6 w-6" />,
    category: 'Research',
    color: 'from-slate-500 to-gray-500',
    features: ['Content analysis', 'Strategy insights', 'Performance comparison']
  },
  {
    id: 'content-optimizer',
    name: 'Content Optimizer',
    description: 'Optimize your content for maximum engagement',
    icon: <BoltIcon className="h-6 w-6" />,
    category: 'Optimization',
    color: 'from-orange-500 to-red-500',
    features: ['Engagement prediction', 'Best time to post', 'Content scoring']
  },
  {
    id: 'brand-voice',
    name: 'Brand Voice Trainer',
    description: 'Train AI to match your unique brand voice',
    icon: <AcademicCapIcon className="h-6 w-6" />,
    category: 'Branding',
    color: 'from-violet-500 to-purple-500',
    features: ['Voice analysis', 'Style adaptation', 'Consistency checking']
  },
  {
    id: 'auto-scheduler',
    name: 'AI Auto Scheduler',
    description: 'Automatically schedule posts for optimal engagement',
    icon: <ClockIcon className="h-6 w-6" />,
    category: 'Automation',
    color: 'from-teal-500 to-cyan-500',
    features: ['Optimal timing', 'Audience analysis', 'Cross-platform sync']
  },
  {
    id: 'audience-insights',
    name: 'Audience Insights',
    description: 'Deep analysis of your audience behavior and preferences',
    icon: <UserGroupIcon className="h-6 w-6" />,
    category: 'Analytics',
    color: 'from-emerald-500 to-green-500',
    features: ['Demographic analysis', 'Behavior patterns', 'Engagement preferences']
  },
  {
    id: 'caption-writer',
    name: 'AI Caption Writer',
    description: 'Generate compelling captions for your posts',
    icon: <PencilIcon className="h-6 w-6" />,
    category: 'Content Creation',
    color: 'from-blue-600 to-indigo-600',
    features: ['Multiple styles', 'Call-to-action optimization', 'Length variations']
  },
  {
    id: 'meme-generator',
    name: 'Meme Generator',
    description: 'Create viral memes and trending content',
    icon: <FireIcon className="h-6 w-6" />,
    category: 'Viral Content',
    color: 'from-red-600 to-pink-600',
    features: ['Trending templates', 'Custom memes', 'Viral prediction']
  },
  {
    id: 'idea-generator',
    name: 'Content Idea Generator',
    description: 'Never run out of content ideas again',
    icon: <LightBulbIcon className="h-6 w-6" />,
    category: 'Ideation',
    color: 'from-yellow-600 to-orange-600',
    features: ['Topic suggestions', 'Seasonal content', 'Trending ideas']
  }
];

const categories = [
  'All',
  'Content Creation',
  'Visual Content',
  'Video Content',
  'Audio Content',
  'Analytics',
  'Optimization',
  'Research',
  'Branding',
  'Automation',
  'Viral Content',
  'Ideation'
];

export default function AITools() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [tone, setTone] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTools = selectedCategory === 'All' 
    ? aiTools 
    : aiTools.filter(tool => tool.category === selectedCategory);

  const generateContent = async (toolId: string) => {
    if (!prompt.trim()) {
      alert('Please enter a prompt first.');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let content = '';
      switch (toolId) {
        case 'content-generator':
          content = generateSocialMediaPost(prompt, platform, tone);
          break;
        case 'hashtag-generator':
          content = generateHashtags(prompt);
          break;
        case 'caption-writer':
          content = generateCaption(prompt, platform);
          break;
        case 'meme-generator':
          content = generateMemeIdea(prompt);
          break;
        case 'idea-generator':
          content = generateContentIdeas(prompt);
          break;
        default:
          content = `Generated content for ${toolId}: ${prompt}`;
      }
      
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSocialMediaPost = (prompt: string, platform: string, tone: string) => {
    const templates: Record<string, Record<string, string>> = {
      instagram: {
        professional: `🌟 ${prompt} 🌟\n\nThis breakthrough represents a significant step forward in our industry. We're excited to share this innovation with our community and look forward to the positive impact it will create.\n\n#Innovation #Progress #${platform} #Professional #Growth`,
        casual: `Hey everyone! 👋\n\nJust wanted to share something cool about ${prompt}! It's been such an amazing journey and I can't wait to tell you more about it. What do you think? Drop your thoughts below! ⬇️\n\n#Casual #Sharing #Community #${prompt.replace(/\s+/g, '')}`,
        creative: `✨ Imagine if ${prompt} could transform everything... ✨\n\nWell, guess what? It's not just imagination anymore! We're diving deep into this creative exploration and the results are mind-blowing 🤯\n\n#Creative #Innovation #Transformation #${platform}`
      },
      facebook: {
        professional: `We're thrilled to announce our latest development regarding ${prompt}.\n\nThis initiative reflects our commitment to excellence and innovation. Our team has worked tirelessly to bring this vision to life, and we believe it will make a meaningful difference.\n\nWe'd love to hear your thoughts and feedback on this exciting development.`,
        casual: `Hey Facebook friends!\n\nI had to share this with you all - ${prompt} has been on my mind lately and I think you'll find it as fascinating as I do!\n\nWhat's your take on this? I'd love to start a conversation about it in the comments!`,
        creative: `🎨 Breaking the mold with ${prompt} 🎨\n\nSometimes the best ideas come from thinking outside the box. We're exploring new creative territories and pushing boundaries like never before.\n\nJoin us on this creative journey!`
      }
    };
    
    return templates[platform]?.[tone] || templates.instagram.professional;
  };

  const generateHashtags = (topic: string) => {
    const baseHashtags = [
      `#${topic.toLowerCase().replace(/\s+/g, '')}`,
      '#marketing',
      '#socialmedia',
      '#content',
      '#digital',
      '#branding',
      '#engagement',
      '#growth',
      '#strategy',
      '#innovation'
    ];

    const trendingHashtags = [
      '#viral',
      '#trending',
      '#fyp',
      '#explore',
      '#discover',
      '#popular',
      '#featured',
      '#spotlight'
    ];

    const nicheHashtags = [
      '#entrepreneur',
      '#success',
      '#motivation',
      '#inspiration',
      '#business',
      '#lifestyle',
      '#creativity',
      '#passion'
    ];

    return `🏷️ Recommended Hashtags for "${topic}":\n\n📍 Main Tags:\n${baseHashtags.slice(0, 5).join(' ')}\n\n🔥 Trending:\n${trendingHashtags.slice(0, 4).join(' ')}\n\n🎯 Niche Specific:\n${nicheHashtags.slice(0, 4).join(' ')}\n\n💡 Tip: Use 15-20 hashtags for optimal reach on Instagram!`;
  };

  const generateCaption = (topic: string, platform: string) => {
    const hooks = [
      "Stop scrolling! 🛑",
      "This will blow your mind 🤯",
      "You won't believe what happened...",
      "The secret to success? 🔐",
      "Everyone's talking about this 🗣️"
    ];

    const hook = hooks[Math.floor(Math.random() * hooks.length)];
    
    return `${hook}\n\n${topic} is changing the game, and here's why you should care:\n\n✅ It's revolutionary\n✅ It's accessible to everyone\n✅ It's the future\n\nDouble-tap if you agree! 💙\n\nWhat's your experience with ${topic}? Share in the comments! 👇`;
  };

  const generateMemeIdea = (topic: string) => {
    const memeFormats = [
      "Drake pointing meme",
      "Distracted boyfriend meme",
      "Woman yelling at cat meme",
      "This is fine dog meme",
      "Expanding brain meme"
    ];

    const format = memeFormats[Math.floor(Math.random() * memeFormats.length)];
    
    return `🎭 Meme Idea: ${format}\n\nTop text: "When someone mentions ${topic}"\nBottom text: "Me: *immediately becomes an expert*"\n\n💡 Alternative:\nPanel 1: Life before ${topic}\nPanel 2: Life after discovering ${topic}\n\n🔥 This format has 87% viral potential based on current trends!`;
  };

  const generateContentIdeas = (topic: string) => {
    return `💡 Content Ideas for "${topic}":\n\n📱 Posts:\n• 5 surprising facts about ${topic}\n• Behind-the-scenes of ${topic}\n• Before/after transformation with ${topic}\n• Common myths about ${topic} debunked\n• Your ${topic} journey in 30 seconds\n\n🎥 Video Ideas:\n• Day in the life featuring ${topic}\n• ${topic} tutorial for beginners\n• Reacting to ${topic} trends\n• Q&A about ${topic}\n\n📊 Engagement Boosters:\n• Poll: What's your favorite aspect of ${topic}?\n• Challenge: Show us your ${topic} setup\n• Quiz: How much do you know about ${topic}?`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Content copied to clipboard!');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  if (selectedTool) {
    const tool = aiTools.find(t => t.id === selectedTool);
    
    if (!tool) {
      return <div>Tool not found</div>;
    }
    
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedTool(null)}
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
          >
            ← Back to Tools
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.color}`}>
              {tool.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tech-heading">{tool.name}</h2>
              <p className="text-gray-400 tech-body">{tool.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="vision-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 tech-heading">Configuration</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 tech-body">
                  {tool.category === 'Visual Content' ? 'Image Description' : 'Prompt/Topic'}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Enter your ${tool.category === 'Visual Content' ? 'image description' : 'prompt'} here...`}
                  className="w-full p-4 bg-black/20 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 tech-body"
                  rows={4}
                />
              </div>

              {tool.category === 'Content Creation' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 tech-body">Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 tech-body"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 tech-body">Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full p-3 bg-black/20 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 tech-body"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="creative">Creative</option>
                      <option value="humorous">Humorous</option>
                      <option value="inspiring">Inspiring</option>
                    </select>
                  </div>
                </>
              )}

              {tool.category === 'Visual Content' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 tech-body">Upload Reference Image (Optional)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-purple-500/30 rounded-xl text-center cursor-pointer hover:border-purple-500/50 transition-colors"
                  >
                    <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 tech-body">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 tech-body">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => generateContent(tool.id)}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed tech-subheading"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </div>
                ) : (
                  `Generate ${tool.category === 'Visual Content' ? 'Image' : 'Content'}`
                )}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="vision-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white tech-heading">Generated Output</h3>
              {generatedContent && (
                <button
                  onClick={() => copyToClipboard(generatedContent)}
                  className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 tech-body"
                >
                  <ClipboardDocumentIcon className="h-5 w-5" />
                  Copy
                </button>
              )}
            </div>

            {generatedContent ? (
              <div className="space-y-4">
                <div className="p-4 bg-black/20 rounded-xl">
                  <pre className="whitespace-pre-wrap text-gray-300 tech-body">{generatedContent}</pre>
                </div>
                
                <div className="flex gap-3">
                  <button className="flex-1 py-2 px-4 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors tech-body">
                    Edit
                  </button>
                  <button className="flex-1 py-2 px-4 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors tech-body">
                    Schedule Post
                  </button>
                  <button className="flex-1 py-2 px-4 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors tech-body">
                    Save Draft
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <BeakerIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="tech-body">Your generated content will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Showcase */}
        <div className="vision-card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 tech-heading">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tool.features.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300 tech-body">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4 tech-heading">🤖 AI Marketing Tools</h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto tech-body">
          Supercharge your content creation with our comprehensive suite of AI-powered marketing tools. 
          From content generation to trend analysis, we've got everything you need to dominate social media.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 tech-body ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className="vision-card rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer group hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                {tool.icon}
              </div>
              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full tech-body">
                {tool.category}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 tech-subheading">{tool.name}</h3>
            <p className="text-gray-400 mb-4 text-sm tech-body">{tool.description}</p>
            
            <div className="space-y-2">
              {tool.features.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-500 text-xs tech-body">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <span className="text-purple-400 text-sm font-medium tech-body">
                Click to explore →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="vision-card rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center tech-heading">AI Tools Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2 tech-heading">15+</div>
            <div className="text-gray-400 tech-body">AI Tools Available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2 tech-heading">10k+</div>
            <div className="text-gray-400 tech-body">Content Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2 tech-heading">95%</div>
            <div className="text-gray-400 tech-body">User Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2 tech-heading">3x</div>
            <div className="text-gray-400 tech-body">Faster Creation</div>
          </div>
        </div>
      </div>
    </div>
  );
} 