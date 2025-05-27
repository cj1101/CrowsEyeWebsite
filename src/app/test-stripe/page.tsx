'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useStripeCheckout } from '@/hooks/useStripeCheckout'

export default function TestStripePage() {
  const { user } = useAuth()
  const { createCheckoutSession, loading, error } = useStripeCheckout()

  const testCheckout = async (tier: string, hasByok: boolean = false) => {
    if (!user) {
      alert('Please sign in first')
      return
    }

    await createCheckoutSession({ tier, hasByok })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Stripe Configuration Test</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User Status</h2>
          <p>User: {user ? `${user.email} (${user.uid})` : 'Not signed in'}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Environment Variables Check</h2>
          <div className="bg-gray-800 p-4 rounded">
            <p>STRIPE_SECRET_KEY: {process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p>STRIPE_CREATOR_PRICE_ID: {process.env.STRIPE_CREATOR_PRICE_ID || 'Not set'}</p>
            <p>STRIPE_GROWTH_PRICE_ID: {process.env.STRIPE_GROWTH_PRICE_ID || 'Not set'}</p>
            <p>STRIPE_PRO_PRICE_ID: {process.env.STRIPE_PRO_PRICE_ID || 'Not set'}</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded">
            <h3 className="font-semibold text-red-300">Error:</h3>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Checkout Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="font-semibold mb-2">Creator Plan</h3>
              <button
                onClick={() => testCheckout('creator', false)}
                disabled={loading || !user}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded mb-2"
              >
                {loading ? 'Loading...' : 'Test Creator ($19)'}
              </button>
              <button
                onClick={() => testCheckout('creator', true)}
                disabled={loading || !user}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
              >
                {loading ? 'Loading...' : 'Test Creator BYOK ($13.30)'}
              </button>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <h3 className="font-semibold mb-2">Growth Plan</h3>
              <button
                onClick={() => testCheckout('growth', false)}
                disabled={loading || !user}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded mb-2"
              >
                {loading ? 'Loading...' : 'Test Growth ($49)'}
              </button>
              <button
                onClick={() => testCheckout('growth', true)}
                disabled={loading || !user}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
              >
                {loading ? 'Loading...' : 'Test Growth BYOK ($34.30)'}
              </button>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <h3 className="font-semibold mb-2">Pro Plan</h3>
              <button
                onClick={() => testCheckout('pro', false)}
                disabled={loading || !user}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded mb-2"
              >
                {loading ? 'Loading...' : 'Test Pro ($89)'}
              </button>
              <button
                onClick={() => testCheckout('pro', true)}
                disabled={loading || !user}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
              >
                {loading ? 'Loading...' : 'Test Pro BYOK ($62.30)'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-4">
          <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Important Notes:</h3>
          <ul className="text-yellow-200 space-y-1">
            <li>• This is using test Stripe keys and placeholder price IDs</li>
            <li>• You need to create actual products in your Stripe Dashboard</li>
            <li>• Update the price IDs in your .env.local file</li>
            <li>• The checkout will fail until real price IDs are configured</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 