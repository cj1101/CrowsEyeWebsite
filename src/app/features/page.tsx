'use client'

import React from 'react'
import { Eye, Zap, Edit3, Film, Layers, Globe, BarChart2, Settings, Bot } from 'lucide-react'

const features = [
  {
    icon: <Bot className="h-10 w-10 text-primary-500" />,
    title: "Advanced AI Content Generation (Google's Gemini)",
    description: "Deep analysis of images/videos for context-aware captions, posts, and narratives. Identifies subjects, settings, mood, and themes.",
    category: "AI & Content Creation"
  },
  {
    icon: <Edit3 className="h-10 w-10 text-primary-500" />,
    title: "AI-Instructed Media Editing",
    description: "Edit images using natural language commands. Enhance your visuals without complex software.",
    category: "AI & Content Creation"
  },
  {
    icon: <Film className="h-10 w-10 text-primary-500" />,
    title: "Video Processing Suite",
    description: "Generate highlight reels, overlay audio, and select optimal thumbnails for your video content.",
    category: "AI & Content Creation"
  },
  {
    icon: <Layers className="h-10 w-10 text-primary-500" />,
    title: "Unified Multi-Platform Management",
    description: "Direct posting and management for Instagram & Facebook. Foundational support for LinkedIn & X, ready for expansion.",
    category: "Platform Management"
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-primary-500" />,
    title: "Integrated Performance Analytics",
    description: "Track your content performance with integrated Meta Insights for Instagram and Facebook directly within the application.",
    category: "Platform Management"
  },
  {
    icon: <Zap className="h-10 w-10 text-primary-500" />,
    title: "Streamlined Workflow & Productivity",
    description: "Utilize the Preset Manager and Context Files (brand guidelines, product info) to ensure on-brand, efficient AI output.",
    category: "Workflow & Productivity"
  },
  {
    icon: <Eye className="h-10 w-10 text-primary-500" />,
    title: "Comprehensive Media Library",
    description: "AI-assisted tagging, upload, organization, and preview capabilities for all your media assets.",
    category: "Workflow & Productivity"
  },
  {
    icon: <Globe className="h-10 w-10 text-primary-500" />,
    title: "Internationalization Support",
    description: "Reach a global audience with support for ten languages: English, Arabic, German, Spanish, French, Hindi, Japanese, Portuguese, Russian, and Chinese.",
    category: "General"
  },
  {
    icon: <Settings className="h-10 w-10 text-primary-500" />,
    title: "Secure Desktop Application",
    description: "Enjoy robust local processing for media and enhanced control over your data with a dedicated desktop command center.",
    category: "General"
  }
];

// Features now displayed in a simple 3x3 grid

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-crowseye-dark via-crowseye-dark-light to-black text-white">
      <section className="py-20 pt-32 md:py-28 md:pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            The <span className="text-white">Crow&apos;s Eye</span> Marketing Suite
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Unlock unparalleled content creation and social media management with the power of Google&apos;s Gemini AI.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="feature-card-alt bg-black/30 backdrop-blur-sm p-8 rounded-xl shadow-2xl hover:shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center mb-6 w-16 h-16 bg-primary-500/10 rounded-full mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-400 text-sm text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx global>{`
        .feature-card-alt {
          border: 1px solid rgba(var(--color-primary-500-rgb), 0.1);
        }
        .feature-card-alt:hover {
          border: 1px solid rgba(var(--color-primary-500-rgb), 0.3);
        }
        .gradient-text {
          background: -webkit-linear-gradient(45deg, var(--color-primary-500), var(--color-primary-400));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  )
} 