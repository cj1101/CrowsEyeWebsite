'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, UserPlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
            <UserPlusIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Join Crow's Eye</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Sign Up
            </span>
          </h2>
          <p className="text-gray-300 text-lg">
            Create your account to start your AI-powered journey
          </p>
        </div>

        {/* Access Notice */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">Access Currently Limited</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Account creation is temporarily disabled while we prepare for our public launch. 
              We're working hard to bring you the best AI-powered marketing experience.
            </p>
            
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-orange-300 mb-3">What You Can Do</h4>
              <ul className="text-gray-300 text-sm space-y-2 text-left">
                <li>• Try our live demo to see AI content generation in action</li>
                <li>• Contact our support team for early access inquiries</li>
                <li>• Download the desktop app for local processing</li>
                <li>• Join our community for updates and tips</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 text-center"
              >
                Contact Support
              </Link>
              <Link
                href="/demo"
                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 text-center"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <h4 className="text-lg font-semibold text-white mb-4 text-center">Already Have an Account?</h4>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">
              If you already have access credentials, you can sign in here.
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Sign In Instead
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 