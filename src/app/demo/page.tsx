'use client'

import React, { useState } from 'react'
import { Upload, Eye, Zap, Download, Play, ArrowRight, CheckCircle, Image } from 'lucide-react'

const features = [
  {
    icon: <Eye className="h-6 w-6 text-purple-400" />,
    title: "AI Analysis",
    description: "Smart content understanding"
  },
  {
    icon: <Zap className="h-6 w-6 text-blue-400" />,
    title: "Fast Processing",
    description: "Real-time generation"
  },
  {
    icon: <Download className="h-6 w-6 text-green-400" />,
    title: "Export Ready",
    description: "Multiple format support"
  }
];

const demoSteps = [
  {
    step: 1,
    title: "Upload Your Media",
    description: "Choose an image or video to analyze"
  },
  {
    step: 2,
    title: "AI Processing",
    description: "Our AI analyzes your content"
  },
  {
    step: 3,
    title: "Get Results",
    description: "Receive AI-generated content"
  }
];

export default function DemoPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
    
    alert('Demo analysis complete! In the full version, you would see AI-generated content here.');
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
            <Play className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300 tech-body">Live Demo</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-6 tech-heading">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Experience
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI in Action
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed tech-body">
            See how Crow's Eye transforms your media into engaging social content. 
            Upload an image or video and watch our AI create compelling posts in seconds.
          </p>
        </div>
      </section>

      {/* Demo Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="vision-card rounded-xl p-6 hover:bg-white/5 transition-all duration-300 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 vision-card rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tech-subheading">{feature.title}</h3>
                <p className="text-gray-400 text-sm tech-body">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 tech-heading">Try It Now</h2>
            <p className="text-xl text-gray-300 tech-body">
              Upload your media and see Crow's Eye in action
            </p>
          </div>
          
          <div className="vision-card rounded-2xl p-8 md:p-12">
            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-purple-400 bg-purple-500/10' 
                  : 'border-gray-600 hover:border-purple-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div>
                  <Image className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 tech-subheading">File Selected</h3>
                  <p className="text-gray-300 mb-4 tech-body">{selectedFile.name}</p>
                  <button
                    onClick={handleAnalyze}
                    disabled={isProcessing}
                    className={`inline-flex items-center gap-2 vision-button text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading ${
                      isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-5 w-5" />
                        Analyze with AI
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 tech-subheading">Upload Your Media</h3>
                  <p className="text-gray-400 mb-6 tech-body">
                    Drag and drop your image or video here, or click to browse
                  </p>
                  <label className="inline-flex items-center gap-2 vision-card text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer tech-subheading">
                    <Upload className="h-5 w-5" />
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Demo Results Placeholder */}
            {isProcessing && (
              <div className="mt-8 vision-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 tech-subheading">AI Analysis in Progress...</h3>
                <div className="space-y-3">
                  <div className="h-4 bg-purple-500/20 rounded animate-pulse"></div>
                  <div className="h-4 bg-purple-500/20 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-purple-500/20 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            )}

            {/* Context Instructions - Available even without file selection */}
            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 tech-subheading">
                  Content Instructions (Optional)
                </label>
                <textarea
                  placeholder="Describe what kind of content you want to generate... e.g., 'Create an engaging Instagram post with a friendly tone' or 'Generate professional captions for LinkedIn'"
                  className="w-full px-4 py-3 vision-card rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none tech-body"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 tech-subheading">
                  Media Editing Instructions (Optional)
                </label>
                <textarea
                  placeholder="Any specific editing instructions for the media... e.g., 'Add subtle filters', 'Crop to square format', or 'Enhance colors for social media'"
                  className="w-full px-4 py-3 vision-card rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none tech-body"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 tech-heading">How It Works</h2>
            <p className="text-xl text-gray-300 tech-body">
              Simple steps to transform your content
            </p>
          </div>
          
          <div className="space-y-8">
            {demoSteps.map((step, index) => (
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

      {/* Results Preview */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 tech-heading">What You'll Get</h2>
            <p className="text-xl text-gray-300 tech-body">
              AI-generated content ready for your social media
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="vision-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 tech-subheading">📝 Caption Generation</h3>
              <div className="bg-black/20 rounded-lg p-4 text-sm text-gray-300 tech-body">
                "Just captured this amazing sunset! 🌅 The colors are absolutely breathtaking and remind us..."
              </div>
            </div>
            
            <div className="vision-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 tech-subheading">🏷️ Hashtag Suggestions</h3>
              <div className="bg-black/20 rounded-lg p-4 text-sm text-purple-300 tech-body">
                #sunset #photography #nature #beautiful #golden #landscape #peaceful
              </div>
            </div>
            
            <div className="vision-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 tech-subheading">📊 Content Analysis</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300 tech-body">Mood: Peaceful</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300 tech-body">Theme: Nature</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300 tech-body">Best Time: Evening</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 vision-card rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6 tech-heading">
              Ready for the Full Experience?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto tech-body">
              This is just a taste of what Crow's Eye can do. Download the full application 
              to unlock unlimited AI-powered content creation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/download" 
                className="inline-flex items-center gap-2 vision-button text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading"
              >
                <Download className="h-5 w-5" />
                Download Now
              </a>
              <a 
                href="/features" 
                className="inline-flex items-center gap-2 vision-card text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 tech-subheading"
              >
                <ArrowRight className="h-5 w-5" />
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 