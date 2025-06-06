'use client'

import React from 'react'
import EmbeddedInstaller from '@/components/EmbeddedInstaller'
import { 
  ArrowDownTrayIcon, 
  BookOpenIcon, 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function Download() {
  const features = [
    {
      icon: CpuChipIcon,
      title: "Powerful Local Processing",
      description: "Advanced AI processing happens on your machine for maximum speed and privacy."
    },
    {
      icon: ShieldCheckIcon,
      title: "Enhanced Security",
      description: "Your data stays on your device. Complete control over your content and privacy."
    },
    {
      icon: CheckCircleIcon,
      title: "Full Feature Access",
      description: "Unlock all Crow's Eye capabilities including advanced video editing and AI tools."
    }
  ]

  const systemRequirements = [
    "Windows 10/11 or macOS 10.15+",
    "8GB RAM minimum (16GB recommended)",
    "4GB available storage space",
    "Internet connection for AI features",
    "Graphics card with DirectX 11 support"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
            <ArrowDownTrayIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Desktop Application</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Download
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Crow's Eye
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Get the full desktop application and unlock your AI-powered command center for intelligent, 
            multi-platform social media marketing. Leverage Google's Gemini for unmatched content generation.
          </p>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300">
              Download the installer and start creating amazing content in minutes.
            </p>
          </div>
          
          {/* Embedded Installer */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <EmbeddedInstaller />
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">System Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-purple-300 mb-4">Minimum Requirements</h4>
                <ul className="space-y-3">
                  {systemRequirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Performance Tips</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• SSD storage recommended for faster loading</li>
                  <li>• Close other applications during video processing</li>
                  <li>• Ensure stable internet for AI features</li>
                  <li>• Update graphics drivers for best performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help & Support */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Need Help or Have Questions?</h2>
            <p className="text-xl text-gray-300">
              We're here to help you get the most out of Crow's Eye.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6 flex items-center justify-center">
                <BookOpenIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">📚 Documentation</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Check out our comprehensive documentation and user guides on GitHub. 
                Everything you need to master Crow's Eye.
              </p>
              <a 
                href="https://github.com/cj1101/Crow-s-Eye-Marketing-Agent"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                <DocumentTextIcon className="h-5 w-5" />
                View Documentation
              </a>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-6 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">💬 Community Support</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Join our community for help, tips, and to share your creations. 
                Connect with other creators and get support.
              </p>
              <a 
                href="https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                Get Support
              </a>
            </div>
          </div>
          
          {/* Installation Guide */}
          <div className="mt-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Quick Installation Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Download</h4>
                <p className="text-gray-300 text-sm">Click the download button above and save the installer to your computer.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Install</h4>
                <p className="text-gray-300 text-sm">Run the installer and follow the setup wizard. It only takes a few minutes.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Create</h4>
                <p className="text-gray-300 text-sm">Launch Crow's Eye and start creating amazing content with AI assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 