'use client'

import React, { useState, useEffect } from 'react'
import { 
  Download, 
  Eye, 
  Shield, 
  Zap, 
  CheckCircle, 
  Monitor, 
  Book, 
  MessageCircle,
  Code2
} from 'lucide-react'
import { detectPlatform, getPlatformInfo, getAllPlatformInfo, type Platform, type PlatformInfo } from '@/utils/platformDetection'

declare global {
  function gtag(...args: any[]): void;
}

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
  "Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)",
  "8GB RAM minimum (16GB recommended)",
  "4GB available storage space",
  "Internet connection for AI features",
  "Modern graphics card (DirectX 11 / OpenGL 3.3 support)"
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
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('unknown')
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null)
  const [allPlatforms] = useState<PlatformInfo[]>(getAllPlatformInfo())

  useEffect(() => {
    const detected = detectPlatform()
    setCurrentPlatform(detected)
    setPlatformInfo(getPlatformInfo(detected))
  }, [])

  const handlePlatformDownload = (platform: Platform) => {
    const info = getPlatformInfo(platform)
    window.location.href = info.downloadUrl
    if (typeof gtag !== 'undefined') {
      gtag('event', 'download', { 
        'event_category': 'software', 
        'event_label': `${platform}_download`,
        'platform': platform 
      });
    }
  };

  const handleDownloadSource = () => {
    window.location.href = '/api/download/source';
    if (typeof gtag !== 'undefined') {
      gtag('event', 'download', { 'event_category': 'software', 'event_label': 'source_code' });
    }
  };

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
            <button 
              onClick={() => handlePlatformDownload(currentPlatform)}
              className="inline-flex items-center gap-2 vision-button text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading text-lg"
            >
              <Download className="h-5 w-5" />
              Download for {platformInfo?.name || 'Your Platform'}
            </button>
          </div>

          <p className="text-sm text-gray-400 tech-body">
            Version 5.0.0 • {platformInfo?.name || 'Multi-Platform'} • Free • No signup required
          </p>
        </div>
      </section>

      {/* Simple Downloads Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 tech-heading">Choose Your Download</h2>
            <p className="text-xl text-gray-300 tech-body">
              Simple installation for everyone
            </p>
          </div>

          {/* Platform-specific Downloads */}
          <div className="mb-12">
            {/* Recommended Download for Detected Platform */}
            <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-2 border-purple-500/30 rounded-2xl p-8 mb-8">
              <div className="absolute -top-3 right-6 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                RECOMMENDED FOR YOU
              </div>
              <div className="flex items-center mb-6">
                <Monitor className="h-8 w-8 text-purple-400 mr-3" />
                <h3 className="text-2xl font-bold text-white">
                  {platformInfo?.name || 'Multi-Platform'} Download
                </h3>
              </div>
              <p className="text-gray-300 mb-6 text-lg">
                Automatically detected your platform. One-click installation for {platformInfo?.name || 'your system'}.
              </p>
              
              {platformInfo && (
                <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-purple-300 mb-3">Installation steps:</h4>
                  <ol className="text-gray-300 space-y-2 text-sm">
                    {platformInfo.instructions.map((instruction, index) => (
                      <li key={index}>{index + 1}. {instruction}</li>
                    ))}
                  </ol>
                </div>
              )}
              
              <button 
                onClick={() => handlePlatformDownload(currentPlatform)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 text-lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Download for {platformInfo?.name || 'Your Platform'}
              </button>
              
              <p className="text-sm text-gray-400 mt-3 text-center">
                Version 5.0.0 • {platformInfo?.name || 'Multi-Platform'} • Free • Safe & Secure
              </p>
            </div>

            {/* All Platform Options */}
            <div className="text-center mb-8">
              <h4 className="text-xl font-bold text-white mb-4">Other Platforms & Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {allPlatforms.map((platform) => (
                  <button
                    key={platform.platform}
                    onClick={() => handlePlatformDownload(platform.platform)}
                    className={`p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                      platform.platform === currentPlatform
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-semibold">{platform.name}</div>
                    <div className="text-sm opacity-80">{platform.filename}</div>
                  </button>
                ))}
                
                {/* Windows Source Option */}
                <button
                  onClick={handleDownloadSource}
                  className="p-4 rounded-lg border border-blue-600 bg-blue-600/20 text-blue-300 hover:border-blue-500 transition-all duration-200 hover:scale-105"
                >
                  <div className="font-semibold">Source Code</div>
                  <div className="text-sm opacity-80">crows-eye-source.zip</div>
                  <div className="text-xs mt-1 opacity-70">191MB - All platforms</div>
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                <strong>Windows users:</strong> The recommended download provides a beautiful GUI installer that requires no command prompt or admin rights
              </div>
            </div>

            {/* Advanced Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Developer Option */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <Code2 className="h-6 w-6 text-blue-400 mr-3" />
                  <h3 className="text-lg font-bold text-white">For Developers</h3>
                </div>
                <p className="text-gray-300 mb-4 text-sm">Python source code for advanced users who want to run from source.</p>
                
                <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">Requirements:</h4>
                  <ul className="text-gray-300 space-y-1 text-xs">
                    <li>• Python 3.8 or newer</li>
                    <li>• Basic command line knowledge</li>
                    <li>• Manual dependency installation</li>
                  </ul>
                </div>
                
                <button 
                  onClick={handleDownloadSource}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 text-sm"
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Download Source Code
                </button>
                
                <p className="text-xs text-gray-400 mt-2 text-center">
                  ~191MB • All platforms
                </p>
              </div>

              {/* Direct Download Option */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <Download className="h-6 w-6 text-green-400 mr-3" />
                  <h3 className="text-lg font-bold text-white">Direct Download</h3>
                </div>
                <p className="text-gray-300 mb-4 text-sm">Complete source code with all files - extract and run manually.</p>
                
                <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-semibold text-green-300 mb-2">What's included:</h4>
                  <ul className="text-gray-300 space-y-1 text-xs">
                    <li>• Full application source code</li>
                    <li>• All assets and resources</li>
                    <li>• Documentation and examples</li>
                  </ul>
                </div>
                
                <button 
                  onClick={() => window.location.href = '/api/download/direct'}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Direct Download ZIP
                </button>
                
                <p className="text-xs text-gray-400 mt-2 text-center">
                  ~191MB • No installer
                </p>
              </div>
            </div>
          </div>

          {/* Installation Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-blue-300 mb-4 text-center">Modern Installation Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">No Command Prompt Flash:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Modern GUI installer with Windows Forms</li>
                  <li>• Real-time progress bar and status updates</li>
                  <li>• Browse and select installation directory</li>
                  <li>• Professional dark theme interface</li>
                  <li>• No admin rights required</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Built-in Security:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• User login required to access features</li>
                  <li>• Account-based access control</li>
                  <li>• Direct downloads are still secure</li>
                  <li>• Open source - inspect the code</li>
                  <li>• No hidden network activity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Simple help section */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-green-300 mb-3">Need Help?</h3>
            <p className="text-gray-300 mb-4">
              Our installer scripts are completely safe and transparent. If you get a security warning, it's just because they're not digitally signed yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:support@crowseye.com" 
                className="inline-flex items-center gap-2 text-green-300 hover:text-green-200 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Email Support
              </a>
              <span className="text-gray-500 hidden sm:block">•</span>
              <a 
                href="https://github.com/cj1101/Crow-s-Eye-Marketing-Agent"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-300 hover:text-green-200 transition-colors"
              >
                <Book className="h-5 w-5" />
                View Documentation
              </a>
            </div>
          </div>
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
              <button 
                onClick={() => handlePlatformDownload(currentPlatform)}
                className="inline-flex items-center gap-2 vision-button text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading"
              >
                <Download className="h-5 w-5" />
                Download for {platformInfo?.name || 'Your Platform'}
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