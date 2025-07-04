'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export interface SubscriptionData {
  id: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'trialing'
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
  const { user } = useAuth()
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

    try {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Use the correct API base URL and endpoint
      const apiBase = 'https://firebasestorage.googleapis.com';
      const response = await fetch(`${apiBase}/billing/subscription-status`, {
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
      
      // Transform the backend response to match frontend expectations
      if (data.success && data.data) {
        const subscriptionData: SubscriptionData = {
          id: data.data.stripeCustomerId || 'local',
          status: data.data.subscriptionStatus === 'active' ? 'active' : 'canceled',
          current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // Default 30 days
          cancel_at_period_end: false,
          plan: {
            id: data.data.plan,
            nickname: data.data.plan.charAt(0).toUpperCase() + data.data.plan.slice(1),
            amount: data.data.plan === 'payg' ? 0 : 1500, // $15 default
            currency: 'usd',
            interval: 'month'
          },
          customer: {
            id: data.data.stripeCustomerId || 'local',
            email: data.data.email
          }
        }
        setSubscription(subscriptionData)
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
  }, [user])

  // Open Stripe Customer Portal
  const openCustomerPortal = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://firebasestorage.googleapis.com';
      const response = await fetch(`${apiBase}/billing/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.open(url, '_blank')
    } catch (err) {
      console.error('Error opening customer portal:', err)
      // Fallback to a generic Stripe billing portal URL for demo
      // Billing portal disabled - contact support
      alert('Billing portal is currently disabled. Please contact support for assistance.')
    }
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!subscription) return

    try {
      const token = localStorage.getItem('auth_token')
      
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
      const token = localStorage.getItem('auth_token')
      
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