'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Image as ImageIcon,
  Download, 
  RefreshCw, 
  Copy,
  Sparkles,
  ArrowLeft,
  Save,
  Palette,
  Camera,
  Lightbulb,
  Building,
  ShoppingBag,
  ChefHat,
  Home,
  Car
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/stores/mediaStore';
import { geminiAIService } from '@/services/gemini-ai';
import { usageService, USAGE_COSTS } from '@/services/usageService';
import { useAuth } from '@/contexts/AuthContext';

export default function PhotoGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('imagen-3-fast');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const { addFiles } = useMediaStore();
  const { userProfile } = useAuth();

  const imagePresets = [
    { id: 'product-shot', name: 'Product Showcase', icon: ShoppingBag, category: 'E-commerce', prompt: 'Professional studio product shot of [YOUR PRODUCT], clean background, dramatic lighting, high detail' },
    { id: 'logo-concept', name: 'Logo Concept', icon: Lightbulb, category: 'Branding', prompt: 'Minimalist logo concept for a [INDUSTRY] company named [COMPANY NAME], vector style, [PRIMARY COLOR] and [SECONDARY COLOR]' },
    { id: 'arch-viz', name: 'Architectural Render', icon: Building, category: 'Real Estate', prompt: 'Photorealistic architectural visualization of a modern [BUILDING TYPE] in [LOCATION], golden hour lighting, cinematic' },
    { id: 'food-photo', name: 'Food Photography', icon: ChefHat, category: 'Food & Beverage', prompt: 'Gourmet food photography of [DISH NAME], top-down view, vibrant colors, fresh ingredients visible, rustic wooden table' },
    { id: 'interior-design', name: 'Interior Design', icon: Home, category: 'Real Estate', prompt: 'Cozy interior design of a [ROOM TYPE], Scandinavian style, natural light, house plants, warm textiles' },
    { id: 'vehicle-ad', name: 'Vehicle Advertisement', icon: Car, category: 'Automotive', prompt: 'Cinematic shot of a [CAR MODEL] driving on a winding [ROAD TYPE] road, motion blur, dramatic sunset' },
    { id: 'character-design', name: 'Character Concept', icon: Camera, category: 'Creative', prompt: 'Concept art of a [CHARACTER TYPE] for a fantasy video game, detailed armor, dynamic pose, digital painting' }
  ];

  const modelOptions = [
    { id: 'imagen-3-fast', name: 'Imagen 3 Fast', description: 'Fast & Cost-Effective', credits: 5 },
    { id: 'imagen-3-quality', name: 'Imagen 3 Quality', description: 'Premium Quality', credits: 25 }
  ];

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
    setGeneratedImage(null);

    try {
      // 1. Check usage and handle cost
      const usageResult = await usageService.handleUsage(userProfile, USAGE_COSTS.IMAGE_GENERATION);
      if (!usageResult.success) {
        setError(usageResult.error || 'An unknown error occurred.');
        setIsGenerating(false);
        return;
      }

      // 2. Proceed with generation if usage check passed
      console.log('📸 Starting image generation...');
      const result = await geminiAIService.generateImage(prompt, model);

      if (result.success && result.data) {
        console.log('✅ Image generation successful:', result.data);
        setGeneratedImage(result.data);
      } else {
        setError(result.error || 'Failed to generate image');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedImage) return;

    setIsSaving(true);
    try {
      const id = `media_${Date.now()}`;
      addFiles([{
        id,
        name: `ai-generated-image-${Date.now()}.png`,
        type: 'image',
        url: generatedImage.imageUrl,
        size: 0,
        uploadedAt: new Date(),
        tags: ['ai-generated', model],
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
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage.imageUrl;
    link.download = `ai-generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} className="border-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <ImageIcon className="h-8 w-8 mr-3 text-purple-400" />
                AI Image Generation
              </h1>
              <p className="text-gray-400">Create stunning marketing images with AI-powered templates</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center"><Palette className="h-5 w-5 mr-2" />Image Templates</CardTitle>
                <CardDescription>Click a template to populate your prompt, then customize.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto space-y-2">
                {imagePresets.map((preset) => (
                  <button key={preset.id} onClick={() => handlePresetClick(preset)} className="w-full p-3 rounded-lg border border-gray-600 hover:border-purple-500 hover:bg-purple-500/10 transition-all text-left group">
                    <div className="flex items-start space-x-3">
                      <preset.icon className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white group-hover:text-purple-200">{preset.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">{preset.category}</Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center"><ImageIcon className="h-5 w-5 mr-2" />Prompt</CardTitle>
                <CardDescription>Describe the image you want to create.</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Select a template or write your own prompt..." className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-400">{prompt.length}/1000 characters</span>
                  <Button variant="outline" size="sm" onClick={handleCopyPrompt} className="border-gray-600"><Copy className="h-4 w-4" /></Button>
                </div>
                {prompt.includes('[') && prompt.includes(']') && (
                  <div className="p-3 mt-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-sm">💡 Tip: Replace text in [brackets] with your details.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">AI Model</CardTitle>
                <CardDescription>Choose between speed or quality.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {modelOptions.map((modelOption) => (
                  <button key={modelOption.id} onClick={() => setModel(modelOption.id)} className={`w-full p-4 rounded-lg border-2 transition-all text-left ${model === modelOption.id ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-white">{modelOption.name}</h3>
                      <Badge variant="outline" className="text-green-400 border-green-400">{modelOption.credits} credits</Badge>
                    </div>
                    <p className="text-sm text-gray-400">{modelOption.description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50" size="lg">
              {isGenerating ? <><RefreshCw className="h-5 w-5 mr-2 animate-spin" />Generating Image...</> : <><Sparkles className="h-5 w-5 mr-2" />Generate Image</>}
            </Button>
            <div className="text-center text-xs text-gray-400 mt-2">
              Cost: $0.05 or 5 AI Credits
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center"><ImageIcon className="h-5 w-5 mr-2" />Generated Image</CardTitle>
                <CardDescription>Your AI-generated image will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4"><p className="text-red-400">{error}</p></div>}
                <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  {isGenerating ? (
                    <div className="text-center">
                      <RefreshCw className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
                      <p className="text-gray-300">Generating your image...</p>
                    </div>
                  ) : generatedImage ? (
                    <img src={generatedImage.imageUrl} alt="AI Generated" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Select a template or enter a prompt to generate your image.</p>
                    </div>
                  )}
                </div>
                {generatedImage && (
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleDownload} variant="outline" className="border-gray-600"><Download className="h-4 w-4 mr-2" />Download</Button>
                    <Button onClick={handleSaveToLibrary} disabled={isSaving} variant="outline" className="border-blue-600">{isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Add to Library</Button>
                    <Button onClick={handleGenerate} variant="outline" className="border-gray-600"><RefreshCw className="h-4 w-4 mr-2" />Generate Another</Button>
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
