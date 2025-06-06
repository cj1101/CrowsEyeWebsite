'use client'

import React from 'react'
import { Download, Eye, Shield, Zap, CheckCircle, Monitor, ArrowRight, Book, MessageCircle } from 'lucide-react'

const features = [
  {
    icon: <Eye className="h-6 w-6 text-purple-400" />,
    title: "AI-Powered Analysis",
    description: "Deep content understanding with Google's Gemini"
  },
  {
    icon: <Zap className="h-6 w-6 text-blue-400" />,
    title: "Lightning Fast",
    description: "Optimized performance for real-time processing"
  },
  {
    icon: <Shield className="h-6 w-6 text-green-400" />,
    title: "Secure & Private",
    description: "Your data stays safe on your device"
  }
];

const systemRequirements = [
  "Windows 10/11 or macOS 10.15+",
  "8GB RAM minimum (16GB recommended)",
  "4GB available storage space",
  "Internet connection for AI features",
  "Graphics card with DirectX 11 support"
];

const installSteps = [
  {
    step: 1,
    title: "Download the Installer",
    description: "Click the download button for your operating system"
  },
  {
    step: 2,
    title: "Run the Installer",
    description: "Open the downloaded file and follow the installation wizard"
  },
  {
    step: 3,
    title: "Create Your Account",
    description: "Sign up for your free account or log in if you already have one"
  },
  {
    step: 4,
    title: "Start Creating",
    description: "Begin creating amazing content with AI-powered tools"
  }
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen darker-gradient-bg logo-bg-overlay">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
        
        {/* Logo Header */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img 
              src="/icon.png" 
              alt="Crow's Eye Logo" 
              className="h-16 w-16 md:h-20 md:w-20 opacity-90"
            />
            <div className="text-left">
              <h1 className="text-2xl md:text-4xl font-bold tech-heading gradient-text-animated">
                CROW'S EYE
              </h1>
              <p className="text-purple-300 text-sm md:text-base tech-subheading">
                AI Marketing Suite
              </p>
            </div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 vision-card rounded-full px-6 py-3 mb-8">
            <Download className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300 tech-body">Desktop Application</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-6 tech-heading">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Download
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Crow's Eye
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed tech-body">
            Get the full desktop application and unlock your AI-powered command center for intelligent, 
            multi-platform social media marketing. Leverage Google's Gemini for unmatched content generation.
          </p>

          {/* Download Button */}
          <div className="mb-8">
            <button className="inline-flex items-center gap-2 vision-button text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading">
              <Download className="h-5 w-5" />
              Download Now
            </button>
          </div>

          <p className="text-sm text-gray-400 tech-body">
            Version 1.2.0 • Free to download • No credit card required
          </p>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 tech-heading">What You Get</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto tech-body">
              Powerful features designed to transform your content creation workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="vision-card rounded-xl p-8 hover:bg-white/5 transition-all duration-300 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 vision-card rounded-2xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tech-subheading">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed tech-body">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 tech-heading">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 tech-body">
              Download the installer and start creating amazing content in minutes.
            </p>
          </div>
          
          {/* Download Options - keeping existing component if it exists */}
          <div className="vision-card rounded-3xl p-8 md:p-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-6 tech-heading">Download for Your Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="vision-card p-6 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                  <Monitor className="h-8 w-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-white mb-2 tech-subheading">Windows</h4>
                  <p className="text-sm text-gray-400 tech-body">Windows 10/11</p>
                </button>
                <button className="vision-card p-6 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                  <Monitor className="h-8 w-8 text-gray-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-white mb-2 tech-subheading">macOS</h4>
                  <p className="text-sm text-gray-400 tech-body">macOS 10.15+</p>
                </button>
                <button className="vision-card p-6 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                  <Monitor className="h-8 w-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-white mb-2 tech-subheading">Linux</h4>
                  <p className="text-sm text-gray-400 tech-body">Ubuntu 20.04+</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="vision-card rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center tech-heading">System Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-purple-300 mb-4 tech-subheading">Minimum Requirements</h4>
                <ul className="space-y-3">
                  {systemRequirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm tech-body">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 vision-card rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 tech-subheading">Performance Tips</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="tech-body">• SSD storage recommended for faster loading</li>
                  <li className="tech-body">• Close other applications during video processing</li>
                  <li className="tech-body">• Ensure stable internet for AI features</li>
                  <li className="tech-body">• Update graphics drivers for best performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="py-20 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 tech-heading">Easy Installation</h2>
            <p className="text-xl text-gray-300 tech-body">
              Get up and running in just a few simple steps
            </p>
          </div>
          
          <div className="space-y-8">
            {installSteps.map((step, index) => (
              <div 
                key={step.step}
                className="flex items-start gap-6 vision-card rounded-xl p-6 hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 vision-button rounded-full flex items-center justify-center text-white font-bold tech-heading">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 tech-subheading">{step.title}</h3>
                  <p className="text-gray-300 tech-body">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help & Support */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 tech-heading">Need Help or Have Questions?</h2>
            <p className="text-xl text-gray-300 tech-body">
              We're here to help you get the most out of Crow's Eye.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="vision-card rounded-2xl p-8 hover:bg-white/5 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6 flex items-center justify-center">
                <Book className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tech-heading">📚 Documentation</h3>
              <p className="text-gray-300 mb-6 leading-relaxed tech-body">
                Check out our comprehensive documentation and user guides on GitHub. 
                Everything you need to master Crow's Eye.
              </p>
              <a 
                href="https://github.com/cj1101/Crow-s-Eye-Marketing-Agent"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 vision-card text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 font-medium tech-subheading"
              >
                <Book className="h-5 w-5" />
                View Documentation
              </a>
            </div>
            
            <div className="vision-card rounded-2xl p-8 hover:bg-white/5 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-6 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tech-heading">💬 Community Support</h3>
              <p className="text-gray-300 mb-6 leading-relaxed tech-body">
                Join our community for help, tips, and to share your creations. 
                Connect with other creators and get support.
              </p>
              <a 
                href="https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 vision-card text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 font-medium tech-subheading"
              >
                <MessageCircle className="h-5 w-5" />
                Get Support
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 vision-card rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6 tech-heading">
              Ready to Transform Your Content?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto tech-body">
              Join thousands of creators who are already using Crow's Eye to create amazing content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center gap-2 vision-button text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading">
                <Download className="h-5 w-5" />
                Download Now
              </button>
              <a 
                href="/features" 
                className="inline-flex items-center gap-2 vision-card text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 tech-subheading"
              >
                <Eye className="h-5 w-5" />
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 