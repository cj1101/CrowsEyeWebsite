'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Calculator, Check, ArrowRight, AlertCircle } from 'lucide-react'

export default function PAYGSetupPage() {
  const { user, userProfile, isAuthenticated, hasValidSubscription, updateUserSubscription } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupComplete, setSetupComplete] = useState(false)

  // Check URL params for Stripe session completion
  useEffect(() => {
    const sessionId = searchParams?.get('session_id')
    const customerId = searchParams?.get('customer_id')
    
    if (sessionId && customerId && userProfile) {
      handleSetupCompletion(customerId)
    }
  }, [searchParams, userProfile])

  // Handle setup completion from Stripe redirect
  const handleSetupCompletion = async (customerId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🎉 PAYG setup completed, updating user...')
      
      const result = await updateUserSubscription(customerId)
      
      if (result.success) {
        setSetupComplete(true)
        setTimeout(() => {
          router.push('/marketing-tool?setup=complete')
        }, 2000)
      } else {
        setError(result.error || 'Failed to complete setup')
      }
    } catch (error: any) {
      console.error('Setup completion failed:', error)
      setError(error?.message || 'Failed to complete PAYG setup')
    } finally {
      setLoading(false)
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/payg-setup')
      return
    }

    // Check if user already has a different subscription
    if (userProfile && hasValidSubscription() && (userProfile.subscription_tier as string) !== 'payg') {
      console.log('User already has a different subscription:', userProfile.subscription_tier)
      router.push('/marketing-tool')
      return
    }

    // If user already has PAYG set up, redirect to dashboard
    if (userProfile && (userProfile.subscription_tier as string) === 'payg' && (userProfile as any).stripe_customer_id) {
      router.push('/marketing-tool')
    }
  }, [isAuthenticated, userProfile, hasValidSubscription, router])

  const handleStartPAYGSetup = async () => {
    if (!userProfile) {
      setError('User profile not available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🚀 Starting PAYG setup...')
      
      // Call backend API to create PAYG subscription
      const response = await fetch('/api/billing/payg/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          customerEmail: userProfile.email,
          userId: userProfile.id,
          successUrl: `${window.location.origin}/payg-setup`,
          cancelUrl: `${window.location.origin}/payg-setup?cancelled=true`
        })
      })

      const data = await response.json()

      if (data.success && data.url) {
        console.log('✅ PAYG setup session created, redirecting to Stripe...')
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create payment setup session')
      }

    } catch (error: any) {
      console.error('❌ PAYG setup failed:', error)
      setError(error?.message || 'Failed to start PAYG setup')
    } finally {
      setLoading(false)
    }
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center p-4">
        <Card className="max-w-lg mx-auto bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-10 w-10 text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-400">Setup Complete!</CardTitle>
            <CardDescription className="text-gray-400">
              Your Pay-as-you-Go account is now active. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Setup Pay-as-you-Go
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Add your payment method to start using Crow's Eye with transparent, usage-based pricing
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center text-red-300">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Setup Card */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <CreditCard className="h-6 w-6 mr-3" />
                Payment Method Setup
              </CardTitle>
              <CardDescription className="text-gray-400">
                We'll securely collect your payment information. No charges until you reach $5 in usage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* How It Works */}
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-3">🎯 How Pay-as-you-Go Works:</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">1</span>
                    <span>Add your payment method (secure, encrypted)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">2</span>
                    <span>Use Crow's Eye freely - track your usage in real-time</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">3</span>
                    <span>Get charged monthly only when you reach $5 in usage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">4</span>
                    <span>Cancel anytime - no commitments or hidden fees</span>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-400 mb-3 flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Transparent Pricing
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-gray-700">
                    <span className="text-gray-300">AI Credits:</span>
                    <span className="font-bold text-green-400">$0.15 each</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700">
                    <span className="text-gray-300">Scheduled Posts:</span>
                    <span className="font-bold text-green-400">$0.25 each</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700">
                    <span className="text-gray-300">Storage:</span>
                    <span className="font-bold text-green-400">$2.99/GB/month</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-green-500/20 px-3 rounded border border-green-500/30 mt-3">
                    <span className="font-bold text-green-300">Minimum monthly charge:</span>
                    <span className="font-bold text-green-300 text-lg">$5.00</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                <div className="flex items-center text-blue-300">
                  <Check className="h-5 w-5 mr-2" />
                  <span className="font-medium">Secure & Encrypted</span>
                </div>
                <p className="text-blue-200 text-sm mt-2">
                  Your payment information is processed securely by Stripe and never stored on our servers.
                </p>
              </div>

              {/* Setup Button */}
              <div className="pt-4">
                <Button
                  onClick={handleStartPAYGSetup}
                  disabled={loading}
                  className="w-full text-lg py-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Setting up payment method...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-3" />
                      Add Payment Method & Complete Setup
                      <ArrowRight className="h-5 w-5 ml-3" />
                    </div>
                  )}
                </Button>
                <p className="text-center text-gray-400 text-sm mt-3">
                  No charges until you reach $5 in usage • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back Link */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/pricing')}
              className="text-gray-400 hover:text-white"
            >
              ← Back to Pricing Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 