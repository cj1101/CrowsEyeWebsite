'use client'

import React from 'react'
import Link from 'next/link'
import { 
  CpuChipIcon, 
  PhotoIcon, 
  DevicePhoneMobileIcon, 
  GlobeAltIcon,
  ClockIcon,
  TrophyIcon,
  FolderIcon,
  SparklesIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const keyFeatures = [
    {
      icon: CpuChipIcon,
      title: "Smart Media Library",
      description: "Automatically organize all your creative assets. Find anything instantly with natural language search."
    },
    {
      icon: SparklesIcon,
      title: "AI-Powered Creation",
      description: "Generate stunning galleries and compelling, multi-language captions with AI. Guide the creativity with simple prompts."
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "Perfect Post Formatting",
      description: "Optimize content for single posts, carousels, or stories. Includes vertical optimization and non-distracting caption overlays."
    },
    {
      icon: GlobeAltIcon,
      title: "Global Reach",
      description: "Work in your preferred language with a seamlessly translated interface across multiple languages."
    }
  ]

  const benefits = [
    {
      icon: ClockIcon,
      title: "Save Time, Create More",
      description: "Automate tedious tasks and spend more time on your creative vision."
    },
    {
      icon: TrophyIcon,
      title: "Elevate Your Content",
      description: "Leverage AI to produce higher quality, more engaging posts that resonate with your audience."
    },
    {
      icon: FolderIcon,
      title: "Stay Organized",
      description: "Never lose a great piece of content again with our intelligent media library."
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-crowseye-dark via-crowseye-dark-light to-black min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-primary-500/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              <span className="gradient-text">Crow&apos;s Eye:</span><br />
              AI-Powered Marketing Automation<br />
              <span className="text-3xl md:text-5xl lg:text-6xl">for Visionary Creators</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Effortlessly organize, create, and publish stunning visual content for Instagram and Facebook. 
              Let AI be your creative partner.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/download"
                className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover-glow transition-all duration-300 inline-block"
              >
                Download Desktop App (Free)
              </Link>
              <Link
                href="/pricing"
                className="border border-primary-500 text-primary-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500/10 transition-all duration-300 inline-block"
              >
                Explore Web Platform
              </Link>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-4">
                Tired of the content treadmill?
              </h2>
              <p className="text-lg text-gray-300 mb-2">
                Drowning in media files? Struggling to keep up with engaging posts?
              </p>
            </div>
            
            <div className="border-t border-primary-600/30 pt-8">
              <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">
                Crow&apos;s Eye streamlines your workflow
              </h2>
              <p className="text-lg text-gray-300">
                with intelligent media management, AI-driven content generation, and seamless publishing tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gradient-to-b from-black/50 to-crowseye-dark-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Key Features Overview
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Discover the powerful tools that make Crow&apos;s Eye the ultimate creative partner
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="feature-card rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-20 bg-gradient-to-r from-green-900/20 to-green-600/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary-600/20 to-primary-500/20 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Download the full desktop application now. Free core features, unlimited local storage, 
              and complete privacy control over your creative assets.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/download"
                className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover-glow transition-all duration-300 inline-flex items-center gap-3"
              >
                <ArrowDownTrayIcon className="h-6 w-6" />
                Download Desktop App (Free)
              </Link>
              <Link
                href="https://github.com/cj1101/offlineFinal"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-primary-500 text-primary-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500/10 transition-all duration-300 inline-block"
              >
                View on GitHub
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-green-400 font-semibold mb-2">✓ Free Core Features</div>
                <div className="text-gray-300 text-sm">Media library, AI generation, basic posting</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-green-400 font-semibold mb-2">✓ No Upload Limits</div>
                <div className="text-gray-300 text-sm">Store unlimited content locally</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-green-400 font-semibold mb-2">✓ Open Source</div>
                <div className="text-gray-300 text-sm">MIT license, full transparency</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Break / App Mockup Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900/20 to-primary-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary-600/20 to-primary-500/20 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              See Crow&apos;s Eye in Action
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Experience the clean, intuitive interface designed for creators
            </p>
            
            {/* Placeholder for app mockup */}
            <div className="bg-black/50 border border-primary-500/30 rounded-lg p-8 max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PhotoIcon className="h-16 w-16 text-primary-500 mx-auto mb-4" />
                  <p className="text-gray-400">Desktop App Mockup</p>
                  <p className="text-sm text-gray-500 mt-2">Clean, powerful interface for unlimited creativity</p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="h-8 w-8 bg-primary-500 rounded mx-auto mb-2"></div>
                  <p className="text-xs text-gray-400">Media Library</p>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="h-8 w-8 bg-primary-500 rounded mx-auto mb-2"></div>
                  <p className="text-xs text-gray-400">AI Generation</p>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="h-8 w-8 bg-primary-500 rounded mx-auto mb-2"></div>
                  <p className="text-xs text-gray-400">Publishing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Why Crow&apos;s Eye?
            </h2>
            <p className="text-lg text-gray-300">
              Benefits that transform your creative workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <benefit.icon className="h-16 w-16 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">Work Your Way</h3>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Enjoy the power of unlimited local uploads with our desktop app, or the convenience of our web platform.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-gradient-to-b from-black/80 to-crowseye-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-8">
            More Than Just a Tool
          </h2>
          
          <blockquote className="text-2xl md:text-3xl text-primary-400 font-light italic mb-8 max-w-4xl mx-auto">
            &ldquo;This product is the best on the market until people wake up.&rdquo;
          </blockquote>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-300 leading-relaxed">
              Crow&apos;s Eye is a tool for survival in a system that rewards inauthenticity. 
              Our goal is not to entrench ourselves in that system, but to make it easier 
              for creators to move through it — and eventually beyond it.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900/30 to-primary-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Social Media Game?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join visionary creators who refuse to compromise their artistic vision
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/download"
              className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover-glow transition-all duration-300 inline-block"
            >
              Download Desktop App (Free)
            </Link>
            <Link
              href="/pricing"
              className="border border-primary-500 text-primary-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500/10 transition-all duration-300 inline-block"
            >
              Choose Your Plan
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
