'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, UserIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, loginWithGoogle, loading, error, isAuthenticated } = useAuth();
  const router = useRouter();

  // Check for remembered email on component mount (client-side only)
  useEffect(() => {
    // Only access localStorage on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setFormData(prev => ({ ...prev, email: rememberedEmail }));
        setRememberMe(true);
      }
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else {
        // Already authenticated, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Handle remember me functionality (client-side only)
        if (typeof window !== 'undefined') {
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
        }

        setSuccessMessage('Login successful! Redirecting to dashboard...');
        
        // Check for stored redirect path first, otherwise redirect to dashboard
        const redirectPath = typeof window !== 'undefined' ? localStorage.getItem('redirectAfterLogin') : null;
        if (redirectPath && typeof window !== 'undefined') {
          localStorage.removeItem('redirectAfterLogin');
          
          // Small delay for success message visibility
          setTimeout(() => {
            router.push(redirectPath);
          }, 1500);
        } else {
          // Default redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } else {
        // Handle specific error cases
        const errorMessage = result.error || 'Login failed. Please try again.';
        
        if (errorMessage.includes('Invalid email or password')) {
          setErrors({ general: 'The email or password you entered is incorrect. Please try again.' });
        } else if (errorMessage.includes('Too many login attempts')) {
          setErrors({ general: 'Too many failed attempts. Please wait a few minutes before trying again.' });
        } else if (errorMessage.includes('Network error') || errorMessage.includes('connection')) {
          setErrors({ general: 'Network error. Please check your internet connection and try again.' });
        } else if (errorMessage.includes('Server error') || errorMessage.includes('temporarily unavailable')) {
          setErrors({ general: 'Our servers are temporarily unavailable. Please try again in a few moments.' });
        } else {
          setErrors({ general: errorMessage });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ general: 'An unexpected error occurred. Please try again or contact support.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setErrors({});

    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        const message = result.isNewUser 
          ? 'Welcome to Crow\'s Eye! Your account has been created successfully.'
          : 'Welcome back! Google sign-in successful.';
        
        setSuccessMessage(message);
        
        // Check for stored redirect path first, otherwise redirect to dashboard
        const redirectPath = typeof window !== 'undefined' ? localStorage.getItem('redirectAfterLogin') : null;
        if (redirectPath && typeof window !== 'undefined') {
          localStorage.removeItem('redirectAfterLogin');
          
          setTimeout(() => {
            router.push(redirectPath);
          }, 1500);
        } else {
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } else {
        setErrors({ general: result.error || 'Google sign-in failed. Please try again.' });
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setErrors({ general: 'Google sign-in failed. Please try again.' });
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8 animate-fade-in">
            <UserIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Welcome Back</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 animate-slide-up">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Sign In
            </span>
          </h2>
          <p className="text-gray-300 text-lg animate-slide-up-delay">
            Welcome back to Crow's Eye Marketing Suite
          </p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 animate-fade-in-delay">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 animate-bounce-in">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  <p className="text-green-200 text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {(error || errors.general) && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 animate-shake">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <p className="text-red-200 text-sm">{error || errors.general}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-3">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.email 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-white/20 focus:border-purple-500 focus:ring-purple-500/20'
                }`}
                placeholder="Enter your email"
                disabled={isSubmitting || loading}
              />
              {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 pr-12 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.password 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-white/20 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="Enter your password"
                  disabled={isSubmitting || loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                  disabled={isSubmitting || loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-2">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500/20"
                  disabled={isSubmitting || loading}
                />
                <span className="text-sm text-gray-300">Remember my email</span>
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || isSubmitting || isGoogleSigningIn}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading || isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-sm text-gray-400">or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || isSubmitting || isGoogleSigningIn}
            className="w-full bg-white text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg border border-gray-200"
          >
            {isGoogleSigningIn ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                Signing in with Google...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Links */}
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
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
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
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
        .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
        .animate-shake { animation: shake 0.6s ease-in-out; }
      `}</style>
    </div>
  );
} 