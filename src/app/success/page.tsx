'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, CreditCard, ArrowRight, Calculator } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

function SuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUserProfile } = useAuth()
  const [isProcessing, setIsProcessing] = useState(true)
  
  const sessionId = searchParams?.get('session_id')
  const customerId = searchParams?.get('customer_id')
  const plan = searchParams?.get('plan')

  useEffect(() => {
    // Refresh user profile to update subscription status
    const handleSuccess = async () => {
      try {
        await refreshUserProfile()
        console.log('✅ User profile refreshed after successful payment setup')
      } catch (error) {
        console.error('❌ Failed to refresh user profile:', error)
      } finally {
        setIsProcessing(false)
      }
    }

    if (sessionId) {
      handleSuccess()
    } else {
      setIsProcessing(false)
    }
  }, [sessionId, refreshUserProfile])

  const handleGoToDashboard = () => {
    router.push('/marketing-tool')
  }

  const handleViewUsage = () => {
    router.push('/account/subscription')
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Processing your payment setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Payment Method Added Successfully!
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              {plan === 'payg' 
                ? "Your pay-as-you-go account is now active and ready to use"
                : "Your subscription is now active and ready to use"
              }
            </p>
          </div>

          {/* Success Card */}
          <Card className="border-green-500/30 bg-gradient-to-br from-green-50 to-blue-50 mb-6">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                {plan === 'payg' ? 'Pay-as-you-Go Active' : 'Subscription Active'}
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                {plan === 'payg' 
                  ? "Start using Crow's Eye - you'll only be charged when you reach $5 in usage"
                  : "Start using all the features of your subscription"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {plan === 'payg' && (
                <>
                  {/* PAYG-specific content */}
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-green-800 mb-3 flex items-center">
                      <Calculator className="h-5 w-5 mr-2" />
                      How Pay-as-you-Go Works
                    </h3>
                    <div className="space-y-2 text-gray-700 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>Your payment method is saved securely</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>No charges until you reach $5 in usage</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>AI Credits: $0.15 each • Posts: $0.25 each • Storage: $2.99/GB</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>Track your usage anytime in your account settings</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-3">🚀 Next Steps</h3>
                    <div className="space-y-2 text-blue-700 text-sm">
                      <p>• Start creating and scheduling content</p>
                      <p>• Use AI features to enhance your posts</p>
                      <p>• Upload media to your library</p>
                      <p>• Monitor your usage in account settings</p>
                    </div>
                  </div>
                </>
              )}

              {/* Session details for debugging */}
              {sessionId && (
                <div className="bg-gray-50 p-3 rounded border text-xs">
                  <p className="text-gray-600">
                    Session ID: {sessionId}
                    {customerId && <span className="ml-4">Customer ID: {customerId}</span>}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleGoToDashboard}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-4"
            >
              Start Using Crow's Eye
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {plan === 'payg' && (
              <Button 
                onClick={handleViewUsage}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 text-lg py-4"
              >
                View Usage & Billing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
} 