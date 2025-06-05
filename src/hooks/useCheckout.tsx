'use client'

import { useState } from 'react'
import { STRIPE_PAYMENT_LINKS } from '@/lib/stripe'

type PricingPlan = 'creator' | 'growth' | 'pro'
type BillingInterval = 'monthly' | 'yearly'

export const useCheckout = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCheckoutSession = async (plan: PricingPlan, billingInterval: BillingInterval) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the appropriate payment link
      const linkKey = `${plan}_${billingInterval}` as keyof typeof STRIPE_PAYMENT_LINKS
      const paymentLink = STRIPE_PAYMENT_LINKS[linkKey]

      if (!paymentLink) {
        throw new Error('Payment link not found for this plan')
      }

      // Redirect to Stripe Checkout
      window.location.href = paymentLink
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    createCheckoutSession,
    isLoading,
    error,
    clearError,
  }
} 