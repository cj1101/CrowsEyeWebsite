'use client'

import React, { useState, useRef } from 'react'
import { Upload, Wand2, Download, Image as ImageIcon, Video, Type, Sparkles, Eye, Edit3 } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-crowseye-dark via-crowseye-dark-light to-black text-white">
      {/* Header */}
      <div className="bg-black/20 border-b border-primary-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Crow's Eye Demo
              </h1>
              <p className="text-gray-400 mt-1">
                Experience AI-powered content creation in your browser
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-400 font-medium">Free Demo Version</p>
              <p className="text-xs text-gray-500">No installation required</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Media Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary-500" />
                Media Library
              </h2>
              
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Click to upload media</p>
                <p className="text-xs text-gray-600">Images and videos supported</p>
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
              <div className="mt-6 space-y-3">
                {mediaFiles.map((file) => (
                  <div 
                    key={file.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFile?.id === file.id 
                        ? 'border-primary-500 bg-primary-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-center gap-3">
                      {file.type === 'image' ? (
                        <ImageIcon className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Video className="h-5 w-5 text-green-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {file.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedFile ? (
              <div className="space-y-6">
                {/* Media Preview */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary-500" />
                    Media Preview
                  </h3>
                  
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
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

                  <div className="mt-4">
                    <button
                      onClick={() => analyzeAndGenerate(selectedFile, customPrompt)}
                      disabled={isAnalyzing || isGenerating}
                      className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isAnalyzing || isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          {isAnalyzing && !isGenerating ? 'Analyzing...' : 'Generating Content...'}
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" />
                          <Sparkles className="h-4 w-4" />
                          AI Analyze & Generate
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Analysis Results */}
                {selectedFile.analysis && (
                  <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-400">
                      <Sparkles className="h-5 w-5" />
                      AI Analysis
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{selectedFile.analysis}</p>
                  </div>
                )}

                {/* Content Generation */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-primary-500/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Type className="h-5 w-5 text-primary-500" />
                    Content Generation
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Custom Prompt (Optional)
                      </label>
                      <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="e.g., 'Make it sound professional and inspiring'"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>

                    {(selectedFile.generatedCaption || generatedContent) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Generated Caption
                        </label>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <p className="text-white leading-relaxed">
                            {selectedFile.generatedCaption || generatedContent}
                          </p>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => navigator.clipboard.writeText(selectedFile.generatedCaption || generatedContent)}
                              className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => downloadContent(selectedFile.generatedCaption || generatedContent, 'caption.txt')}
                              className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Demo Limitations Notice */}
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
                  <h4 className="text-yellow-400 font-medium mb-2">Demo Limitations</h4>
                  <ul className="text-sm text-yellow-200 space-y-1">
                    <li>• Limited to 5 media files per session</li>
                    <li>• Simulated AI responses (not connected to real AI)</li>
                    <li>• No social media posting capabilities</li>
                    <li>• No video editing or advanced features</li>
                  </ul>
                  <p className="text-xs text-yellow-300 mt-3">
                    Download the full desktop app for complete functionality!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-12 border border-primary-500/20 text-center">
                <Edit3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Select Media to Get Started
                </h3>
                <p className="text-gray-500">
                  Upload an image or video to experience AI-powered content generation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-primary-600/20 to-primary-500/20 rounded-xl p-8 border border-primary-500/30 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready for the Full Experience?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            This demo shows just a glimpse of Crow's Eye's capabilities. Download the full desktop application for advanced AI features, video editing, social media posting, and much more!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/download"
              className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover-glow transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              Download Full App
            </a>
            <a
              href="/pricing"
              className="border border-primary-500 text-primary-400 px-8 py-3 rounded-lg font-semibold hover:bg-primary-500/10 transition-all duration-300 inline-block"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .gradient-text {
          background: -webkit-linear-gradient(45deg, var(--color-primary-500), var(--color-primary-400));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hover-glow:hover {
          box-shadow: 0 0 20px rgba(var(--color-primary-500-rgb), 0.4);
        }
      `}</style>
    </div>
  )
} 