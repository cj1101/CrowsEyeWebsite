'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, UserIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [systemStatus, setSystemStatus] = useState<{
    configured: boolean;
    message?: string;
  }>({ configured: true });
  
  const { signup, loading: authLoading, isConfigured } = useAuth();
  const router = useRouter();

  // Check system status on component mount
  useEffect(() => {
    const checkSystemStatus = () => {
      if (!isConfigured) {
        setSystemStatus({
          configured: false,
          message: 'Authentication service is running in demo mode. Account creation may be limited.'
        });
      }
    };

    checkSystemStatus();
  }, [isConfigured]);

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase and one lowercase letter';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await signup(formData.email, formData.password, formData.firstName, formData.lastName);
      
      if (result.success) {
        setSuccessMessage('Account created successfully! Please check your email for verification.');
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        // Handle specific error cases
        const errorMessage = result.error || 'Failed to create account. Please try again.';
        
        if (errorMessage.includes('email already exists')) {
          setErrors({ email: 'An account with this email already exists' });
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          setErrors({ general: 'Network error. Please check your internet connection and try again.' });
        } else if (errorMessage.includes('not available')) {
          setErrors({ general: 'Account creation service is temporarily unavailable. Please try again later.' });
        } else {
          setErrors({ general: errorMessage });
        }
      }
    } catch (error) {
      console.error('Error creating account:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again or contact support if the problem persists.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
            <UserIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Join Crow's Eye</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Create Account
            </span>
          </h2>
          <p className="text-gray-300 text-lg">
            Start your journey with Crow's Eye Marketing Suite
          </p>
        </div>

        {/* System Status Warning */}
        {!systemStatus.configured && (
          <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <p className="text-yellow-200 text-sm">{systemStatus.message}</p>
            </div>
          </div>
        )}

        {/* Sign Up Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
          {successMessage ? (
            <div className="text-center">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <p className="text-green-400">{successMessage}</p>
              </div>
              <p className="text-gray-300 text-sm">Redirecting you to the dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-200 text-sm text-center">{errors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-3">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.firstName 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-white/20 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                    placeholder="First name"
                    disabled={isLoading || authLoading}
                  />
                  {errors.firstName && <p className="text-red-400 text-sm mt-2">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-3">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.lastName 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-white/20 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                    placeholder="Last name"
                    disabled={isLoading || authLoading}
                  />
                  {errors.lastName && <p className="text-red-400 text-sm mt-2">{errors.lastName}</p>}
                </div>
              </div>

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
                  disabled={isLoading || authLoading}
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
                    placeholder="Create a password"
                    disabled={isLoading || authLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                    disabled={isLoading || authLoading}
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 pr-12 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-white/20 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                    placeholder="Confirm your password"
                    disabled={isLoading || authLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                    disabled={isLoading || authLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-2">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
              >
                {isLoading || authLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Links */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
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