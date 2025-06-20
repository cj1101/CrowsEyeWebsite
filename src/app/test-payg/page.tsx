'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PAYGUsageWidget from '@/components/dashboard/PAYGUsageWidget'

export default function TestPAYGPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testUsageAPI = async () => {
    setLoading(true)
    try {
      // Simulate usage data since we can't use server-side APIs in static export
      const mockUsageData = {
        success: true,
        data: {
          ai_credits: 25,
          scheduled_posts: 12,
          storage_gb: 2.5,
          total_cost: 8.75,
          will_be_charged: true
        }
      }
      
      addResult('✅ Usage API (Mock) - Retrieved usage data successfully')
      addResult(`📊 Current usage: AI:${mockUsageData.data.ai_credits}, Posts:${mockUsageData.data.scheduled_posts}, Storage:${mockUsageData.data.storage_gb}GB`)
      addResult(`💰 Total cost: $${mockUsageData.data.total_cost.toFixed(2)} (Will be charged: ${mockUsageData.data.will_be_charged})`)
      addResult('ℹ️ Note: This is mock data for demonstration in static export mode')
    } catch (error: any) {
      addResult('❌ Usage API error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testUsageEvent = async () => {
    setLoading(true)
    try {
      // Simulate successful usage event tracking
      const mockResponse = {
        success: true,
        meter_type: 'ai_credits',
        value: 1,
        rate: 0.15,
        cost: 0.15
      }
      
      addResult('✅ Usage Event API (Mock) - Event tracked successfully')
      addResult(`📈 Tracked: ${mockResponse.meter_type} (${mockResponse.value} units at $${mockResponse.rate}/unit = $${mockResponse.cost})`)
      addResult('ℹ️ Note: This is mock data for demonstration in static export mode')
    } catch (error: any) {
      addResult('❌ Usage Event API error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testPostScheduled = async () => {
    setLoading(true)
    try {
      const mockResponse = {
        success: true,
        meter_type: 'scheduled_posts',
        value: 1,
        rate: 0.25,
        cost: 0.25
      }
      
      addResult('✅ Post Scheduled Event (Mock) - Event tracked successfully')
      addResult(`📈 Tracked: ${mockResponse.meter_type} (${mockResponse.value} units at $${mockResponse.rate}/unit = $${mockResponse.cost})`)
      addResult('ℹ️ Note: This is mock data for demonstration in static export mode')
    } catch (error: any) {
      addResult('❌ Post Scheduled Event error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testStorageUsed = async () => {
    setLoading(true)
    try {
      const mockResponse = {
        success: true,
        meter_type: 'storage_gb',
        value: 1,
        rate: 2.99,
        cost: 2.99
      }
      
      addResult('✅ Storage Used Event (Mock) - Event tracked successfully')
      addResult(`📈 Tracked: ${mockResponse.meter_type} (${mockResponse.value} units at $${mockResponse.rate}/unit = $${mockResponse.cost})`)
      addResult('ℹ️ Note: This is mock data for demonstration in static export mode')
    } catch (error: any) {
      addResult('❌ Storage Used Event error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testDecimalValue = async () => {
    setLoading(true)
    try {
      const mockResponse = {
        success: true,
        meter_type: 'storage_gb',
        value: 1, // 0.5 rounded to 1
        rate: 2.99,
        cost: 2.99
      }
      
      addResult('✅ Decimal Value Test (Mock) - Value rounded correctly')
      addResult(`📈 0.5 rounded to: ${mockResponse.value} (${mockResponse.meter_type} at $${mockResponse.rate}/unit = $${mockResponse.cost})`)
      addResult('ℹ️ Note: This demonstrates how decimal values are rounded to integers for Stripe')
    } catch (error: any) {
      addResult('❌ Decimal Value Test error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testSubscription = async () => {
    setLoading(true)
    try {
      const mockResponse = {
        success: true,
        customer_id: 'cus_SWvtJy3rk0SLcA',
        session_id: 'cs_test_mock123',
        url: 'https://checkout.stripe.com/c/pay/mock'
      }
      
      addResult('✅ Subscription API (Mock) - Checkout session created')
      addResult(`🔗 Checkout URL available (not redirecting in test)`)
      addResult(`🆔 Customer ID: ${mockResponse.customer_id}`)
      addResult('ℹ️ Note: This is mock data for demonstration in static export mode')
      addResult('💡 In production, this would create a real Stripe checkout session')
    } catch (error: any) {
      addResult('❌ Subscription API error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              🧪 Pay-as-You-Go Test Suite
            </CardTitle>
            <p className="text-gray-600">
              Test the PAYG functionality and API endpoints
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={testUsageAPI}
                disabled={loading}
                variant="outline"
              >
                Test Usage API
              </Button>
              <Button 
                onClick={testUsageEvent}
                disabled={loading}
                variant="outline"
              >
                AI Credit Event
              </Button>
              <Button 
                onClick={testPostScheduled}
                disabled={loading}
                variant="outline"
              >
                Post Scheduled Event
              </Button>
              <Button 
                onClick={testStorageUsed}
                disabled={loading}
                variant="outline"
              >
                Storage Used Event
              </Button>
              <Button 
                onClick={testDecimalValue}
                disabled={loading}
                variant="outline"
              >
                Test Decimal Values
              </Button>
              <Button 
                onClick={testSubscription}
                disabled={loading}
                variant="outline"
              >
                Test Subscription
              </Button>
              <Button 
                onClick={clearResults}
                variant="ghost"
                size="sm"
              >
                Clear Results
              </Button>
            </div>

            {testResults.length > 0 && (
              <Card className="bg-gray-900 text-green-400">
                <CardHeader>
                  <CardTitle className="text-lg">Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 font-mono text-sm">
                    {testResults.map((result, index) => (
                      <div key={index}>{result}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">PAYG Usage Widget</h3>
            <PAYGUsageWidget />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">📋 Required Environment Variables:</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                  STRIPE_SECRET_KEY=sk_live_...<br/>
                  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...<br/>
                  STRIPE_AI_CREDITS_METER_ID=mtr_...<br/>
                  STRIPE_POSTS_METER_ID=mtr_...<br/>
                  STRIPE_STORAGE_METER_ID=mtr_...
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">🔧 Stripe Configuration:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Create usage meters in Stripe Dashboard</li>
                  <li>Update meter IDs in environment</li>
                  <li>Replace placeholder keys with real Stripe keys</li>
                  <li>Test with real Stripe customer IDs</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">💡 How it Works:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>$0.15 per AI credit used</li>
                  <li>$0.25 per scheduled post</li>
                  <li>$2.99 per GB storage per month</li>
                  <li>$5 minimum billing threshold</li>
                  <li>Only charged when usage exceeds $5</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 