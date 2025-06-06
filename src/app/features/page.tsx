'use client'

import React from 'react'
import { Eye, Zap, Edit3, Film, Layers, Globe, BarChart2, Settings, Bot, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: <Bot className="h-8 w-8 text-purple-400" />,
    title: "Advanced AI Content Generation",
    subtitle: "Powered by Google's Gemini",
    description: "Deep analysis of images/videos for context-aware captions, posts, and narratives. Identifies subjects, settings, mood, and themes with unmatched precision.",
    category: "AI & Content Creation",
    highlight: true
  },
  {
    icon: <Edit3 className="h-8 w-8 text-blue-400" />,
    title: "AI-Instructed Media Editing",
    subtitle: "Natural Language Commands",
    description: "Transform your visuals using simple text commands. No complex software needed—just describe what you want, and our AI handles the rest.",
    category: "AI & Content Creation"
  },
  {
    icon: <Film className="h-8 w-8 text-green-400" />,
    title: "Video Processing Suite",
    subtitle: "Professional-Grade Tools",
    description: "Generate highlight reels, overlay audio, and select optimal thumbnails. Turn raw footage into engaging content that captivates your audience.",
    category: "AI & Content Creation"
  },
  {
    icon: <Layers className="h-8 w-8 text-orange-400" />,
    title: "Multi-Platform Management",
    subtitle: "Unified Dashboard",
    description: "Direct posting and management for Instagram & Facebook. Foundational support for LinkedIn & X, with seamless expansion capabilities.",
    category: "Platform Management"
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-red-400" />,
    title: "Performance Analytics",
    subtitle: "Data-Driven Insights",
    description: "Track your content performance with integrated Meta Insights. Make informed decisions with real-time analytics and engagement metrics.",
    category: "Platform Management"
  },
  {
    icon: <Zap className="h-8 w-8 text-yellow-400" />,
    title: "Streamlined Workflow",
    subtitle: "Maximum Productivity",
    description: "Utilize the Preset Manager and Context Files to maintain brand consistency. Automated workflows that save time and ensure quality.",
    category: "Workflow & Productivity"
  },
  {
    icon: <Eye className="h-8 w-8 text-indigo-400" />,
    title: "Comprehensive Media Library",
    subtitle: "Smart Organization",
    description: "AI-assisted tagging, intelligent organization, and instant preview capabilities. Find and manage your media assets effortlessly.",
    category: "Workflow & Productivity"
  },
  {
    icon: <Globe className="h-8 w-8 text-teal-400" />,
    title: "Global Reach",
    subtitle: "10 Languages Supported",
    description: "Connect with audiences worldwide in English, Arabic, German, Spanish, French, Hindi, Japanese, Portuguese, Russian, and Chinese.",
    category: "General"
  },
  {
    icon: <Settings className="h-8 w-8 text-pink-400" />,
    title: "Secure Desktop Application",
    subtitle: "Privacy-First Approach",
    description: "Robust local processing for enhanced security and performance. Complete control over your data with enterprise-grade protection.",
    category: "General"
  }
];

const categories = [
  {
    name: "AI & Content Creation",
    description: "Cutting-edge artificial intelligence tools",
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Platform Management", 
    description: "Multi-platform social media control",
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Workflow & Productivity",
    description: "Streamlined content workflows",
    color: "from-green-500 to-emerald-500"
  },
  {
    name: "General",
    description: "Core platform capabilities",
    color: "from-orange-500 to-red-500"
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
            <Eye className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">The Crow's Eye Advantage</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Powerful Features
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Built for Creators
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Unlock the full potential of AI-powered marketing with Google's Gemini integration. 
            Every feature is designed to amplify your creative vision and streamline your workflow.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 ${
                  feature.highlight ? 'ring-2 ring-purple-500/50' : ''
                }`}
              >
                {feature.highlight && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-purple-300 font-medium">{feature.subtitle}</p>
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-6">
                  {feature.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm px-3 py-1 bg-white/10 rounded-full text-gray-300">
                    {feature.category}
                  </span>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Feature Categories</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Organized by purpose, designed for impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div 
                key={category.name}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg mb-4 flex items-center justify-center`}>
                  <span className="text-white font-bold text-xl">
                    {features.filter(f => f.category === category.name).length}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{category.name}</h3>
                <p className="text-gray-400 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Experience the Power?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who have already transformed their social media strategy with Crow's Eye.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/demo" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
              >
                <Eye className="h-5 w-5" />
                Try Live Demo
              </a>
              <a 
                href="/download" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                <ArrowRight className="h-5 w-5" />
                Download Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 