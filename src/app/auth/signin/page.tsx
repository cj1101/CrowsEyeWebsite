'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function SignInPage() {



  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sign In
          </h2>
          <p className="text-gray-400 mb-8">
            Welcome back to Crow's Eye Marketing Suite
          </p>
        </div>



        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Authentication Unavailable</h3>
          <p className="text-gray-300 text-sm mb-4">
            Authentication is currently disabled. Please contact our support team for access to the full platform.
          </p>
          <div className="space-y-3">
            <Link
              href="/demo"
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 inline-block text-center"
            >
              Try Demo Version
            </Link>
            <Link
              href="/contact"
              className="w-full border border-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 inline-block text-center"
            >
              Contact Support
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-primary-400 hover:text-primary-300"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 