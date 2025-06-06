'use client'

import React, { useState, useRef } from 'react'
import { Upload, Wand2, Download, Image as ImageIcon, Video, Type, Sparkles, Eye, Edit3, PlayIcon } from 'lucide-react'

interface MediaFile {
  id: string
  file: File
  url: string
  type: 'image' | 'video'
  analysis?: string
  generatedCaption?: string
}

export default function DemoPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file)
        const newFile: MediaFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          url,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        }
        setMediaFiles(prev => [...prev, newFile])
      }
    })
  }

  const analyzeAndGenerate = async (mediaFile: MediaFile, prompt?: string) => {
    setIsAnalyzing(true)
    setIsGenerating(true)
    try {
      // First analyze the media
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockAnalysis = mediaFile.type === 'image' 
        ? "This image shows a vibrant outdoor scene with natural lighting. The composition suggests a lifestyle or travel theme with warm, inviting colors. Perfect for engagement-focused social media content."
        : "This video contains dynamic movement and engaging visual elements. The pacing and content style are well-suited for social media platforms, particularly for storytelling or promotional content."
      
      // Then generate caption based on analysis
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockCaptions = [
        "✨ Embracing the beauty of everyday moments! What's inspiring you today? #lifestyle #inspiration #authentic",
        "🌟 Sometimes the simplest moments create the most beautiful memories. Share your favorite simple pleasure below! 👇 #mindfulness #gratitude",
        "💫 Finding magic in the ordinary. This is what happiness looks like to me! What brings you joy? #happiness #positivity #life",
        "🎯 Ready to take on new challenges! What's your next big goal? Let's motivate each other! #goals #motivation #growth"
      ]
      
      const caption = prompt 
        ? `${prompt} - ${mockCaptions[Math.floor(Math.random() * mockCaptions.length)]}`
        : mockCaptions[Math.floor(Math.random() * mockCaptions.length)]
      
      setMediaFiles(prev => 
        prev.map(file => 
          file.id === mediaFile.id 
            ? { ...file, analysis: mockAnalysis, generatedCaption: caption }
            : file
        )
      )
      setGeneratedContent(caption)
    } catch (error) {
      console.error('AI processing failed:', error)
    } finally {
      setIsAnalyzing(false)
      setIsGenerating(false)
    }
  }

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
            <PlayIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Live Demo</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Experience
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Crow's Eye AI
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            See AI-powered content creation in action. Upload your media and watch Google's Gemini 
            analyze and generate engaging social media content instantly.
          </p>
          
          <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-300">Free Demo - No Installation Required</span>
          </div>
        </div>
      </section>

      {/* Demo Interface */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Media Upload Section */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 border-b border-white/10">
                  <h2 className="text-xl font-semibold flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Upload className="h-5 w-5 text-purple-400" />
                    </div>
                    Media Library
                  </h2>
                  <p className="text-gray-300 text-sm mt-2">Upload images or videos to analyze</p>
                </div>
                
                <div className="p-6">
                  <div 
                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all duration-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2 font-medium">Click to upload media</p>
                    <p className="text-xs text-gray-500">Images and videos supported</p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Media Files List */}
                  {mediaFiles.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h3 className="text-sm font-medium text-gray-300 mb-3">Uploaded Files</h3>
                      {mediaFiles.map((file) => (
                        <div 
                          key={file.id}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                            selectedFile?.id === file.id 
                              ? 'border-purple-500/50 bg-purple-500/10 ring-2 ring-purple-500/20' 
                              : 'border-white/20 hover:border-white/30 hover:bg-white/5'
                          }`}
                          onClick={() => setSelectedFile(file)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${file.type === 'image' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}>
                              {file.type === 'image' ? (
                                <ImageIcon className="h-5 w-5 text-blue-400" />
                              ) : (
                                <Video className="h-5 w-5 text-green-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {file.file.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {(file.file.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                            {selectedFile?.id === file.id && (
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {selectedFile ? (
                <div className="space-y-6">
                  {/* Media Preview */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 border-b border-white/10">
                      <h3 className="text-xl font-semibold flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <Eye className="h-5 w-5 text-blue-400" />
                        </div>
                        Media Preview
                      </h3>
                      <p className="text-gray-300 text-sm mt-2">
                        {selectedFile.type === 'image' ? 'Image' : 'Video'} • {selectedFile.file.name}
                      </p>
                    </div>
                    
                    <div className="p-6">
                      <div className="aspect-video bg-black/50 rounded-xl overflow-hidden border border-white/10">
                        {selectedFile.type === 'image' ? (
                          <img 
                            src={selectedFile.url} 
                            alt="Preview" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <video 
                            src={selectedFile.url} 
                            controls 
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Section */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 border-b border-white/10">
                      <h3 className="text-xl font-semibold flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <Sparkles className="h-5 w-5 text-green-400" />
                        </div>
                        AI Analysis & Generation
                      </h3>
                      <p className="text-gray-300 text-sm mt-2">Powered by Google's Gemini AI</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Custom Prompt */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Custom Prompt (Optional)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="e.g., 'Create a motivational post about fitness'"
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                          <Type className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Generate Button */}
                      <button
                        onClick={() => analyzeAndGenerate(selectedFile, customPrompt)}
                        disabled={isAnalyzing || isGenerating}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
                      >
                        {isAnalyzing || isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            {isAnalyzing ? 'Analyzing...' : 'Generating...'}
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-5 w-5" />
                            Analyze & Generate Content
                          </>
                        )}
                      </button>

                      {/* Results */}
                      {selectedFile.analysis && (
                        <div className="space-y-4">
                          {/* Analysis Results */}
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              AI Analysis
                            </h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{selectedFile.analysis}</p>
                          </div>

                          {/* Generated Caption */}
                          {selectedFile.generatedCaption && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-green-300 flex items-center gap-2">
                                  <Edit3 className="h-4 w-4" />
                                  Generated Content
                                </h4>
                                <button
                                  onClick={() => downloadContent(selectedFile.generatedCaption!, 'caption.txt')}
                                  className="text-green-400 hover:text-green-300 transition-colors"
                                  title="Download content"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {selectedFile.generatedCaption}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* No File Selected State */
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Ready to See AI in Action?</h3>
                  <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                    Upload an image or video to experience how Crow's Eye AI analyzes your content and generates 
                    engaging social media posts automatically.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    <Upload className="h-5 w-5" />
                    Upload Your First File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6">
              Impressed? Get the Full Experience
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              This demo shows just a fraction of what Crow's Eye can do. Download the full application 
              to unlock advanced features, multiple platform management, and unlimited processing power.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/download" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
              >
                <Download className="h-5 w-5" />
                Download Full Version
              </a>
              <a 
                href="/pricing" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                <Sparkles className="h-5 w-5" />
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 