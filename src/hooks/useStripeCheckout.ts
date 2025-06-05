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

      console.log(`🔍 Debug: Attempting checkout for plan: ${plan}, interval: ${interval}`)
      console.log(`🔍 Debug: Full PRICING_CONFIG:`, PRICING_CONFIG)

      // Get the payment link based on the pricing configuration
      const planConfig = PRICING_CONFIG[plan]?.[interval]
      
      console.log(`🔍 Debug: Plan config:`, planConfig)
      console.log(`🔍 Debug: Payment link:`, planConfig?.paymentLink)
      console.log(`🔍 Debug: Payment link includes buy.stripe.com:`, planConfig?.paymentLink?.includes('buy.stripe.com'))
      
      if (!planConfig) {
        throw new Error(`Plan configuration not found for ${plan} ${interval}`)
      }
      
      if (!planConfig.paymentLink) {
        throw new Error(`Payment link not found for ${plan} ${interval} plan`)
      }
      
      if (!planConfig.paymentLink.includes('buy.stripe.com')) {
        throw new Error(`Invalid payment link for ${plan} ${interval} plan: ${planConfig.paymentLink}`)
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