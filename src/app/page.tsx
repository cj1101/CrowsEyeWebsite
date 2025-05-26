'use client'

import React from 'react'
import Link from 'next/link'
import { Zap, Edit3, Layers, Bot, DownloadCloudIcon, GiftIcon } from 'lucide-react'

export default function Home() {
  const keyFeatures = [
    {
      icon: <Bot className="h-10 w-10" />,
      title: "AI-Powered Content (Gemini 1.5 Flash)",
      description: "Leverage advanced AI for deep media analysis and compelling content generation.",
    },
    {
      icon: <Layers className="h-10 w-10" />,
      title: "Unified Multi-Platform Management",
      description: "Manage Instagram, Facebook, and soon LinkedIn & X from one dashboard.",
    },
    {
      icon: <Edit3 className="h-10 w-10" />,
      title: "AI-Instructed Media Editing",
      description: "Edit images and process videos using simple natural language commands.",
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Streamlined Productivity Tools",
      description: "Presets, context files, and a comprehensive media library to boost efficiency.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-crowseye-dark via-crowseye-dark-light to-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center text-center py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-primary-500/10 opacity-50"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="block gradient-text leading-tight">Crow&apos;s Eye Marketing Suite</span>
            <span className="block text-2xl md:text-3xl text-gray-300 mt-2">Your AI-Powered Command Center</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Leveraging Google&apos;s Gemini 1.5 Flash for unmatched content generation and media enhancement for intelligent, multi-platform social media marketing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/download"
              className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover-glow transition-all duration-300 inline-flex items-center gap-2"
            >
              <DownloadCloudIcon className="h-5 w-5" />
              Download Free Desktop App
            </Link>
            <Link
              href="/pricing"
              className="border border-primary-500 text-primary-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500/10 transition-all duration-300 inline-block"
            >
              View Pricing & Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Pre-Launch Waitlist Section */}
      <section className="py-16 md:py-24 bg-black/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GiftIcon className="h-16 w-16 text-primary-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Be the First to Experience Crow&apos;s Eye Pro!
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Sign up for our pre-launch waitlist and get an exclusive early bird discount, plus bonus AI credits when we launch our premium features!
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-grow px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required 
            />
            <button 
              type="submit" 
              className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover-glow transition-all duration-300"
            >
              Join Waitlist
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4">We respect your privacy. No spam, unsubscribe anytime.</p>
        </div>
      </section>

      {/* Key Features Overview */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Transform Your Social Media Workflow
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Discover the powerful tools that make Crow&apos;s Eye Marketing Suite the ultimate creative partner.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feature) => (
              <div key={feature.title} className="feature-card bg-black/30 backdrop-blur-sm p-6 rounded-xl shadow-xl hover:shadow-primary-500/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center mb-4 w-16 h-16 bg-primary-500/10 text-primary-500 rounded-full mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 text-center">{feature.title}</h3>
                <p className="text-gray-400 text-sm text-center">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/features"
              className="border border-primary-500 text-primary-400 px-8 py-3 rounded-lg text-md font-semibold hover:bg-primary-500/10 transition-all duration-300 inline-block"
            >
              See All Features
            </Link>
          </div>
        </div>
      </section>

      {/* Placeholder for Teaser Video/Screenshots Section */}
      <section className="py-16 md:py-24 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-6">
            See Crow&apos;s Eye in Action
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Witness how our AI-powered suite simplifies content creation and management. (Teaser videos & screenshots coming soon!)
          </p>
          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">[Future Home of Teaser Video]</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Elevate Your Marketing?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Download the Crow&apos;s Eye Marketing Suite today and start creating smarter, faster, and more effectively.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/download"
              className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover-glow transition-all duration-300 inline-flex items-center gap-3"
            >
              <DownloadCloudIcon className="h-6 w-6" />
              Download Desktop App (Free)
            </Link>
            <Link
              href="/pricing"
              className="border border-primary-500 text-primary-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500/10 transition-all duration-300 inline-block"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .gradient-text {
          background: -webkit-linear-gradient(45deg, var(--color-primary-500), var(--color-primary-400));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .feature-card {
          border: 1px solid rgba(var(--color-primary-500-rgb), 0.1);
        }
        .feature-card:hover {
          border: 1px solid rgba(var(--color-primary-500-rgb), 0.2);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
