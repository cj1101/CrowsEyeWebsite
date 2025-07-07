'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/firebase'

export interface SubscriptionData {
  id: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'trialing' | 'free'
  current_period_end: number
  cancel_at_period_end: boolean
  plan: {
    id: string
    nickname: string
    amount: number
    currency: string
    interval: string
  }
  customer: {
    id: string
    email: string
  }
}

export interface UseSubscriptionManagementReturn {
  subscription: SubscriptionData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  openCustomerPortal: () => Promise<void>
  cancelSubscription: () => Promise<void>
  resumeSubscription: () => Promise<void>
  updatePaymentMethod: () => Promise<void>
  downloadInvoices: () => Promise<void>
}

export const useSubscriptionManagement = (): UseSubscriptionManagementReturn => {
  const { user, userProfile } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch subscription data
  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    // Handle free user case locally
    if (userProfile && (userProfile.plan === 'free' || userProfile.subscription_tier === 'free')) {
      const freeSubscription: SubscriptionData = {
        id: 'free-plan',
        status: 'free',
        current_period_end: 0,
        cancel_at_period_end: false,
        plan: {
          id: 'free',
          nickname: 'Free',
          amount: 0,
          currency: 'usd',
          interval: 'month',
        },
        customer: {
          id: user.uid,
          email: user.email || '',
        },
      }
      setSubscription(freeSubscription)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }
      const token = await auth.currentUser.getIdToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/billing/subscription-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch subscription')
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        setSubscription(data.data)
      } else {
        setSubscription(null)
      }
      setError(null)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }, [user, userProfile])

  // Open Stripe Customer Portal
  const openCustomerPortal = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }
      const token = await auth.currentUser.getIdToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ return_url: window.location.href })
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.open(url, '_blank')
    } catch (err) {
      console.error('Error opening customer portal:', err)
      alert('Billing portal is currently disabled. Please contact support for assistance.')
    }
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!subscription) return

    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }
      const token = await auth.currentUser.getIdToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      await fetchSubscription() // Refresh data
    } catch (err) {
      console.error('Error canceling subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription')
    }
  }

  // Resume subscription
  const resumeSubscription = async () => {
    if (!subscription) return

    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }
      const token = await auth.currentUser.getIdToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/resume-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to resume subscription')
      }

      await fetchSubscription() // Refresh data
    } catch (err) {
      console.error('Error resuming subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to resume subscription')
    }
  }

  // Update payment method (opens portal)
  const updatePaymentMethod = async () => {
    await openCustomerPortal()
  }

  // Download invoices (opens portal)
  const downloadInvoices = async () => {
    await openCustomerPortal()
  }

  // Fetch subscription on mount and when user changes
  useEffect(() => {
    fetchSubscription()
  }, [user, fetchSubscription])

  return {
    subscription,
    isLoading,
    error,
    refetch: fetchSubscription,
    openCustomerPortal,
    cancelSubscription,
    resumeSubscription,
    updatePaymentMethod,
    downloadInvoices,
  }
} 