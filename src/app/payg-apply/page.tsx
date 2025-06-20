'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, CreditCard, Sparkles, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function PAYGApplyPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [enrollmentData, setEnrollmentData] = useState<any>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Get enrollment data from session storage
    const data = sessionStorage.getItem('payg_enrollment_data')
    if (data) {
      try {
        const parsedData = JSON.parse(data)
        setEnrollmentData(parsedData)
      } catch (error) {
        console.error('Error parsing enrollment data:', error)
        router.push('/payg-terms')
      }
    } else {
      // No enrollment data, redirect back to start
      router.push('/payg-terms')
    }
  }, [router])

  const handleApplyMembership = async () => {
    if (!enrollmentData) return

    setIsApplying(true)
    setError('')

    try {
      // Create the account using the signup function
      const result = await signup(
        enrollmentData.email,
        enrollmentData.password,
        enrollmentData.firstName,
        enrollmentData.lastName
      )

      if (result.success) {
        // Clear enrollment data
        sessionStorage.removeItem('payg_enrollment_data')
        
        // Mark as complete
        setIsComplete(true)
        
        // Redirect to PAYG setup page after a short delay
        setTimeout(() => {
          router.push('/payg-setup')
        }, 3000)
      } else {
        setError(result.error || 'Failed to create account. Please try again.')
      }
    } catch (error: any) {
      console.error('Apply membership error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  if (!enrollmentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading enrollment data...</p>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-fit">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Welcome to Crow's Eye!
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Your PAYG account has been created successfully. Redirecting to payment setup...
              </p>
              
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
                <h3 className="text-green-400 font-semibold mb-2">✨ What's Next?</h3>
                <p className="text-green-300 text-sm">
                  You'll be redirected to add your payment method. Don't worry - you won't be charged until you use $5 worth of services!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Apply Membership
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Finalize your PAYG account creation
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
              <div className="w-8 h-1 bg-green-500"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="ml-2 text-sm text-green-400">Details Entered</span>
              </div>
              <div className="w-8 h-1 bg-purple-500"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <span className="ml-2 text-sm text-purple-400">Apply Membership</span>
              </div>
            </div>
          </div>

          {/* Application Summary */}
          <Card className="border-purple-500/30 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm mb-6">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-white">Application Summary</CardTitle>
              <CardDescription className="text-gray-300">
                Review your information before applying
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">{enrollmentData.firstName} {enrollmentData.lastName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">{enrollmentData.email}</span>
                  </div>
                </div>
              </div>

              {/* Plan Information */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-3 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay-as-you-Go Plan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
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
                <div className="bg-green-500/20 rounded p-3">
                  <p className="text-green-300 text-sm">
                    🎉 <strong>No upfront costs!</strong> You'll only be charged when you reach $5 in usage.
                  </p>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-3">What Happens Next?</h4>
                <div className="space-y-2 text-sm text-blue-300">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs">1</span>
                    </div>
                    <span>Your account will be created instantly</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs">2</span>
                    </div>
                    <span>You'll add a payment method for future billing</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs">3</span>
                    </div>
                    <span>Start using Crow's Eye immediately!</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {/* Apply Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => router.push('/payg-enrollment')}
                  variant="outline"
                  className="border-gray-500 text-gray-300 hover:bg-gray-700"
                  disabled={isApplying}
                >
                  Back to Edit Details
                </Button>
                <Button 
                  onClick={handleApplyMembership}
                  disabled={isApplying}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                >
                  {isApplying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Your Account...
                    </>
                  ) : (
                    <>
                      Apply PAYG Membership
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 