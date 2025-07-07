'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload,
  Download, 
  RefreshCw, 
  Copy, 
  Check,
  Wand2,
  Image as ImageIcon,
  ArrowLeft,
  RotateCcw,
  ChevronDown,
  Sparkles,
  Palette,
  Camera,
  Sun,
  Moon,
  Eye,
  Smile,
  Target,
  Layers,
  Maximize,
  TreePine,
  Building,
  Coffee,
  Heart,
  Star,
  Flower,
  Car,
  Mountain,
  Waves,
  Scissors,
  Filter,
  Paintbrush,
  Crop,
  Eraser,
  Move,
  Zap,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/stores/mediaStore';

export default function PhotoEditorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedImage, setEditedImage] = useState<{
    base64: string;
    mimeType: string;
    modelUsed?: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showPresets, setShowPresets] = useState(false);
  const [useBranding, setUseBranding] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { addFiles } = useMediaStore();

  // Comprehensive editing presets that demonstrate all capabilities
  const editingPresets = [
    {
      id: 'enhance-colors',
      name: 'Enhance Colors & Vibrancy',
      icon: Palette,
      category: 'Enhancement',
      prompt: 'Enhance the colors and vibrancy of this image, making it more vivid and eye-catching while maintaining natural tones and realistic saturation levels'
    },
    {
      id: 'professional-portrait',
      name: 'Professional Portrait Retouch',
      icon: Eye,
      category: 'Portrait',
      prompt: 'Apply professional portrait retouching: smooth skin naturally, brighten eyes, enhance facial features, and create studio-quality lighting while keeping the person looking authentic'
    },
    {
      id: 'remove-background',
      name: 'Remove Background (Transparent)',
      icon: Layers,
      category: 'Background',
      prompt: 'Remove the background completely, leaving only the main subject with clean edges for a transparent background suitable for professional use'
    },
    {
      id: 'studio-background',
      name: 'Professional Studio Background',
      icon: Camera,
      category: 'Background',
      prompt: 'Replace the background with a clean, professional studio backdrop with soft gradient lighting in neutral colors for a corporate or headshot look'
    },
    {
      id: 'golden-hour',
      name: 'Golden Hour Lighting',
      icon: Sun,
      category: 'Lighting',
      prompt: 'Transform the lighting to beautiful golden hour with warm, soft sunlight casting gentle shadows and creating a magical, romantic atmosphere'
    },
    {
      id: 'artistic-oil-painting',
      name: 'Oil Painting Style',
      icon: Paintbrush,
      category: 'Artistic',
      prompt: 'Convert this photo into a beautiful oil painting with visible brushstrokes, rich textures, and artistic interpretation while preserving the subject\'s essence'
    },
    {
      id: 'vintage-film',
      name: 'Vintage Film Look',
      icon: Camera,
      category: 'Style',
      prompt: 'Apply a vintage 1970s film aesthetic with warm color grading, subtle grain, soft contrast, and nostalgic atmosphere reminiscent of classic photography'
    },
    {
      id: 'dramatic-lighting',
      name: 'Dramatic Cinematic Lighting',
      icon: Zap,
      category: 'Lighting',
      prompt: 'Create dramatic cinematic lighting with strong contrast, moody shadows, and film-like atmosphere for a professional movie poster aesthetic'
    },
    {
      id: 'add-flowers',
      name: 'Add Beautiful Flowers',
      icon: Flower,
      category: 'Object Addition',
      prompt: 'Add beautiful, colorful flowers in the foreground and background that complement the scene naturally, creating a romantic and vibrant garden atmosphere'
    },
    {
      id: 'expand-landscape',
      name: 'Expand to Panoramic View',
      icon: Mountain,
      category: 'Expansion',
      prompt: 'Expand this image horizontally to create a wider panoramic view, seamlessly extending the landscape, sky, and background elements with consistent perspective'
    },
    {
      id: 'seasonal-winter',
      name: 'Add Winter Snow Scene',
      icon: Sparkles,
      category: 'Seasonal',
      prompt: 'Transform this into a beautiful winter scene by adding falling snow, frost effects, and winter atmosphere while keeping the main subject intact'
    },
    {
      id: 'city-backdrop',
      name: 'Modern City Backdrop',
      icon: Building,
      category: 'Background',
      prompt: 'Replace the background with a stunning modern city skyline at sunset, with glowing windows and urban atmosphere that complements the subject'
    },
    {
      id: 'beach-paradise',
      name: 'Tropical Beach Paradise',
      icon: Waves,
      category: 'Background',
      prompt: 'Transport the subject to a tropical beach paradise with crystal clear blue water, white sand, palm trees, and perfect sunny weather'
    },
    {
      id: 'fashion-editorial',
      name: 'Fashion Magazine Style',
      icon: Star,
      category: 'Fashion',
      prompt: 'Apply high-fashion editorial styling with perfect lighting, enhanced colors, professional makeup look, and magazine-quality finishing touches'
    },
    {
      id: 'remove-objects',
      name: 'Remove Unwanted Objects',
      icon: Eraser,
      category: 'Object Removal',
      prompt: 'Remove any unwanted objects, people, or distracting elements from the background while seamlessly filling in the areas with appropriate content'
    },
    {
      id: 'add-accessories',
      name: 'Add Stylish Accessories',
      icon: Heart,
      category: 'Fashion',
      prompt: 'Add fashionable accessories like elegant jewelry, stylish sunglasses, or trendy items that enhance the person\'s look and style naturally'
    },
    {
      id: 'nature-forest',
      name: 'Enchanted Forest Setting',
      icon: TreePine,
      category: 'Background',
      prompt: 'Place the subject in a magical enchanted forest with tall trees, dappled sunlight, mystical atmosphere, and natural beauty'
    },
    {
      id: 'hdr-effect',
      name: 'HDR Enhancement',
      icon: Sun,
      category: 'Enhancement',
      prompt: 'Apply HDR processing to enhance dynamic range, bringing out details in both shadows and highlights for a more vivid and balanced exposure'
    },
    {
      id: 'black-white-artistic',
      name: 'Artistic Black & White',
      icon: Moon,
      category: 'Artistic',
      prompt: 'Convert to stunning black and white with dramatic contrast, perfect tonal range, and artistic film-like quality that emphasizes emotion and composition'
    },
    {
      id: 'cozy-cafe',
      name: 'Cozy Cafe Atmosphere',
      icon: Coffee,
      category: 'Background',
      prompt: 'Set the scene in a warm, cozy coffee shop with soft lighting, wooden textures, and inviting atmosphere perfect for lifestyle photography'
    },
    {
      id: 'superhero-style',
      name: 'Superhero Movie Style',
      icon: Zap,
      category: 'Creative',
      prompt: 'Transform into epic superhero movie style with dramatic lighting, action-ready pose enhancement, and cinematic effects worthy of a blockbuster poster'
    },
    {
      id: 'wedding-romantic',
      name: 'Romantic Wedding Style',
      icon: Heart,
      category: 'Wedding',
      prompt: 'Apply romantic wedding photography style with soft, dreamy lighting, gentle color grading, and ethereal atmosphere perfect for special moments'
    },
    {
      id: 'product-showcase',
      name: 'Product Showcase Style',
      icon: Star,
      category: 'Commercial',
      prompt: 'Transform into professional product photography with clean background, perfect lighting, and commercial-quality presentation ideal for marketing'
    },
    {
      id: 'car-showroom',
      name: 'Luxury Car Showroom',
      icon: Car,
      category: 'Automotive',
      prompt: 'Place in a luxury car showroom setting with premium lighting, reflective surfaces, and high-end automotive photography aesthetics'
    },
    {
      id: 'fitness-energy',
      name: 'Dynamic Fitness Energy',
      icon: Zap,
      category: 'Fitness',
      prompt: 'Add dynamic energy effects, motion blur, and athletic atmosphere to create an inspiring fitness and sports photography look'
    },
    {
      id: 'food-styling',
      name: 'Gourmet Food Styling',
      icon: Coffee,
      category: 'Food',
      prompt: 'Apply professional food photography styling with perfect lighting, appetizing colors, and restaurant-quality presentation that makes food look irresistible'
    },
    {
      id: 'travel-postcard',
      name: 'Travel Postcard Perfect',
      icon: Mountain,
      category: 'Travel',
      prompt: 'Create the perfect travel postcard look with vibrant colors, clear skies, and that "wish you were here" aesthetic that captures wanderlust'
    },
    {
      id: 'pet-portrait',
      name: 'Professional Pet Portrait',
      icon: Heart,
      category: 'Pet',
      prompt: 'Apply professional pet photography techniques with perfect focus on the animal, soft background blur, and lighting that brings out their personality'
    },
    {
      id: 'age-progression',
      name: 'Subtle Age Enhancement',
      icon: Sparkles,
      category: 'Portrait',
      prompt: 'Apply subtle age enhancement or reduction effects naturally, adjusting skin texture, hair, and facial features while maintaining the person\'s authentic appearance'
    },
    {
      id: 'expand-room',
      name: 'Expand Interior Space',
      icon: Maximize,
      category: 'Expansion',
      prompt: 'Expand this interior space to show more of the room, adding consistent architecture, furniture, and decor that matches the existing style and lighting'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setError('');
        setEditedImage(null);
      } else {
        setError('Please select a valid image file (JPG, PNG, GIF, etc.)');
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError('');
      setEditedImage(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handlePresetClick = (preset: any) => {
    setPrompt(preset.prompt);
    setSelectedPreset(preset.id);
    setShowPresets(false);
  };

  const handleEdit = async () => {
    if (!selectedFile || !prompt.trim()) {
      setError('Please upload an image and enter editing instructions');
      return;
    }

    setIsEditing(true);
    setError('');

    try {
      // Convert file to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:image/... prefix
        };
        reader.readAsDataURL(selectedFile);
      });

      // Determine editing mode based on prompt content for better model selection
      const promptLower = prompt.toLowerCase();
      let editingMode = 'general';
      
      if (promptLower.includes('background') || promptLower.includes('remove background')) {
        editingMode = 'background';
      } else if (promptLower.includes('add') || promptLower.includes('insert')) {
        editingMode = 'inpaint';
      } else if (promptLower.includes('extend') || promptLower.includes('expand')) {
        editingMode = 'outpaint';
      } else if (promptLower.includes('enhance') || promptLower.includes('improve')) {
        editingMode = 'enhance';
      }

      const requestBody = {
        image: base64Image,
        prompt: prompt,
        editingMode: editingMode,
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          personGeneration: "allow_adult"
        }
      };

      const response = await fetch('/api/ai/edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Log which model was used for transparency
      if (data.metadata?.modelUsed) {
        console.log(`Image edited using model: ${data.metadata.modelUsed}`);
      }
      
      if (data.predictions && data.predictions.length > 0) {
        const editedImageData = data.predictions[0];
        setEditedImage({
          base64: editedImageData.bytesBase64Encoded,
          mimeType: editedImageData.mimeType || 'image/png',
          modelUsed: data.metadata?.modelUsed || 'Unknown'
        });
      } else {
        throw new Error('No edited image received from the API');
      }

    } catch (error) {
      console.error('Error editing image:', error);
      setError(error instanceof Error ? error.message : 'Failed to edit image. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleAddToLibrary = () => {
    if (!editedImage) return;

    // Convert base64 to Blob and create object URL
    const byteCharacters = atob(editedImage.base64);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: editedImage.mimeType });
    const objectUrl = URL.createObjectURL(blob);

    const id = `media_${Date.now()}`;
    addFiles([{
      id,
      name: `edited_image_${Date.now()}.png`,
      type: 'image',
      url: objectUrl,
      size: blob.size,
      uploadedAt: new Date(),
      tags: [],
      aiGenerated: true,
    }]);

    router.push('/content-hub');
  };

  const handleDownload = () => {
    if (editedImage) {
      const link = document.createElement('a');
      link.href = `data:${editedImage.mimeType};base64,${editedImage.base64}`;
      link.download = `edited_image_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setPrompt('');
    setEditedImage(null);
    setError('');
    setSelectedPreset('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="border-gray-600 hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Photo Editor</h1>
              <p className="text-gray-400">Professional photo editing powered by Imagen for Editing & Customization (Imagen 3.0 Capability)</p>
            </div>
          </div>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="border-gray-600 hover:bg-gray-800"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Upload className="h-5 w-5 text-purple-400" />
                  Upload Photo
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Select an image to edit with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, GIF, WebP</p>
                </div>
              </CardContent>
            </Card>

            {/* Capabilities Info */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  AI Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    'Background Removal',
                    'Style Transfer',
                    'Object Addition',
                    'Image Enhancement',
                    'Lighting Changes',
                    'Color Grading',
                    'Portrait Retouching',
                    'Scene Expansion',
                    'Object Removal',
                    'Artistic Effects',
                    'Professional Touch',
                    'Creative Edits'
                  ].map((capability) => (
                    <div key={capability} className="flex items-center gap-2 text-gray-300">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      {capability}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Editing Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Preview */}
            {(previewUrl || editedImage) && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editedImage ? 'Edited Result' : 'Original Image'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewUrl && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Original</h4>
                        <img
                          src={previewUrl}
                          alt="Original"
                          className="w-full h-64 object-contain bg-gray-900 rounded-lg"
                        />
                      </div>
                    )}
                    {editedImage && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-gray-400">Edited</h4>
                            {editedImage.modelUsed && (
                              <div className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
                                {editedImage.modelUsed}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleDownload}
                              size="sm"
                              variant="outline"
                              className="border-gray-600 hover:bg-gray-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              onClick={handleAddToLibrary}
                              size="sm"
                              variant="outline"
                              className="border-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Library
                            </Button>
                          </div>
                        </div>
                        <img
                          src={`data:${editedImage.mimeType};base64,${editedImage.base64}`}
                          alt="Edited"
                          className="w-full h-64 object-contain bg-gray-900 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Editing Prompt */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Editing Instructions</CardTitle>
                <CardDescription className="text-gray-400">
                  Describe what you want to do with natural language or choose a preset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Dropdown */}
                <div className="relative">
                  <Button
                    onClick={() => setShowPresets(!showPresets)}
                    variant="outline"
                    className="w-full justify-between border-gray-600 hover:bg-gray-700 text-white"
                  >
                    {selectedPreset ? 
                      editingPresets.find(p => p.id === selectedPreset)?.name || 'Choose a preset...' 
                      : 'Choose a preset...'
                    }
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {showPresets && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                      {editingPresets.map((preset) => {
                        const IconComponent = preset.icon;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => handlePresetClick(preset)}
                            className="w-full p-4 text-left hover:bg-gray-700 border-b border-gray-600 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <IconComponent className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white">{preset.name}</div>
                                <div className="text-xs text-purple-300 mb-1">{preset.category}</div>
                                <div className="text-sm text-gray-400 line-clamp-2">{preset.prompt}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Custom Prompt Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Your Instructions</label>
                    <Button
                      onClick={handleCopyPrompt}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      disabled={!prompt}
                    >
                      {copiedPrompt ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copiedPrompt ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe how you want to edit your photo in natural language... (e.g., 'Make the colors more vibrant and add a warm sunset glow' or 'Remove the background and replace with a professional studio backdrop')"
                    className="w-full h-32 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                  />
                  <div className="text-xs text-gray-500">
                    <strong>Tips:</strong> Be specific and descriptive. You can ask for background changes, object additions/removals, style transfers, lighting adjustments, or any creative edit you can imagine.
                  </div>
                </div>

                {/* Branding Toggle & Edit Button */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1 text-xs text-gray-300 select-none">
                    <input
                      type="checkbox"
                      checked={useBranding}
                      onChange={(e) => setUseBranding(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-purple-500 rounded bg-gray-700 border-gray-600 focus:ring-purple-500" />
                    Use Brand Profile
                  </label>
                  <Button
                    onClick={handleEdit}
                    disabled={isEditing || !selectedFile || !prompt.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isEditing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing with AI...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Edit Photo with AI
                      </>
                    )}
                  </Button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">⚠️</span>
                      {error}
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