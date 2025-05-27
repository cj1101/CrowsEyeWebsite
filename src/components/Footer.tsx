import React from 'react'
import Link from 'next/link'
import { Eye } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-black/90 border-t border-primary-600/30">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold gradient-text">Crow&apos;s Eye</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              AI-powered marketing automation for visionary creators. Effortlessly organize, create, and publish stunning visual content for Instagram and Facebook.
            </p>
            <div className="mt-6">
              <p className="text-xs text-gray-500">
                © 2024 Crow&apos;s Eye. All rights reserved.
              </p>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  Desktop App
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  Web Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal and Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Legal & Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/meta-review-guide" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  Meta Review Guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-500">
              Made for creators who refuse to compromise their vision.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              {/* Social Media Links - Add your actual social media URLs */}
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.529l1.073-.687c.521.642 1.307 1.052 2.132 1.052.825 0 1.611-.41 2.132-1.052l1.073.687c-.757.933-1.908 1.529-3.205 1.529zm7.718-1.529l-1.073-.687c.521-.642.825-1.227.825-2.052s-.304-1.41-.825-2.052l1.073-.687c.757.933 1.205 2.129 1.205 2.739s-.448 1.806-1.205 2.739z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 