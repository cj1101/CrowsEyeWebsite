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
      const response = await fetch('/api/billing/payg/usage')
      const data = await response.json()
      
      if (data.success) {
        addResult('✅ Usage API working - Retrieved usage data successfully')
        addResult(`📊 Current usage: AI:${data.data.ai_credits}, Posts:${data.data.scheduled_posts}, Storage:${data.data.storage_gb}GB`)
        addResult(`💰 Total cost: $${data.data.total_cost.toFixed(2)} (Will be charged: ${data.data.will_be_charged})`)
      } else {
        addResult('❌ Usage API failed: ' + data.error)
      }
    } catch (error: any) {
      addResult('❌ Usage API error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testUsageEvent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/billing/payg/usage-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: 'ai_credit_used',
          stripe_customer_id: 'cus_SWvtJy3rk0SLcA',
          value: 1
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        addResult('✅ Usage Event API working - Event tracked successfully')
        addResult(`📈 Tracked: ${data.meter_type} (${data.value} units at $${data.rate}/unit = $${data.cost})`)
      } else {
        addResult('❌ Usage Event API failed: ' + data.error)
      }
    } catch (error: any) {
      addResult('❌ Usage Event API error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testPostScheduled = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/billing/payg/usage-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: 'post_scheduled',
          stripe_customer_id: 'cus_SWvtJy3rk0SLcA',
          value: 1
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        addResult('✅ Post Scheduled Event - Event tracked successfully')
        addResult(`📈 Tracked: ${data.meter_type} (${data.value} units at $${data.rate}/unit = $${data.cost})`)
      } else {
        addResult('❌ Post Scheduled Event failed: ' + data.error)
      }
    } catch (error: any) {
      addResult('❌ Post Scheduled Event error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testStorageUsed = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/billing/payg/usage-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: 'storage_used',
          stripe_customer_id: 'cus_SWvtJy3rk0SLcA',
          value: 1
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        addResult('✅ Storage Used Event - Event tracked successfully')
        addResult(`📈 Tracked: ${data.meter_type} (${data.value} units at $${data.rate}/unit = $${data.cost})`)
      } else {
        addResult('❌ Storage Used Event failed: ' + data.error)
      }
    } catch (error: any) {
      addResult('❌ Storage Used Event error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testDecimalValue = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/billing/payg/usage-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: 'storage_used',
          stripe_customer_id: 'cus_SWvtJy3rk0SLcA',
          value: 0.5  // This should be rounded to 1
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        addResult('✅ Decimal Value Test - Value rounded correctly')
        addResult(`📈 0.5 rounded to: ${data.value} (${data.meter_type} at $${data.rate}/unit = $${data.cost})`)
      } else {
        addResult('❌ Decimal Value Test failed: ' + data.error)
      }
    } catch (error: any) {
      addResult('❌ Decimal Value Test error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/billing/payg/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: 'test@example.com',
          userId: 'test123'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        addResult('✅ Subscription API working - Checkout session created')
        addResult(`🔗 Checkout URL available (not redirecting in test)`)
        addResult(`🆔 Customer ID: ${data.customer_id}`)
      } else {
        addResult('❌ Subscription API failed: ' + data.error)
        if (data.error.includes('placeholder')) {
          addResult('⚠️  Need to configure Stripe keys in environment variables')
        }
      }
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