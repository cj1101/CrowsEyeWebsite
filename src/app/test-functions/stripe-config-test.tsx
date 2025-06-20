'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function StripeConfigTest() {
  const [configCheck, setConfigCheck] = React.useState<any>(null)
  
  const checkStripeConfig = async () => {
    // Client-side check
    const clientResults = {
      client: {
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PREFIX: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 8) || 'none',
      },
      localStorage: {
        auth_token: !!localStorage.getItem('auth_token'),
        user_email: localStorage.getItem('user_email') || 'none',
      }
    }

    // Try to check server-side via API
    try {
      const response = await fetch('/api/stripe-config-check')
      const serverData = await response.json()
      
      const results = {
        ...clientResults,
        server: serverData,
        note: 'Server check via API'
      }
      
      setConfigCheck(results)
      console.log('🔍 Stripe Configuration Check:', results)
    } catch (error) {
      // Fallback to client-side only
      const results = {
        ...clientResults,
        server: {
          STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
          STRIPE_SECRET_KEY_PREFIX: process.env.STRIPE_SECRET_KEY?.substring(0, 8) || 'none',
          NODE_ENV: process.env.NODE_ENV,
          note: 'Client-side check only (server check failed)'
        }
      }
      
      setConfigCheck(results)
      console.log('🔍 Stripe Configuration Check (client-side only):', results)
    }
  }
  
  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-blue-500" />
            Stripe Configuration Test
          </CardTitle>
          <CardDescription>
            Test the Stripe configuration to diagnose PAYG setup issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkStripeConfig} className="w-full">
            Check Configuration
          </Button>
          
          {configCheck && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Server Environment Variables</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>STRIPE_SECRET_KEY</span>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={configCheck.server.STRIPE_SECRET_KEY} />
                      <span className="text-sm text-gray-600">
                        {configCheck.server.STRIPE_SECRET_KEY_PREFIX}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>NODE_ENV</span>
                    <span className="text-sm">{configCheck.server.NODE_ENV}</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Client Environment Variables</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={configCheck.client.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} />
                      <span className="text-sm text-gray-600">
                        {configCheck.client.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PREFIX}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Authentication State</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Has Auth Token</span>
                    <StatusIcon status={configCheck.localStorage.auth_token} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>User Email</span>
                    <span className="text-sm">{configCheck.localStorage.user_email}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Troubleshooting:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Make sure your .env.local file contains STRIPE_SECRET_KEY</li>
                  <li>• Restart your development server after adding environment variables</li>
                  <li>• Check that your Stripe key starts with sk_test_ or sk_live_</li>
                  <li>• Ensure you're signed in to test PAYG functionality</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 