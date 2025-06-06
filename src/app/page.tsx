'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Zap, Edit3, Layers, Bot, DownloadCloudIcon, Eye, Sparkles, Target, Workflow } from 'lucide-react'
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
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Enhanced Logo Integration */}
          <div className="flex justify-center mb-16">
            <div className="relative group">
              {/* Background Glow Effects */}
              <div className="absolute inset-0 bg-vision-gradient rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-700 animate-glow blur-3xl scale-125"></div>
              <div className="absolute inset-0 bg-vision-gradient-reverse rounded-full opacity-15 group-hover:opacity-25 transition-opacity duration-500 animate-pulse-slow blur-2xl scale-150"></div>
              
              {/* Main Logo Container */}
              <div className="relative p-8 rounded-full glass-card border-2 border-vision-purple/30">
                <Image
                  src="/crows_eye_logo_transparent.png"
                  alt="Crow's Eye Logo"
                  width={240}
                  height={240}
                  className="relative z-10 group-hover:scale-105 transition-transform duration-700 animate-float filter drop-shadow-2xl"
                />
                
                {/* Inner Ring Effect */}
                <div className="absolute inset-4 rounded-full border border-vision-indigo/20 group-hover:border-vision-indigo/40 transition-colors duration-500"></div>
                
                {/* Rotating Ring */}
                <div className="absolute inset-2 rounded-full border-t-2 border-r-2 border-vision-purple/50 animate-spin" style={{ animationDuration: '20s' }}></div>
              </div>
              
              {/* Orbiting Elements */}
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-vision-purple rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse opacity-60" style={{ transform: 'translate(-50%, -50%) rotate(45deg) translateY(-160px)' }}></div>
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-vision-indigo rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse opacity-40" style={{ transform: 'translate(-50%, -50%) rotate(135deg) translateY(-180px)', animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-vision-blue rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse opacity-30" style={{ transform: 'translate(-50%, -50%) rotate(225deg) translateY(-200px)', animationDelay: '2s' }}></div>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8">
            <span className="block gradient-text-animated leading-tight">{t('hero.title')}</span>
            <span className="block text-3xl md:text-4xl lg:text-5xl text-vision-blue-light mt-6 opacity-90">{t('hero.subtitle')}</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-16 max-w-5xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link
              href="/demo"
              className="vision-button px-12 py-6 rounded-2xl text-xl font-semibold inline-flex items-center gap-4 hover-glow text-lg"
            >
              <Sparkles className="h-7 w-7" />
              {t('hero.try_demo')}
            </Link>
            <Link
              href="/download"
              className="glass-card border-2 border-vision-purple/50 text-white px-12 py-6 rounded-2xl text-xl font-semibold hover-glow transition-all duration-300 inline-flex items-center gap-4"
            >
              <DownloadCloudIcon className="h-7 w-7" />
              {t('hero.download_app')}
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-vision-indigo/50 text-vision-indigo-light px-12 py-6 rounded-2xl text-xl font-semibold hover:bg-vision-indigo/10 transition-all duration-300 inline-block"
            >
              {t('hero.view_pricing')}
            </Link>
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
              { 
                name: 'Instagram', 
                description: 'Posts, Stories, Reels', 
                color: 'from-pink-500 to-orange-500',
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                )
              },
              { 
                name: 'Facebook', 
                description: 'Posts, Events, Pages', 
                color: 'from-blue-600 to-blue-700',
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )
              },
              { 
                name: 'Bluesky', 
                description: 'Posts, Threads, Social', 
                color: 'from-blue-400 to-blue-600',
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 2.104.139 3.25.139 5.378.139 5.378s.278 1.518 1.029 2.397c1.806 2.11 4.989 2.663 7.833 2.9-2.844.237-6.027.79-7.833 2.9-.751.879-1.029 2.397-1.029 2.397s0 2.128.763 3.274c.659.838 1.664 1.16 4.3-.699C7.954 16.553 10.913 12.614 12 10.5c1.087 2.114 4.046 6.053 6.798 7.995 2.636 1.859 3.641 1.537 4.3.699.763-1.146.763-3.274.763-3.274s-.278-1.518-1.029-2.397c-1.806-2.11-4.989-2.663-7.833-2.9 2.844-.237 6.027-.79 7.833-2.9.751-.879 1.029-2.397 1.029-2.397s0-2.128-.763-3.274c-.659-.838-1.664-1.16-4.3.699C16.046 4.747 13.087 8.686 12 10.8z"/>
                  </svg>
                )
              },
              { 
                name: 'TikTok', 
                description: 'Videos, Effects, Trending', 
                color: 'from-red-500 to-pink-600',
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                )
              },
              { 
                name: 'YouTube', 
                description: 'Videos, Shorts, Community', 
                color: 'from-red-600 to-red-700',
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                )
              },
              { 
                name: 'Snapchat', 
                description: 'Stories, Snaps, AR', 
                color: 'from-yellow-400 to-yellow-500',
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.333 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.017.001z"/>
                  </svg>
                )
              },
              { 
                name: 'Pinterest', 
                description: 'Pins, Boards, Ideas', 
                color: 'from-red-500 to-red-600',
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.333 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.017.001z"/>
                  </svg>
                )
              }
            ].map((platform) => (
              <div key={platform.name} className="vision-card p-6 rounded-2xl text-center group hover:scale-105 transition-all duration-300">
                <div className="text-white mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  {platform.icon}
                </div>
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
