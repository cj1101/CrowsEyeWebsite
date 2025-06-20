'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, UserIcon, ExclamationTriangleIcon, CheckCircleIcon, ShieldCheckIcon, GiftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

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
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [promoCodeApplied, setPromoCodeApplied] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<{
    configured: boolean;
    message?: string;
  }>({ configured: true });
  
  const { signup, loading: authLoading, isConfigured, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/marketing-tool');
    }
  }, [isAuthenticated, router]);

  // Check system status and promo codes on component mount
  useEffect(() => {
    const checkSystemStatus = () => {
      if (!isConfigured) {
        setSystemStatus({
          configured: false,
          message: 'Authentication service is running in demo mode. Account creation may be limited.'
        });
      }
    };

    // Check for applied promo codes
    const promoCode = localStorage.getItem('crowsEyePromoCode');
    const promoTier = localStorage.getItem('crowsEyePromoTier');
    
    if (promoCode && promoTier) {
      setPromoCodeApplied(promoTier);
    }

    checkSystemStatus();
  }, [isConfigured]);

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-yellow-500';
    if (passwordStrength <= 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters and spaces';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters and spaces';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the Terms of Service and Privacy Policy';
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
        // Check if lifetime promo was applied
        const promoTier = localStorage.getItem('crowsEyePromoTier');
        
        if (promoTier === 'lifetime_pro') {
          setSuccessMessage('🎉 LIFETIME PRO ACCESS ACTIVATED! Your account has been created with permanent Pro plan features. Welcome to Crow\'s Eye Marketing Suite!');
        } else if (promoTier) {
          setSuccessMessage('🎉 Account created with promotional benefits! Welcome to Crow\'s Eye Marketing Suite. Redirecting to your dashboard...');
        } else {
          setSuccessMessage('Account created successfully! Welcome to Crow\'s Eye Marketing Suite. Redirecting to your dashboard...');
        }
        
        // Check for redirect parameter (for PAYG setup)
        const redirectTo = searchParams.get('redirect');
        
        // Redirect after a short delay
        setTimeout(() => {
          if (redirectTo) {
            router.push(redirectTo);
          } else {
            router.push('/marketing-tool');
          }
        }, 3000);
      } else {
        // Handle specific error cases
        const errorMessage = result.error || 'Failed to create account. Please try again.';
        
        if (errorMessage.includes('email already exists') || errorMessage.includes('already registered')) {
          setErrors({ email: 'An account with this email already exists. Try signing in instead.' });
        } else if (errorMessage.includes('Invalid registration data')) {
          setErrors({ general: 'Please check your information and try again.' });
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          setErrors({ general: 'Network error. Please check your internet connection and try again.' });
        } else if (errorMessage.includes('Server error') || errorMessage.includes('temporarily unavailable')) {
          setErrors({ general: 'Our servers are temporarily unavailable. Please try again in a few moments.' });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8 animate-fade-in">
            <UserIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Join Crow's Eye</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 animate-slide-up">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Create Account
            </span>
          </h2>
          <p className="text-gray-300 text-lg animate-slide-up-delay">
            Start your social media marketing journey
          </p>
        </div>

        {/* Promotional Code Status */}
        {promoCodeApplied && (
          <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 mb-6 animate-bounce-in">
            <div className="flex items-center gap-3">
              <GiftIcon className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-green-200 text-sm font-semibold">
                  {promoCodeApplied === 'lifetime_pro' 
                    ? '🎉 LIFETIME PRO ACCESS ACTIVATED!' 
                    : '🎉 Promotional Code Applied!'}
                </p>
                <p className="text-green-300 text-xs">
                  {promoCodeApplied === 'lifetime_pro' 
                    ? 'You will have Pro plan features for life after signup.' 
                    : 'You will receive free access after signup.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Status Warning */}
        {!systemStatus.configured && (
          <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 mb-6 animate-bounce-in">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <p className="text-yellow-200 text-sm">{systemStatus.message}</p>
            </div>
          </div>
        )}

        {/* Sign Up Form */}
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
            {errors.general && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 animate-shake">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <p className="text-red-200 text-sm">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Name Fields */}
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

            {/* Email Field */}
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

            {/* Password Field */}
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
                  placeholder="Create a strong password"
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 1 ? 'text-red-400' :
                      passwordStrength <= 2 ? 'text-yellow-400' :
                      passwordStrength <= 3 ? 'text-blue-400' :
                      'text-green-400'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Use 8+ characters with uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
              )}
              
              {errors.password && <p className="text-red-400 text-sm mt-2">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
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

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500/20"
                  disabled={isLoading || authLoading}
                />
                <span className="text-sm text-gray-300">
                  I agree to the{' '}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && <p className="text-red-400 text-sm mt-2">{errors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || authLoading || !acceptTerms}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading || authLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-5 w-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

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