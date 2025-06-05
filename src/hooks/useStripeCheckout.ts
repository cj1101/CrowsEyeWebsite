import { useState } from 'react'
import { PRICING_CONFIG } from '@/lib/stripe'

export type PricingPlan = 'creator' | 'growth' | 'pro'
export type BillingInterval = 'monthly' | 'yearly'

export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCheckoutSession = async (plan: PricingPlan, interval: BillingInterval) => {
    try {
      setIsLoading(true)
      setError(null)

      // Get the payment link based on the pricing configuration
      const planConfig = PRICING_CONFIG[plan][interval]
      
      if (!planConfig.paymentLink || !planConfig.paymentLink.includes('buy.stripe.com')) {
        throw new Error(`Payment link not configured for ${plan} ${interval} plan. Please set up your Stripe payment links.`)
      }

      // Redirect to Stripe payment link
      window.location.href = planConfig.paymentLink
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start checkout'
      setError(errorMessage)
      console.error('Checkout error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    createCheckoutSession,
    isLoading,
    error,
    clearError,
  }
} 