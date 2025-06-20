'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, CreditCard, ArrowRight, Check, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function PAYGEnrollmentPage() {
  const router = useRouter()
  const { isAuthenticated, userProfile, loading } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)

  // Check authentication status and redirect if logged in
  useEffect(() => {
    console.log('🔍 PAYG Enrollment - Auth Check:', {
      loading,
      isAuthenticated,
      hasUserProfile: !!userProfile,
      userEmail: userProfile?.email
    })
    
    if (!loading && isAuthenticated && userProfile) {
      // User is already logged in, redirect to PAYG setup immediately
      console.log('✅ User is authenticated, redirecting to PAYG setup')
      router.replace('/payg-setup')
      return
    }
  }, [loading, isAuthenticated, userProfile, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, don't show enrollment form at all
  if (isAuthenticated && userProfile) {
    return null; // The useEffect will redirect them to /payg-setup
  }

  // Rest of the component for unauthenticated users
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      // Store enrollment data temporarily
      sessionStorage.setItem('payg_enrollment_data', JSON.stringify({
        ...formData,
        plan: 'payg',
        timestamp: Date.now()
      }))
      
      // Redirect to apply membership page
      router.push('/payg-apply')
    } catch (error) {
      console.error('Enrollment error:', error)
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                PAYG Enrollment
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Enter your information to create your pay-as-you-go account
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Already have an account? <button 
                onClick={() => router.push('/auth/signin')} 
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Sign in here
              </button>
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="ml-2 text-sm text-green-400">Terms Accepted</span>
              </div>
              <div className="w-8 h-1 bg-blue-500"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="ml-2 text-sm text-blue-400">Enter Details</span>
              </div>
              <div className="w-8 h-1 bg-gray-600"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-bold">3</span>
                </div>
                <span className="ml-2 text-sm text-gray-400">Apply Membership</span>
              </div>
            </div>
          </div>

          {/* Enrollment Form */}
          <Card className="border-purple-500/30 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-white">Account Information</CardTitle>
              <CardDescription className="text-gray-300">
                Create your PAYG account to get started
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {errors.general && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="text-red-200">{errors.general}</p>
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.firstName 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-white/20 focus:border-purple-500 focus:ring-purple-500/20'
                      }`}
                      placeholder="First name"
                      disabled={isLoading}
                    />
                    {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.lastName 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-white/20 focus:border-purple-500 focus:ring-purple-500/20'
                      }`}
                      placeholder="Last name"
                      disabled={isLoading}
                    />
                    {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-white/20 focus:border-purple-500 focus:ring-purple-500/20'
                      }`}
                      placeholder="your@email.com"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password *
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.password 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-white/20 focus:border-purple-500 focus:ring-purple-500/20'
                      }`}
                      placeholder="Create password"
                      disabled={isLoading}
                    />
                    {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-white/20 focus:border-purple-500 focus:ring-purple-500/20'
                      }`}
                      placeholder="Confirm password"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* PAYG Summary */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-2 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay-as-you-Go Plan Summary
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">AI Credits:</span>
                      <span className="text-green-400 font-semibold ml-2">$0.15 each</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Scheduled Posts:</span>
                      <span className="text-green-400 font-semibold ml-2">$0.25 each</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Storage:</span>
                      <span className="text-green-400 font-semibold ml-2">$2.99/GB</span>
                    </div>
                  </div>
                  <p className="text-green-300 text-sm mt-2">
                    💡 Minimum monthly charge: $5.00 (only when you use services)
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="button"
                    onClick={() => router.push('/payg-terms')}
                    variant="outline"
                    className="border-gray-500 text-gray-300 hover:bg-gray-700"
                    disabled={isLoading}
                  >
                    Back to Terms
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue to Apply Membership
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 