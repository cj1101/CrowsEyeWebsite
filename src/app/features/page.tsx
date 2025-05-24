'use client'

import React from 'react'
import Link from 'next/link'
import {
  FolderIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  FilmIcon,
  MusicalNoteIcon,
  ScissorsIcon,
  PhotoIcon,
  ChartBarIcon,
  UsersIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

export default function Features() {
  const coreFeatures = [
    {
      icon: FolderIcon,
      title: "Intelligent Media Library",
      subtitle: "The foundation of your creative workflow",
      features: [
        "Universal Uploads: Seamlessly upload raw photos, videos, and existing post-ready media",
        "Smart Categorization: Automatic sorting into &lsquo;Raw Photos,&rsquo; &lsquo;Raw Videos,&rsquo; and &lsquo;Post-Ready Content&rsquo;",
        "Carousel Creator: Build engaging multi-image carousels directly from your raw uploads",
        "Desktop App Power: Unlimited local media uploads with our desktop application"
      ]
    },
    {
      icon: CpuChipIcon,
      title: "AI-Powered Gallery & Caption Generation",
      subtitle: "Let AI be your creative assistant",
      features: [
        "Smart Gallery Curation: Auto-generate galleries with natural language prompts",
        "Automatic Photo Enhancement: Optional toggle to improve visual quality",
        "Intelligent Multi-Language Captions: Generate engaging captions with tone prompts",
        "Powered by Google's Gemini AI for advanced image analysis",
        "Full Creative Control: Always override and refine AI suggestions"
      ]
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "Perfect Post Formatting",
      subtitle: "Ensure your content looks its best on every platform",
      features: [
        "Flexible Post Types: Single Image posts, Carousels, or Stories",
        "Story Optimization: Automatic vertical optimization for full-screen impact",
        "Caption Overlays: Non-distracting text overlays with adaptive colors",
        "Platform-Perfect Formatting: Optimized for Instagram and Facebook"
      ]
    },
    {
      icon: GlobeAltIcon,
      title: "Global-Ready Interface",
      subtitle: "Work in the language that works for you",
      features: [
        "Intuitive Language Selection: Dropdown menu in main header",
        "Comprehensive Translation: Entire interface translated seamlessly",
        "12+ Supported Languages: English, Spanish, French, German, Dutch, Portuguese, Italian, Mandarin, Cantonese, Japanese, Korean, Russian",
        "Native Display: Language names shown in their native scripts"
      ]
    },
    {
      icon: MagnifyingGlassIcon,
      title: "Smart Media Search",
      subtitle: "Find your assets in seconds",
      features: [
        "Content-Aware Search: Like Google Photos, search by describing content",
        "Prompt-Based Filtering: Natural language prompts to refine searches",
        "Advanced Recognition: Find specific elements, people, objects, and scenes",
        "Instant Results: Lightning-fast search across your entire media library"
      ]
    }
  ]

  const proFeatures = [
    {
      icon: FilmIcon,
      title: "Highlight Reel Generator",
      subtitle: "Transform long videos into captivating short clips",
      features: [
        "AI-Powered Editing: Upload longer videos and create engaging highlight reels",
        "Content-Specific Prompts: Direct AI with specific instructions",
        "Flexible Download: Available on both desktop and web platforms",
        "Custom Length: Default 30s with customizable duration options"
      ]
    },
    {
      icon: MusicalNoteIcon,
      title: "Audio Importer & Editor",
      subtitle: "Perfect the sound of your video content",
      features: [
        "Easy Upload: Dedicated UI for MP3, WAV, and other audio formats",
        "Natural Language Editing: Control volume, tone, duration with text prompts",
        "Versatile Application: Support for Instagram Reels and Stories",
        "Professional Quality: Studio-grade audio processing"
      ]
    },
    {
      icon: ScissorsIcon,
      title: "Story Assistant",
      subtitle: "Optimize long-form videos for engaging Stories",
      features: [
        "Smart Video Slicing: Automatically create sub-60-second clips",
        "Automatic Vertical Formatting: Perfect for story viewing",
        "Integrated Overlays: Add CTAs and captions to story clips",
        "Mobile-Friendly Download: Easy transfer to mobile devices"
      ]
    },
    {
      icon: PhotoIcon,
      title: "Reel Thumbnail Selector",
      subtitle: "Choose the perfect first impression",
      features: [
        "AI-Suggested Thumbnails: Automatic suggestions after video generation",
        "Manual Selection: Choose from AI suggestions or upload custom thumbnails",
        "Optimization Tools: Enhance thumbnails for maximum engagement",
        "A/B Testing: Compare different thumbnails for best performance"
      ]
    },
    {
      icon: ChartBarIcon,
      title: "Post Performance Graphs",
      subtitle: "Understand what resonates with your audience",
      features: [
        "Direct Engagement Tracking: Monitor interactions within the app",
        "Performance Analytics: Detailed metrics on reach, engagement, and more",
        "Data Export: CSV and JSON formats for further analysis",
        "Trend Analysis: Identify patterns in your content performance"
      ]
    }
  ]

  const agentFeatures = [
    {
      icon: UsersIcon,
      title: "Multi-User & Multi-Account Management",
      subtitle: "Collaborate efficiently and manage multiple client profiles",
      features: [
        "Shared Workspaces: Create collaborative media libraries and projects",
        "Simple Invitations: Invite team members or clients via link",
        "Role-Based Permissions: Assign Admin, Editor roles with distinct capabilities",
        "Invite Expiration: Optional security with time-limited invitations"
      ]
    },
    {
      icon: RocketLaunchIcon,
      title: "Highest Usage Limits & Priority Support",
      subtitle: "Scale your operations without interruption",
      features: [
        "Generous Web Platform Limits: Substantially increased cloud storage",
        "Unlimited AI Generation: Effectively unlimited within fair use",
        "Priority Support: Faster, dedicated support for queries and issues",
        "Agency-Tailored Features: Custom solutions for marketing agencies"
      ]
    }
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Crow&apos;s Eye Features
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Unleash Your Creative Potential
          </p>
          <p className="text-lg text-gray-400 mt-4 max-w-4xl mx-auto">
            Discover the powerful suite of AI-driven tools designed to help you organize, create, 
            and publish exceptional social media content for Instagram and Facebook.
          </p>
        </div>

        {/* Core Platform Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Core Platform
            </h2>
            <p className="text-lg text-gray-300">
              Included in All Tiers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="feature-card rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <feature.icon className="h-10 w-10 text-primary-500 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {feature.subtitle}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tier Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Pro Tier Features
            </h2>
            <p className="text-lg text-gray-300">
              Upgrade to Pro for advanced video, audio, and analytics capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {proFeatures.map((feature, index) => (
              <div key={index} className="feature-card rounded-lg p-8 border-primary-500/50">
                <div className="flex items-center mb-6">
                  <feature.icon className="h-10 w-10 text-primary-400 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      ✨ {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {feature.subtitle}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Agent Tier Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Agent Tier Features
            </h2>
            <p className="text-lg text-gray-300">
              Designed for marketing agencies, social media managers, and teams requiring collaboration and scale
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {agentFeatures.map((feature, index) => (
              <div key={index} className="feature-card rounded-lg p-8 border-yellow-500/50">
                <div className="flex items-center mb-6">
                  <feature.icon className="h-10 w-10 text-yellow-400 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      🚀 {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {feature.subtitle}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-primary-900/20 to-primary-600/20 rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Choose the plan that fits your creative workflow and start building exceptional content today.
          </p>
          <Link
            href="/pricing"
            className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover-glow transition-all duration-300 inline-block"
          >
            Compare Plans & Pricing
          </Link>
        </section>
      </div>
    </div>
  )
} 