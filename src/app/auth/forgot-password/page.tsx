'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Reset Password
          </h2>
          <p className="text-gray-400 mb-8">
            Password reset is currently disabled for the demo version.
          </p>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Demo Access</h3>
            <p className="text-gray-300 text-sm mb-4">
              You can explore all features of Crow's Eye Marketing Suite without authentication.
            </p>
            <Link
              href="/dashboard"
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 inline-block text-center"
            >
              Continue to Dashboard
            </Link>
          </div>

          <Link
            href="/auth/signin"
            className="inline-flex items-center text-primary-400 hover:text-primary-300"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 