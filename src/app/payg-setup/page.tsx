'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Calculator, Check, ArrowRight } from 'lucide-react'
import { PAYGUsageService } from '@/services/payg-usage'

export default function PAYGSetupPage() {
  const { user, userProfile, isAuthenticated, hasValidSubscription } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug environment variables
  useEffect(() => {
    console.log('🔍 PAYG Setup - Environment Check:', {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      nodeEnv: process.env.NODE_ENV,
      allStripeKeys: Object.keys(process.env).filter(k => k.includes('STRIPE'))
    })
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/payg-setup')
      return
    }

    // Check if user already has a different subscription
    if (userProfile && hasValidSubscription() && (userProfile.subscription_tier as string) !== 'payg') {
      console.log('User already has a different subscription:', userProfile.subscription_tier)
      return
    }

    // If user already has PAYG set up, redirect to dashboard
    if (userProfile && (userProfile.subscription_tier as string) === 'payg' && userProfile.subscription_status === 'active') {
      router.push('/marketing-tool')
    }
  }, [isAuthenticated, userProfile, hasValidSubscription, router])

  const handlePAYGSetup = async () => {
    console.log('🚀 Starting PAYG setup:', {
      hasUser: !!user,
      userEmail: user?.email,
      userUid: user?.uid
    })
    
    if (!user?.email) {
      setError('User email not found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const paygService = new PAYGUsageService()
      const result = await paygService.createPAYGAccount(user.email, user.uid)
      
      console.log('✅ PAYG account creation result:', result)
      
      if (result.url) {
        // Redirect to Stripe checkout
        console.log('🔄 Redirecting to Stripe checkout:', result.url)
        window.location.href = result.url
      } else {
        setError('Failed to create checkout session')
      }
    } catch (error: any) {
      console.error('❌ PAYG setup error:', error)
      
      // Provide more helpful error messages
      if (error.message?.includes('not configured')) {
        setError('Payment system is not configured. Please contact support or try again later.')
      } else if (error.message?.includes('Unable to create')) {
        setError('Unable to set up payment method. Please check your internet connection and try again.')
      } else {
        setError(error.message || 'Failed to set up pay-as-you-go account')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  // Show notice if user already has a different subscription
  if (userProfile && hasValidSubscription() && (userProfile.subscription_tier as string) !== 'payg') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Subscription Notice
                </span>
              </h1>
              <p className="text-xl text-gray-300">
                You already have an active subscription
              </p>
            </div>

            {/* Notice Card */}
            <Card className="border-orange-500/30 bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                  <CreditCard className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Active {userProfile.subscription_tier?.toUpperCase()} Plan</CardTitle>
                <CardDescription className="text-lg text-gray-700">
                  You currently have an active {userProfile.subscription_tier} subscription
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-3">📋 Next Steps</h3>
                  <div className="space-y-2 text-blue-700">
                    <p>• To switch to Pay-as-you-Go, first manage your current subscription</p>
                    <p>• Visit your account settings to view or modify your plan</p>
                    <p>• Contact support if you need assistance with plan changes</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => router.push('/account/subscription')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Manage Subscription
                  </Button>
                  <Button 
                    onClick={() => router.push('/marketing-tool')}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Complete Your Setup
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Add your payment method to activate pay-as-you-go billing
            </p>
          </div>

          {/* Main Setup Card */}
          <Card className="border-green-500/30 bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Pay-as-you-Go Setup</CardTitle>
              <CardDescription className="text-lg text-gray-700">
                You're just one step away from using Crow's Eye!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* How it works */}
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-3 flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  How It Works
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded flex-shrink-0 mt-0.5">1</div>
                    <span>Add your payment method (no charges yet!)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded flex-shrink-0 mt-0.5">2</div>
                    <span>Start using AI credits, scheduling posts, storing media</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded flex-shrink-0 mt-0.5">3</div>
                    <span>Get charged monthly only when you reach $5 in usage</span>
                  </div>
                </div>
              </div>

              {/* Pricing reminder */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-bold text-gray-900 mb-3">Simple Pricing</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">AI Credits:</span>
                    <span className="font-semibold text-green-600">$0.15 each</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Scheduled Posts:</span>
                    <span className="font-semibold text-green-600">$0.25 each</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Storage:</span>
                    <span className="font-semibold text-green-600">$2.99/GB/month</span>
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-900">Minimum monthly charge:</span>
                      <span className="text-green-700">$5.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3">✨ Benefits</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>No monthly commitments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>Scale up or down as needed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>Full access to all features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Setup button */}
              <Button 
                onClick={handlePAYGSetup} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Setting up your account...
                  </>
                ) : (
                  <>
                    Add Payment Method & Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Security note */}
              <p className="text-center text-sm text-gray-500">
                🔒 Secure payment processing powered by Stripe. Your payment information is never stored on our servers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 