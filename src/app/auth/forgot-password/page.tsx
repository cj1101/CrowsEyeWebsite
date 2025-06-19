'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CrowsEyeAPI } from '@/services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [api] = useState(() => new CrowsEyeAPI());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.requestPasswordReset(email);
      
      if (response.status === 200 || response.data?.success) {
        setIsSuccess(true);
      } else {
        throw new Error(response.data?.error || 'Failed to send reset email');
      }
    } catch (err: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      // Handle specific error cases
      const status = err?.response?.status;
      const apiError = err?.response?.data?.error;
      
      if (status === 404) {
        errorMessage = 'No account found with this email address.';
      } else if (status === 429) {
        errorMessage = 'Too many reset requests. Please wait before trying again.';
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (apiError) {
        errorMessage = apiError;
      } else if (err?.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8 animate-fade-in">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Email Sent</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-4 animate-slide-up">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Check Your Email
              </span>
            </h2>
            <p className="text-gray-300 text-lg animate-slide-up-delay">
              We've sent password reset instructions to your email
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 animate-fade-in-delay">
            <div className="text-center space-y-6">
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
                <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Password Reset Email Sent</h3>
                <p className="text-gray-300 text-sm">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>

              <div className="text-left bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Didn't receive the email?</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email address</li>
                  <li>• Wait a few minutes for the email to arrive</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
              >
                Send Another Email
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>

        <style jsx global>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in { animation: fade-in 0.5s ease-out; }
          .animate-slide-up { animation: slide-up 0.6s ease-out; }
          .animate-slide-up-delay { animation: slide-up 0.6s ease-out 0.1s both; }
          .animate-fade-in-delay { animation: fade-in 0.5s ease-out 0.2s both; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8 animate-fade-in">
            <EnvelopeIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Password Reset</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 animate-slide-up">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Reset Password
            </span>
          </h2>
          <p className="text-gray-300 text-lg animate-slide-up-delay">
            Enter your email to receive reset instructions
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 animate-fade-in-delay">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 animate-shake">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-3">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Enter your email address"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending Reset Email...
                </>
              ) : (
                <>
                  <EnvelopeIcon className="h-5 w-5" />
                  Send Reset Email
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">What happens next?</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• You'll receive an email with reset instructions</li>
              <li>• Click the link in the email to reset your password</li>
              <li>• Create a new strong password for your account</li>
            </ul>
          </div>

          {/* Alternative Options */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-4">
              Remember your password?{' '}
              <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
            
            <p className="text-gray-400 text-sm">
              Need help?{' '}
              <Link href="/contact" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-slide-up-delay { animation: slide-up 0.6s ease-out 0.1s both; }
        .animate-fade-in-delay { animation: fade-in 0.5s ease-out 0.2s both; }
        .animate-shake { animation: shake 0.6s ease-in-out; }
      `}</style>
    </div>
  );
} 