'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, FileText, Shield, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function PAYGTermsPage() {
  const router = useRouter()
  const { isAuthenticated, userProfile, loading } = useAuth()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

  // Debug auth state
  console.log('🔍 PAYG Terms - Auth State:', {
    loading,
    isAuthenticated,
    hasUserProfile: !!userProfile,
    userEmail: userProfile?.email,
    firstName: userProfile?.firstName,
    displayName: userProfile?.displayName
  })

  const handleContinue = () => {
    if (acceptedTerms && acceptedPrivacy) {
      if (isAuthenticated && userProfile) {
        // User is logged in, go directly to PAYG setup
        console.log('User is authenticated, skipping enrollment and going to PAYG setup')
        router.push('/payg-setup')
      } else {
        // User is not logged in, go to enrollment
        console.log('User is not authenticated, going to enrollment')
        router.push('/payg-enrollment')
      }
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Pay-as-you-Go Terms
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Please review and accept our terms before proceeding with PAYG {isAuthenticated && userProfile ? 'setup' : 'enrollment'}
            </p>
            {isAuthenticated && userProfile && (
              <p className="text-sm text-green-400 mt-2">
                Hi {userProfile.firstName || userProfile.displayName}! We'll add PAYG to your existing account.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Terms of Service */}
            <Card className="border-blue-500/30 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Terms of Service</CardTitle>
                    <CardDescription className="text-gray-600">
                      Our service terms and conditions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <div className="space-y-3 text-sm text-gray-700">
                    <h4 className="font-semibold text-gray-900">Pay-as-you-Go Service Terms</h4>
                    <p>
                      By enrolling in our Pay-as-you-Go plan, you agree to the following terms:
                    </p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>You will be charged only for services you actually use</li>
                      <li>A valid payment method must be on file at all times</li>
                      <li>Minimum monthly charge of $5.00 applies when usage occurs</li>
                      <li>Usage rates: AI Credits ($0.15 each), Scheduled Posts ($0.25 each), Storage ($2.99/GB/month)</li>
                      <li>You may cancel or modify your plan at any time</li>
                      <li>No refunds for usage already consumed</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-4">
                      These terms are in addition to our general Terms of Service available at /terms
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm">
                    I have read and agree to the Terms of Service
                  </span>
                </label>
              </CardContent>
            </Card>

            {/* Privacy Policy */}
            <Card className="border-green-500/30 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Privacy Policy</CardTitle>
                    <CardDescription className="text-gray-600">
                      How we protect and use your data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <div className="space-y-3 text-sm text-gray-700">
                    <h4 className="font-semibold text-gray-900">Privacy & Data Protection</h4>
                    <p>
                      Your privacy is important to us. Here's how we handle your data:
                    </p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Payment information is securely processed by Stripe</li>
                      <li>Usage data is collected only for billing purposes</li>
                      <li>Your content and media remain your property</li>
                      <li>We never sell or share your personal information</li>
                      <li>Data is encrypted in transit and at rest</li>
                      <li>You can request data deletion at any time</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-4">
                      Full privacy policy available at /privacy
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="rounded border-gray-400 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-700 text-sm">
                    I have read and agree to the Privacy Policy
                  </span>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-50 to-pink-50 mb-8">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">What happens next?</CardTitle>
              <CardDescription className="text-lg text-gray-700">
                {isAuthenticated && userProfile 
                  ? "After accepting these terms, you'll proceed to payment setup"
                  : "After accepting these terms, you'll proceed to enrollment"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                {isAuthenticated && userProfile ? (
                  // Steps for logged in users - skip enrollment
                  <>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600 mb-2">1</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Add Payment Method</h4>
                      <p className="text-sm text-gray-600">Secure payment setup via Stripe</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600 mb-2">2</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Start Using</h4>
                      <p className="text-sm text-gray-600">Access all features immediately</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Pay as You Go</h4>
                      <p className="text-sm text-gray-600">Only charged when you reach $5 usage</p>
                    </div>
                  </>
                ) : (
                  // Steps for non-logged in users - include enrollment
                  <>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600 mb-2">1</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Enter Details</h4>
                      <p className="text-sm text-gray-600">Provide your information for PAYG setup</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600 mb-2">2</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Add Payment</h4>
                      <p className="text-sm text-gray-600">Secure payment method via Stripe</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Start Using</h4>
                      <p className="text-sm text-gray-600">Access all features immediately</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/pricing')}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Go Back to Pricing
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!acceptedTerms || !acceptedPrivacy}
              className={`px-8 py-3 text-lg ${
                acceptedTerms && acceptedPrivacy
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-400 text-gray-700 cursor-not-allowed'
              }`}
            >
              {acceptedTerms && acceptedPrivacy ? (
                <>
                  {isAuthenticated && userProfile ? 'Continue to Payment Setup' : 'Continue to Enrollment'}
                  <Check className="ml-2 h-5 w-5" />
                </>
              ) : (
                'Please accept both terms above'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 