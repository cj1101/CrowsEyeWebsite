'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugStripePage() {
  const { user } = useAuth()
  const [envCheck, setEnvCheck] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const response = await fetch('/api/test-stripe')
        const data = await response.json()
        setEnvCheck(data)
      } catch (error) {
        console.error('Failed to check environment:', error)
        setEnvCheck({ error: 'Failed to load environment check' })
      } finally {
        setLoading(false)
      }
    }

    checkEnvironment()
  }, [])

  const testCheckout = async () => {
    if (!user) {
      alert('Please sign in first')
      return
    }

    try {
      console.log('Testing checkout with user:', user.email)
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: 'creator',
          hasByok: false,
          userId: user.uid,
          userEmail: user.email,
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        alert(`Checkout session created successfully! URL: ${data.url}`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Checkout test error:', error)
      alert(`Error: ${error}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div>Loading environment check...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Stripe Debug Page</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User Status</h2>
          <div className="bg-gray-800 p-4 rounded">
            <p>User: {user ? `${user.email} (${user.uid})` : 'Not signed in'}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="bg-gray-800 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(envCheck, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Checkout</h2>
          <button
            onClick={testCheckout}
            disabled={!user}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded font-semibold"
          >
            Test Creator Plan Checkout
          </button>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-4">
          <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Debug Information:</h3>
          <ul className="text-yellow-200 space-y-1 text-sm">
            <li>• Check the console for detailed logs</li>
            <li>• Verify all environment variables are set correctly</li>
            <li>• Ensure Stripe price IDs are from your live Stripe dashboard</li>
            <li>• Make sure webhook endpoints are configured</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 