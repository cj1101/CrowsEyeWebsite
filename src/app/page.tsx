'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Zap, Edit3, Layers, Bot, DownloadCloudIcon, GiftIcon, Eye, Sparkles, Target, Workflow } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function Home() {
  const { t } = useI18n()
  
  const keyFeatures = [
    {
      icon: <Bot className="h-10 w-10" />,
      title: t('features.ai_content.title'),
      description: t('features.ai_content.description'),
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      icon: <Layers className="h-10 w-10" />,
      title: t('features.multi_platform.title'),
      description: t('features.multi_platform.description'),
      gradient: 'from-indigo-500 to-blue-600'
    },
    {
      icon: <Edit3 className="h-10 w-10" />,
      title: t('features.media_editing.title'),
      description: t('features.media_editing.description'),
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: t('features.productivity.title'),
      description: t('features.productivity.description'),
      gradient: 'from-purple-600 to-pink-600'
    },
  ]

  return (
    <div className="min-h-screen bg-space-depth text-white relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="floating-orb w-96 h-96 top-10 left-10 opacity-30"></div>
      <div className="floating-orb w-64 h-64 top-1/2 right-20 opacity-20"></div>
      <div className="floating-orb w-48 h-48 bottom-20 left-1/3 opacity-25"></div>

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center py-24 px-4 sm:px-6 lg:px-8">
        {/* Advanced Background Effects */}
        <div className="absolute inset-0 bg-eye-glow opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-vision-gradient opacity-20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-vision-gradient-reverse opacity-15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-vision-purple/10 via-vision-indigo/5 to-transparent rounded-full animate-pulse-slow"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Logo Integration */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-vision-gradient rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-glow"></div>
              <Image
                src="/crows_eye_logo_transparent.png"
                alt="Crow's Eye Logo"
                width={120}
                height={120}
                className="relative z-10 group-hover:scale-110 transition-transform duration-500 animate-float"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
            <span className="block gradient-text-animated leading-tight">{t('hero.title')}</span>
            <span className="block text-2xl md:text-3xl lg:text-4xl text-vision-blue-light mt-4 opacity-90">{t('hero.subtitle')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/demo"
              className="vision-button px-10 py-5 rounded-xl text-lg font-semibold inline-flex items-center gap-3 hover-glow"
            >
              <Sparkles className="h-6 w-6" />
              {t('hero.try_demo')}
            </Link>
            <Link
              href="/download"
              className="glass-card border-2 border-vision-purple/50 text-white px-10 py-5 rounded-xl text-lg font-semibold hover-glow transition-all duration-300 inline-flex items-center gap-3"
            >
              <DownloadCloudIcon className="h-6 w-6" />
              {t('hero.download_app')}
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-vision-indigo/50 text-vision-indigo-light px-10 py-5 rounded-xl text-lg font-semibold hover:bg-vision-indigo/10 transition-all duration-300 inline-block"
            >
              {t('hero.view_pricing')}
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Pre-Launch Waitlist Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-vision-purple/10 via-vision-indigo/10 to-vision-blue/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="eye-glow p-8 rounded-3xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-vision-gradient rounded-full mb-8 animate-glow">
              <GiftIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-animated mb-6">
              Be the First to Experience Crow&apos;s Eye Pro!
            </h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Sign up for our pre-launch waitlist and get an exclusive early bird discount, plus bonus AI credits when we launch our premium features!
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-grow px-6 py-4 rounded-xl glass-card text-white border border-vision-purple/30 focus:ring-2 focus:ring-vision-purple focus:border-transparent outline-none transition-all duration-300"
                required 
              />
              <button 
                type="submit" 
                className="vision-button px-8 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                Join Waitlist
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-6">We respect your privacy. No spam, unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* Enhanced Key Features Overview */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-vision-gradient rounded-full mb-6 animate-glow">
              <Eye className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-animated mb-6">
              Transform Your Social Media Workflow
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover the powerful tools that make Crow&apos;s Eye Marketing Suite the ultimate creative partner.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feature, index) => (
              <div key={feature.title} className="vision-card p-8 rounded-2xl transition-all duration-500 group hover:scale-105">
                <div className={`flex items-center justify-center mb-6 w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-400 text-center leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link
              href="/features"
              className="glass-card border-2 border-vision-purple/50 text-vision-purple-light px-10 py-4 rounded-xl text-lg font-semibold hover:bg-vision-purple/10 transition-all duration-300 inline-flex items-center gap-3"
            >
              <Target className="h-5 w-5" />
              See All Features
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Supported Platforms Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-vision-purple/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-vision-gradient rounded-full mb-6 animate-glow">
              <Workflow className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-animated mb-6">
              Connect to Every Platform
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Manage all your social media accounts from one powerful dashboard. Crow&apos;s Eye supports all major platforms.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6">
            {[
              { name: 'Instagram', icon: '📱', description: 'Posts, Stories, Reels', color: 'from-pink-500 to-orange-500' },
              { name: 'Facebook', icon: '📘', description: 'Posts, Events, Pages', color: 'from-blue-600 to-blue-700' },
              { name: 'Twitter/X', icon: '🐦', description: 'Tweets, Threads, Spaces', color: 'from-blue-400 to-blue-600' },
              { name: 'LinkedIn', icon: '💼', description: 'Posts, Articles, Updates', color: 'from-blue-700 to-indigo-700' },
              { name: 'TikTok', icon: '🎵', description: 'Videos, Effects, Trending', color: 'from-red-500 to-pink-600' },
              { name: 'YouTube', icon: '📺', description: 'Videos, Shorts, Community', color: 'from-red-600 to-red-700' },
              { name: 'Pinterest', icon: '📌', description: 'Pins, Boards, Ideas', color: 'from-red-500 to-red-600' }
            ].map((platform) => (
              <div key={platform.name} className="vision-card p-6 rounded-2xl text-center group hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{platform.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-3">{platform.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{platform.description}</p>
                <div className={`h-1 bg-gradient-to-r ${platform.color} rounded-full mt-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <p className="text-gray-300 mb-6 text-lg">
              More platforms being added regularly. Request your favorite platform!
            </p>
            <Link
              href="/contact"
              className="glass-card border-2 border-vision-indigo/50 text-vision-indigo-light px-8 py-3 rounded-xl text-base font-semibold hover:bg-vision-indigo/10 transition-all duration-300 inline-block"
            >
              Request Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Teaser Video/Screenshots Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-vision-purple/10 via-transparent to-vision-blue/10"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-vision-gradient rounded-full mb-6 animate-glow">
            <Eye className="h-8 w-8 text-white animate-eye-blink" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold gradient-text-animated mb-8">
            See Crow&apos;s Eye in Action
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Witness how our AI-powered suite simplifies content creation and management. (Teaser videos & screenshots coming soon!)
          </p>
          <div className="aspect-video glass-card rounded-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-vision-gradient opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-vision-gradient rounded-full flex items-center justify-center mb-4 mx-auto animate-glow">
                <Eye className="h-12 w-12 text-white animate-eye-blink" />
              </div>
              <p className="text-gray-400 text-lg">Future Home of Teaser Video</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-eye-glow opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12 rounded-3xl border-2 border-vision-purple/30">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text-animated mb-8">
              Ready to Transform Your Social Media Strategy?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of creators who are already using Crow&apos;s Eye to streamline their workflow and create stunning content effortlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/demo"
                className="vision-button px-12 py-6 rounded-xl text-xl font-semibold inline-flex items-center gap-3"
              >
                <Sparkles className="h-6 w-6" />
                Try Free Demo
              </Link>
              <Link
                href="/pricing"
                className="glass-card border-2 border-vision-indigo/50 text-vision-indigo-light px-12 py-6 rounded-xl text-xl font-semibold hover:bg-vision-indigo/10 transition-all duration-300 inline-block"
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
