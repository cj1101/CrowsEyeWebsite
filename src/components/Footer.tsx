import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Heart, Sparkles } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-crowseye-space-dark via-crowseye-space-medium to-crowseye-space-light"></div>
      <div className="absolute inset-0 bg-eye-glow opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-vision-gradient opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Enhanced Logo and Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-vision-gradient rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300 animate-pulse-slow"></div>
                <Image
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
                <Link href="/demo" className="text-gray-400 hover:text-vision-purple-light transition-all duration-300 hover:translate-x-1 block">
                  Live Demo
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
                aria-label="Twitter"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-vision-indigo-light transition-all duration-300 hover:scale-110 transform"
                aria-label="Instagram"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.529l1.073-.687c.521.642 1.307 1.052 2.132 1.052.825 0 1.611-.41 2.132-1.052l1.073.687c-.757.933-1.908 1.529-3.205 1.529zm7.718-1.529l-1.073-.687c.521-.642.825-1.227.825-2.052s-.304-1.41-.825-2.052l1.073-.687c.757.933 1.205 2.129 1.205 2.739s-.448 1.806-1.205 2.739z"/>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-vision-blue-light transition-all duration-300 hover:scale-110 transform"
                aria-label="LinkedIn"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
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