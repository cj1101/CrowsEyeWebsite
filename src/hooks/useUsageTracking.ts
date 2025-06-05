import { useState, useEffect } from 'react'

interface UsageLimits {
  apiCalls: number
  reportGeneration: number
  dataExport: number
}

interface UsageStatus {
  tier: string
  limits: UsageLimits
  currentUsage: UsageLimits
  remainingUsage: UsageLimits
  percentageUsed: {
    apiCalls: number
    reportGeneration: number
    dataExport: number
  }
}

export function useUsageTracking(userId?: string) {
  const [usage, setUsage] = useState<UsageStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track a usage event
  const trackUsage = async (usageType: 'api_call' | 'report_generation' | 'data_export', quantity = 1) => {
    if (!userId) {
      console.warn('Cannot track usage: userId not provided')
      return false
    }

    try {
      const response = await fetch('/api/usage/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          usageType,
          quantity,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to track usage')
      }

      const result = await response.json()
      console.log('✅ Usage tracked:', result)
      
      // Refresh usage data after tracking
      await refreshUsage()
      
      return true
    } catch (err) {
      console.error('❌ Error tracking usage:', err)
      setError(err instanceof Error ? err.message : 'Failed to track usage')
      return false
    }
  }

  // Get current usage status
  const refreshUsage = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/usage/check?userId=${encodeURIComponent(userId)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }

      const result = await response.json()
      setUsage(result.usage)
    } catch (err) {
      console.error('❌ Error fetching usage:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch usage data')
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user can perform an action based on limits
  const canPerformAction = (actionType: 'api_call' | 'report_generation' | 'data_export', quantity = 1): boolean => {
    if (!usage) return false

    const currentUsage = usage.currentUsage[actionType === 'api_call' ? 'apiCalls' : actionType === 'report_generation' ? 'reportGeneration' : 'dataExport']
    const limit = usage.limits[actionType === 'api_call' ? 'apiCalls' : actionType === 'report_generation' ? 'reportGeneration' : 'dataExport']
    
    // Unlimited tier
    if (limit === -1) return true
    
    // Check if action would exceed limit
    return (currentUsage + quantity) <= limit
  }

  // Get remaining usage for a specific type
  const getRemainingUsage = (actionType: 'api_call' | 'report_generation' | 'data_export'): number => {
    if (!usage) return 0

    const fieldName = actionType === 'api_call' ? 'apiCalls' : actionType === 'report_generation' ? 'reportGeneration' : 'dataExport'
    return usage.remainingUsage[fieldName]
  }

  // Auto-refresh usage on mount
  useEffect(() => {
    if (userId) {
      refreshUsage()
    }
  }, [userId])

  return {
    usage,
    isLoading,
    error,
    trackUsage,
    refreshUsage,
    canPerformAction,
    getRemainingUsage,
  }
} 