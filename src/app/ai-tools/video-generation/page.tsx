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
import { usageService, USAGE_COSTS } from '@/services/usageService';
import { useAuth } from '@/contexts/AuthContext';

const videoPresets = [
  {
    id: 'product-demo',
    name: 'Product Demo Video',
    icon: Target,
    category: 'Product Marketing',
    prompt: 'Professional product demonstration video of [YOUR PRODUCT] showing [KEY FEATURES/BENEFITS], clean studio lighting, smooth camera movements, close-up details, person using the product effectively'
  },
  // ... (rest of the presets)
];

const modelOptions = [
  {
    id: 'veo3-fast',
    name: 'Veo 3 Fast',
    description: 'Fast & Cost-Effective',
    credits: 20,
    maxVideos: 625,
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
    maxVideos: 125,
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

export default function VideoGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('8s');
  const [model, setModel] = useState('veo3-fast');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [useBranding, setUseBranding] = useState(true);

  const router = useRouter();
  const { addFiles } = useMediaStore();
  const { userProfile } = useAuth();

  const handlePresetClick = (preset: any) => {
    setPrompt(preset.prompt);
  };
  
  const handleGenerate = async () => {
    // ... (rest of the function)
  };
  
  // ... (rest of the component)
} 