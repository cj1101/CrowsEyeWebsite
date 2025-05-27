'use client'

import React from 'react'
import EmbeddedInstaller from '@/components/EmbeddedInstaller'

export default function Download() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-crowseye-dark via-crowseye-dark-light to-black">
      {/* Header */}
      <section className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Download <span className="gradient-text">Crow&apos;s Eye Marketing Suite</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Get the full desktop application: Your AI-Powered Command Center for intelligent, multi-platform social media marketing. 
            Leverage Google&apos;s Gemini 1.5 Flash for unmatched content generation and media enhancement.
          </p>
        </div>
      </section>

      {/* Embedded Installer Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmbeddedInstaller />
        </div>
      </section>

      {/* Alternative Options */}
      <section className="py-12 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">
            Need Help or Have Questions?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                📚 Documentation
              </h3>
              <p className="text-gray-300 mb-4">
                Check out our comprehensive documentation and user guides on GitHub.
              </p>
              <a 
                href="https://github.com/cj1101/offlineFinal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="border border-primary-500 text-primary-400 px-6 py-2 rounded-lg hover:bg-primary-500/10 transition-all duration-300 inline-block"
              >
                View Documentation
              </a>
            </div>
            
            <div className="bg-black/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                💬 Community Support
              </h3>
              <p className="text-gray-300 mb-4">
                Join our community for help, tips, and to share your creations.
              </p>
              <a 
                href="https://github.com/cj1101/offlineFinal/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="border border-primary-500 text-primary-400 px-6 py-2 rounded-lg hover:bg-primary-500/10 transition-all duration-300 inline-block"
              >
                Get Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 