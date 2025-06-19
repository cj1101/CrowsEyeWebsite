import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePayAsYouGo } from '@/services/payg-usage'

interface UsageDisplay {
  ai_credits: number
  scheduled_posts: number
  storage_gb: number
  total_cost: number
  will_be_charged: boolean
  billable_amount: number
  threshold_status: {
    minimum_threshold: number
    current_usage: number
    reached_threshold: boolean
    remaining_until_charged: number
  }
  pricing_info?: {
    ai_credits: string
    scheduled_posts: string
    storage_gb: string
  }
}

export default function PAYGUsageWidget() {
  const [usage, setUsage] = useState<UsageDisplay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { getCurrentUsage } = usePayAsYouGo()

  useEffect(() => {
    loadUsage()
  }, [])

  const loadUsage = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCurrentUsage()
      setUsage(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load usage data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePAYGAccount = async () => {
    // This would trigger the PAYG subscription flow
    try {
      const response = await fetch('/api/billing/payg/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: 'user@example.com', // Get from auth context
          userId: 'user123', // Get from auth context
        }),
      })

      const result = await response.json()
      
      if (result.success && result.checkout_url) {
        window.location.href = result.checkout_url
      } else {
        throw new Error(result.error || 'Failed to create PAYG account')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create PAYG account')
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pay-as-You-Go Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-red-600">
            Pay-as-You-Go Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-600 text-sm">{error}</p>
            <Button 
              onClick={loadUsage}
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Need to set up Pay-as-You-Go billing?
              </p>
              <Button 
                onClick={handleCreatePAYGAccount}
                className="w-full"
              >
                Set Up PAYG Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usage) {
    return null
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Pay-as-You-Go Usage
          </CardTitle>
          <Badge 
            variant={usage.will_be_charged ? "destructive" : "secondary"}
            className="text-xs"
          >
            {usage.will_be_charged ? 'Will be charged' : 'Below $5 threshold'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Usage */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">AI Credits</span>
            <div className="text-right">
              <span className="font-medium">{usage.ai_credits}</span>
              <span className="text-gray-500 ml-2">{usage.pricing_info?.ai_credits || '$0.15 per credit'}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Scheduled Posts</span>
            <div className="text-right">
              <span className="font-medium">{usage.scheduled_posts}</span>
              <span className="text-gray-500 ml-2">{usage.pricing_info?.scheduled_posts || '$0.25 per post'}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Storage (GB)</span>
            <div className="text-right">
              <span className="font-medium">{usage.storage_gb}</span>
              <span className="text-gray-500 ml-2">{usage.pricing_info?.storage_gb || '$2.99 per GB/month'}</span>
            </div>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Usage</span>
            <span className="font-medium">{formatCurrency(usage.total_cost)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Minimum Threshold</span>
            <span className="font-medium">{formatCurrency(usage.threshold_status.minimum_threshold)}</span>
          </div>
          
          {!usage.will_be_charged && (
            <div className="flex justify-between items-center text-green-600">
              <span className="text-sm">Remaining Until Charged</span>
              <span className="font-medium">{formatCurrency(usage.threshold_status.remaining_until_charged)}</span>
            </div>
          )}
          
          {usage.will_be_charged && (
            <div className="flex justify-between items-center text-orange-600 font-medium">
              <span className="text-sm">Will be charged</span>
              <span>{formatCurrency(usage.billable_amount)}</span>
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 You're only charged when your usage exceeds $5 in a billing period. 
            Track your usage here and pay only for what you use!
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={loadUsage}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Refresh Usage
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="flex-1"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 