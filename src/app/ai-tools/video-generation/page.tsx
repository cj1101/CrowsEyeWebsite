'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Download, 
  RefreshCw, 
  Copy,
  Sparkles,
  Video,
  ArrowLeft,
  Save,
  Target,
  Users,
  Zap,
  Heart,
  TrendingUp,
  Briefcase,
  Coffee,
  Palette,
  Info,
  Camera,
  Megaphone,
  ShoppingBag,
  BookOpen,
  Lightbulb,
  Trophy,
  Music,
  MapPin,
  Clock,
  Smile,
  ChefHat,
  Dumbbell,
  Car,
  Home,
  Gamepad2,
  Headphones,
  Scissors,
  Paintbrush,
  Building,
  GraduationCap,
  Stethoscope,
  Wrench,
  Globe,
  Monitor
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/stores/mediaStore';

export default function VideoGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('8s'); // Default to 8s for best cost/quality balance
  const [model, setModel] = useState('veo3-fast'); // Default to cost-effective option
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [useBranding, setUseBranding] = useState(true);

  // Use the media library hook and router
  const router = useRouter();
  const { addFiles } = useMediaStore();

  // Video Marketing Preset Prompts
  const videoPresets = [
    {
      id: 'product-demo',
      name: 'Product Demo Video',
      icon: Target,
      category: 'Product Marketing',
      prompt: 'Professional product demonstration video of [YOUR PRODUCT] showing [KEY FEATURES/BENEFITS], clean studio lighting, smooth camera movements, close-up details, person using the product effectively'
    },
    {
      id: 'brand-story',
      name: 'Brand Story Video',
      icon: Heart,
      category: 'Brand Marketing',
      prompt: 'Compelling brand story video showing [YOUR COMPANY MISSION/VALUES], emotional journey of [YOUR TARGET CUSTOMER], authentic moments, inspiring visuals, professional cinematography'
    },
    {
      id: 'social-promo',
      name: 'Social Media Promo',
      icon: Zap,
      category: 'Social Media',
      prompt: 'Eye-catching social media promotional video for [YOUR OFFER/EVENT], dynamic text animations, [YOUR BRAND COLORS], upbeat energy, mobile-optimized vertical format, clear call-to-action'
    },
    {
      id: 'testimonial-video',
      name: 'Customer Success Story',
      icon: Users,
      category: 'Social Proof',
      prompt: 'Authentic customer testimonial video featuring [CUSTOMER TYPE] talking about [YOUR SOLUTION SUCCESS], natural setting, genuine emotions, before/after results, professional interview setup'
    },
    {
      id: 'explainer-video',
      name: 'Explainer Animation',
      icon: Lightbulb,
      category: 'Education',
      prompt: 'Animated explainer video demonstrating [YOUR SERVICE/CONCEPT], simple graphics, smooth transitions, easy-to-understand visuals, [YOUR BRAND COLORS], professional voiceover timing'
    },
    {
      id: 'behind-scenes',
      name: 'Behind the Scenes',
      icon: Camera,
      category: 'Authentic Marketing',
      prompt: 'Behind-the-scenes video of [YOUR BUSINESS/PROCESS], candid moments, team working on [YOUR PRODUCT/SERVICE], authentic workplace atmosphere, documentary-style filming'
    },
    {
      id: 'tutorial-howto',
      name: 'Tutorial & How-To',
      icon: BookOpen,
      category: 'Educational Content',
      prompt: 'Step-by-step tutorial video showing how to [USE YOUR PRODUCT/SOLVE PROBLEM], clear demonstrations, close-up shots of hands/actions, professional instruction pace, helpful graphics'
    },
    {
      id: 'event-coverage',
      name: 'Event Highlights',
      icon: Trophy,
      category: 'Event Marketing',
      prompt: 'Dynamic event highlight reel of [YOUR EVENT/CONFERENCE], energetic crowd shots, key moments, speaker presentations, networking scenes, upbeat background music timing'
    },
    {
      id: 'lifestyle-brand',
      name: 'Lifestyle Brand Video',
      icon: Smile,
      category: 'Lifestyle Marketing',
      prompt: 'Lifestyle video showing [YOUR TARGET AUDIENCE] enjoying [YOUR PRODUCT/SERVICE] in [IDEAL SETTING], aspirational but relatable moments, natural lighting, diverse representation'
    },
    {
      id: 'comparison-video',
      name: 'Product Comparison',
      icon: TrendingUp,
      category: 'Sales Content',
      prompt: 'Professional comparison video showing [YOUR PRODUCT] vs [COMPETITORS/ALTERNATIVES], side-by-side demonstrations, clear advantage highlights, unbiased presentation style'
    },
    // Industry-Specific Templates
    {
      id: 'restaurant-food',
      name: 'Food & Restaurant Promo',
      icon: ChefHat,
      category: 'Food & Beverage',
      prompt: 'Mouth-watering food video of [YOUR SIGNATURE DISH/MENU], steam rising, close-up preparation shots, chef hands cooking, restaurant ambiance, appetizing presentation'
    },
    {
      id: 'fitness-workout',
      name: 'Fitness & Workout',
      icon: Dumbbell,
      category: 'Health & Fitness',
      prompt: 'Motivational fitness video showing [WORKOUT TYPE/EXERCISE], proper form demonstrations, energetic music timing, diverse body types, gym/outdoor setting, inspiring transformations'
    },
    {
      id: 'real-estate',
      name: 'Property Showcase',
      icon: Home,
      category: 'Real Estate',
      prompt: 'Professional property tour video of [PROPERTY TYPE], smooth camera movements through rooms, natural lighting, key features highlighted, neighborhood shots, luxury presentation'
    },
    {
      id: 'automotive',
      name: 'Vehicle Showcase',
      icon: Car,
      category: 'Automotive',
      prompt: 'Dynamic vehicle showcase video of [CAR MODEL/TYPE], cinematic angles, driving shots, interior features, exterior details, showroom lighting, smooth camera movements'
    },
    {
      id: 'tech-software',
      name: 'Software Demo',
      icon: Monitor,
      category: 'Technology',
      prompt: 'Screen recording software demo of [YOUR APP/SOFTWARE], user interface walkthrough, key features highlighted, smooth cursor movements, professional narration pace'
    },
    {
      id: 'music-artist',
      name: 'Music & Performance',
      icon: Music,
      category: 'Entertainment',
      prompt: 'Music video or performance footage of [ARTIST/BAND] performing [SONG/GENRE], dynamic lighting, multiple camera angles, crowd energy, artistic visual effects'
    },
    {
      id: 'travel-tourism',
      name: 'Travel & Tourism',
      icon: MapPin,
      category: 'Travel',
      prompt: 'Stunning travel video showcasing [DESTINATION/LOCATION], breathtaking landscapes, local culture, activities, golden hour lighting, drone shots, wanderlust inspiration'
    },
    {
      id: 'education-course',
      name: 'Educational Course',
      icon: GraduationCap,
      category: 'Education',
      prompt: 'Professional educational video for [COURSE TOPIC/SUBJECT], instructor teaching, student engagement, learning materials, classroom/online setting, knowledge visualization'
    },
    {
      id: 'healthcare-medical',
      name: 'Healthcare & Medical',
      icon: Stethoscope,
      category: 'Healthcare',
      prompt: 'Professional healthcare video about [MEDICAL TOPIC/SERVICE], medical professionals, clean clinical environment, patient care, educational content, trustworthy presentation'
    }
  ];

  // AI Model Options
  const modelOptions = [
    {
      id: 'veo3-fast',
      name: 'Veo 3 Fast',
      description: 'Fast & Cost-Effective',
      credits: 20,
      maxVideos: 625, // For AI Ultra: 12,500 credits ÷ 20 = 625 videos
      features: [
        '5x cheaper than Veo 3 Quality',
        '30% faster generation',
        'Native audio generation',
        'Perfect for social media clips',
        'Great for rapid prototyping'
      ],
      bestFor: 'Social media, quick content, experimentation',
      quality: 'Good - slightly reduced detail but excellent for most uses'
    },
    {
      id: 'veo3-quality',
      name: 'Veo 3 Quality',
      description: 'Premium Quality',
      credits: 100,
      maxVideos: 125, // For AI Ultra: 12,500 credits ÷ 100 = 125 videos
      features: [
        'Cinematic lighting & shadows',
        'Fine detail preservation',
        'Premium skin textures',
        'Professional-grade output',
        'Best for high-end content'
      ],
      bestFor: 'Advertisements, film trailers, premium content',
      quality: 'Excellent - highest quality output'
    }
  ];

  const getDurationOptions = (selectedModel: string) => {
    return [
      {
        id: '5s',
        name: '5 seconds',
        credits: selectedModel === 'veo3-fast' ? 20 : 100,
        description: 'Quick clip'
      },
      {
        id: '8s',
        name: '8 seconds',
        credits: selectedModel === 'veo3-fast' ? 20 : 100,
        description: 'Perfect for social media'
      }
    ];
  };

  const handlePresetClick = (preset: any) => {
    setPrompt(preset.prompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt or select a preset');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedVideo(null);

    try {
      // Convert duration string to seconds for API
      const durationInSeconds = parseInt(duration.replace('s', ''));
      
      console.log('🎬 Starting video generation...');
      const response = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          duration: durationInSeconds,
          model: model, // Pass selected model (veo3-fast or veo3-quality)
          style: 'cinematic',
          enhancePrompt: true 
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Video generation initiated:', data.operationName);
        
        // If we got an operation name, start polling for completion
        if (data.operationName) {
          await pollVideoOperation(data.operationName, data);
        } else {
          // Direct response (mock or immediate result)
          setGeneratedVideo(data);
        }
      } else {
        setError(data.error || 'Failed to generate video');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Poll for video generation completion
  const pollVideoOperation = async (operationName: string, initialData: any) => {
    const maxAttempts = 30; // Maximum 5 minutes (30 attempts * 10 seconds)
    let attempts = 0;

    console.log('🔄 Starting to poll operation:', operationName);

    const poll = async () => {
      attempts++;
      console.log(`🔍 Polling attempt ${attempts}/${maxAttempts}`);

      try {
        const response = await fetch('/api/ai/poll-video-operation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operationName }),
        });

        const pollData = await response.json();

        if (pollData.success && pollData.done) {
          console.log('✅ Video generation completed!');
          
          // Merge the polling result with initial data
          const completedVideo = {
            ...initialData,
            videoUrl: pollData.result.videoUrl,
            thumbnailUrl: pollData.result.thumbnailUrl,
            status: 'completed'
          };

          setGeneratedVideo(completedVideo);
          return;
        }

        if (pollData.success && !pollData.done) {
          console.log('⏳ Video still generating... waiting 10 seconds');
          
          if (attempts < maxAttempts) {
            setTimeout(poll, 10000); // Poll every 10 seconds
          } else {
            console.warn('⚠️ Polling timeout reached');
            setError('Video generation is taking longer than expected. Please try again.');
          }
        } else {
          console.error('❌ Polling failed:', pollData.error);
          setError(pollData.error || 'Failed to check video generation status');
        }
      } catch (pollError) {
        console.error('❌ Polling request failed:', pollError);
        
        if (attempts < maxAttempts) {
          console.log('🔄 Retrying polling in 10 seconds...');
          setTimeout(poll, 10000);
        } else {
          setError('Failed to check video generation status');
        }
      }
    };

    // Start polling
    setTimeout(poll, 5000); // Wait 5 seconds before first poll
  };

  const handleSaveToLibrary = async () => {
    if (!generatedVideo) return;

    setIsSaving(true);
    try {
      const id = `media_${Date.now()}`;
      addFiles([{
        id,
        name: `ai-generated-video-${Date.now()}.mp4`,
        type: 'video',
        url: generatedVideo.videoUrl,
        size: 0,
        uploadedAt: new Date(),
        tags: [],
        aiGenerated: true,
      }]);

      router.push('/content-hub');
    } catch (error) {
      console.error('Error saving to library:', error);
      setError('Failed to save to media library');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!generatedVideo) return;
    
    const link = document.createElement('a');
    link.href = generatedVideo.videoUrl;
    link.download = `ai-generated-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="border-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Video className="h-8 w-8 mr-3 text-pink-400" />
                AI Video Generation
              </h1>
              <p className="text-gray-400">Create stunning marketing videos with AI-powered templates</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Video Marketing Presets */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Video Templates
                </CardTitle>
                <CardDescription>Click any template to populate your prompt, then customize as needed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {videoPresets.map((preset) => {
                    const IconComponent = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetClick(preset)}
                        className="w-full p-3 rounded-lg border border-gray-600 hover:border-pink-500 hover:bg-pink-500/10 transition-all text-left group"
                      >
                        <div className="flex items-start space-x-3">
                          <IconComponent className="h-5 w-5 text-pink-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white group-hover:text-pink-200">{preset.name}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {preset.category}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Prompt */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  Prompt
                </CardTitle>
                <CardDescription>Describe the video you want to create or customize a template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Branding Toggle */}
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1 text-xs text-gray-300 select-none">
                    <input
                      type="checkbox"
                      checked={useBranding}
                      onChange={(e) => setUseBranding(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-pink-500 rounded bg-gray-700 border-gray-600 focus:ring-pink-500" />
                    Use Brand Profile
                  </label>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Select a video template above or write your own prompt..."
                  className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-pink-500"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{prompt.length}/1000 characters</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPrompt}
                    className="border-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {prompt.includes('[') && prompt.includes(']') && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      💡 Tip: Replace text in [brackets] with your specific details for best results
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Duration */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Duration & Format</CardTitle>
                <CardDescription>Choose the video length</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getDurationOptions(model).map((durationOption) => (
                    <div key={durationOption.id} className="relative group">
                      <button
                        onClick={() => setDuration(durationOption.id)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          duration === durationOption.id
                            ? 'border-pink-500 bg-pink-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-white">{durationOption.name}</span>
                            <p className="text-sm text-gray-400">{durationOption.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-green-400">{durationOption.credits} credits</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Model Selection */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">AI Model</CardTitle>
                <CardDescription>Choose between speed or quality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modelOptions.map((modelOption) => (
                    <div key={modelOption.id} className="relative group">
                      <button
                        onClick={() => setModel(modelOption.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          model === modelOption.id
                            ? 'border-pink-500 bg-pink-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{modelOption.name}</h3>
                            <p className="text-sm text-gray-400">{modelOption.description}</p>
                          </div>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {modelOption.credits} credits
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{modelOption.bestFor}</p>
                        <div className="text-xs text-gray-400">
                          <div className="font-medium mb-1">Features:</div>
                          <ul className="list-disc list-inside space-y-0.5">
                            {modelOption.features.slice(0, 2).map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </div>

          {/* Preview and Results */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  Generated Video
                </CardTitle>
                <CardDescription>Your AI-generated video will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <RefreshCw className="h-12 w-12 text-pink-400 animate-spin mx-auto mb-4" />
                      <p className="text-gray-300 mb-2">Generating your video...</p>
                      <p className="text-sm text-gray-400">This may take 1-2 minutes</p>
                    </div>
                  </div>
                )}

                {generatedVideo && (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        controls
                        className="w-full h-full"
                        poster={generatedVideo.thumbnailUrl}
                        preload="metadata"
                      >
                        <source src={generatedVideo.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    {/* Video Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="border-gray-600"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      
                      <Button
                        onClick={handleSaveToLibrary}
                        disabled={isSaving}
                        variant="outline"
                        className="border-blue-600"
                      >
                        {isSaving ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Add to Library
                      </Button>

                      <Button
                        onClick={handleGenerate}
                        variant="outline"
                        className="border-gray-600"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate Another
                      </Button>
                    </div>

                    {/* Video Details */}
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <h3 className="font-semibold text-white mb-2">Generation Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Model:</span>
                          <span className="text-white ml-2">{generatedVideo.model}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white ml-2">{generatedVideo.duration}s</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Style:</span>
                          <span className="text-white ml-2">{generatedVideo.style}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Audio:</span>
                          <span className="text-white ml-2">{generatedVideo.hasAudio ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-gray-400">Prompt:</span>
                        <p className="text-white mt-1 text-sm">{generatedVideo.prompt}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!isGenerating && !generatedVideo && !error && (
                  <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Select a template or enter a prompt to generate your video</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 