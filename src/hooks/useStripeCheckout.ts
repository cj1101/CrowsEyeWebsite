import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export type PricingPlan = 'creator' | 'pro'
export type BillingInterval = 'monthly' | 'yearly'

interface UseStripeCheckoutReturn {
  isLoading: boolean
  error: string | null
  createCheckoutSession: (plan: PricingPlan, interval: BillingInterval) => Promise<void>
  clearError: () => void
}

export const useStripeCheckout = (): UseStripeCheckoutReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const createCheckoutSession = async (plan: PricingPlan, interval: BillingInterval) => {
    setIsLoading(true)
    setError(null)

    try {
      // Call your API to create the checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          interval,
          userId: user?.uid || undefined,
          userEmail: user?.email || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    isLoading,
    error,
    createCheckoutSession,
    clearError,
  }
} 