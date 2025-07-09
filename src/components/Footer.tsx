import React from 'react'
import Link from 'next/link'

import { Eye, Heart, Sparkles } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-crowseye-space-dark via-crowseye-space-medium to-crowseye-space-light"></div>
      <div className="absolute inset-0 bg-eye-glow opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-vision-gradient opacity-50"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Enhanced Logo and Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-vision-gradient rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300 animate-pulse-slow"></div>
                <img
                  src="/crows_eye_logo_transparent.png"
                  alt="Crow's Eye Logo"
                  width={48}
                  height={48}
                  className="relative z-10 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold gradient-text-animated">Crow&apos;s Eye</span>
                <span className="text-sm text-vision-blue-light opacity-80 -mt-1">Marketing Suite</span>
              </div>
            </div>
            <p className="text-gray-300 text-base max-w-md leading-relaxed mb-6">
              AI-powered marketing automation for visionary creators. Effortlessly organize, create, and publish stunning visual content across all major social platforms.
            </p>
            <div className="glass-card p-4 rounded-xl border border-vision-purple/30">
              <p className="text-sm text-gray-400 mb-2">
                <span className="gradient-text font-semibold">Powered by Vision</span> • Designed for Creators
              </p>
              <p className="text-xs text-gray-500">
                © 2024 Crow&apos;s Eye Marketing Suite. All rights reserved.
              </p>
            </div>
          </div>

          {/* Enhanced Product Links */}
          <div>
            <h3 className="text-base font-semibold gradient-text tracking-wider uppercase mb-6 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Product
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/features" className="text-gray-400 hover:text-vision-purple-light transition-all duration-300 hover:translate-x-1 block">
                  Features & Capabilities
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-vision-purple-light transition-all duration-300 hover:translate-x-1 block">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/download" className="text-gray-400 hover:text-vision-purple-light transition-all duration-300 hover:translate-x-1 block">
                  Desktop Application
                </Link>
              </li>
              <li>
                <Link href="/marketing-tool" className="text-gray-400 hover:text-vision-purple-light transition-all duration-300 hover:translate-x-1 block">
                  Web Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Enhanced Legal and Support Links */}
          <div>
            <h3 className="text-base font-semibold gradient-text tracking-wider uppercase mb-6 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Support
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-vision-blue-light transition-all duration-300 hover:translate-x-1 block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-vision-blue-light transition-all duration-300 hover:translate-x-1 block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/meta-review-guide" className="text-gray-400 hover:text-vision-blue-light transition-all duration-300 hover:translate-x-1 block">
                  Meta Review Guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-vision-blue-light transition-all duration-300 hover:translate-x-1 block">
                  Get Help & Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Enhanced Bottom section */}
        <div className="mt-16 pt-8 border-t border-vision-purple/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-vision-purple animate-pulse" />
              <span>for creators who refuse to compromise their vision.</span>
            </div>
            <div className="mt-6 md:mt-0 flex items-center space-x-6">
              {/* Enhanced Social Media Links */}
              <a
                href="#"
                className="text-gray-400 hover:text-vision-purple-light transition-all duration-300 hover:scale-110 transform"
                aria-label="BlueSky"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-vision-indigo-light transition-all duration-300 hover:scale-110 transform"
                aria-label="Snapchat"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.529l1.073-.687c.521.642 1.307 1.052 2.132 1.052.825 0 1.611-.41 2.132-1.052l1.073.687c-.757.933-1.908 1.529-3.205 1.529zm7.718-1.529l-1.073-.687c.521-.642.825-1.227.825-2.052s-.304-1.41-.825-2.052l1.073-.687c.757.933 1.205 2.129 1.205 2.739s-.448 1.806-1.205 2.739z"/>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-vision-blue-light transition-all duration-300 hover:scale-110 transform"
                aria-label="Pinterest"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12s5.373 12 12 12 12-5.372 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.713-1.227s.179.342.573.342c3.010 0 5.086-2.781 5.086-6.479 0-2.803-2.365-4.932-5.516-4.932-4.134 0-6.239 2.966-6.239 5.437 0 1.497.567 2.832 1.782 3.332.199.082.378.003.435-.218.041-.157.138-.546.181-.709.059-.218.036-.295-.127-.485-.354-.415-.580-1.035-.580-1.863 0-2.399 1.795-4.538 4.676-4.538 2.548 0 3.954 1.558 3.954 3.640 0 2.738-1.211 5.046-3.008 5.046-.990 0-1.731-.819-1.492-1.825.285-1.199.838-2.491.838-3.355 0-.774-.415-1.420-1.274-1.420-.985 0-1.778.985-1.778 2.305 0 .84.284 1.409.284 1.409s-.973 4.122-1.143 4.842c-.339 1.432-.051 3.188-.027 3.366.014.105.148.13.209.051.087-.114 1.207-1.496 1.597-2.873.110-.388.632-2.465.632-2.465.312.595 1.224 1.119 2.194 1.119 2.890 0 4.851-2.634 4.851-6.155C19.5 5.006 16.194 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Signature */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full border border-vision-purple/20">
              <Eye className="h-5 w-5 text-vision-purple animate-eye-blink" />
              <span className="gradient-text font-semibold text-sm">Seeing Beyond the Horizon</span>
              <Eye className="h-5 w-5 text-vision-indigo animate-eye-blink" style={{ animationDelay: '2s' }} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 