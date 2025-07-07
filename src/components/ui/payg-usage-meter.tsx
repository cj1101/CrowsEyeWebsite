'use client'

/**
 * PAY-AS-YOU-GO USAGE METER COMPONENT
 * ==================================
 * 
 * Real-time usage tracking and cost calculation for PAYG customers
 * Website-only component for Crow's Eye web platform
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { usePayAsYouGo, PAYGUsage } from '@/services/payg-usage'
import { USAGE_PRICING_CONFIG } from '@/lib/stripe'
import { 
  DollarSign, 
  Calculator, 
  RefreshCw,
  CreditCard,
  AlertCircle
} from 'lucide-react'

interface PAYGUsageMeterProps {
  userId?: string
  showEstimator?: boolean
  className?: string
}

export function PAYGUsageMeter({ userId, showEstimator = true, className = '' }: PAYGUsageMeterProps) {
  const [usage, setUsage] = useState<PAYGUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [estimatedUsage, setEstimatedUsage] = useState({
    ai_credits: 0,
    scheduled_posts: 0,
    storage_gb: 0
  })

  const { getCurrentUsage, getUsageEstimate } = usePayAsYouGo()

  useEffect(() => {
    loadUsageData()
  }, [userId])

  const loadUsageData = async () => {
    try {
      setLoading(true)
      const currentUsage = await getCurrentUsage()
      setUsage(currentUsage)
    } catch (error) {
      console.error('Failed to load usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getThresholdProgress = (usage: PAYGUsage): number => {
    return (usage.threshold_status.current_usage / usage.threshold_status.minimum_threshold) * 100
  }

  const renderUsageEstimator = () => {
    const estimate = getUsageEstimate(estimatedUsage)
    
    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Usage Cost Calculator
          </CardTitle>
          <CardDescription>
            See how much your projected usage would cost (no charges until you hit $5!)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-600 block mb-1">AI Credits</label>
              <input
                type="number"
                value={estimatedUsage.ai_credits}
                onChange={(e) => setEstimatedUsage(prev => ({
                  ...prev,
                  ai_credits: parseInt(e.target.value) || 0
                }))}
                className="w-full px-2 py-1 border rounded text-sm"
                min="0"
                placeholder="0"
              />
              <div className="text-xs text-gray-500 mt-1">$0.15 each</div>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Posts</label>
              <input
                type="number"
                value={estimatedUsage.scheduled_posts}
                onChange={(e) => setEstimatedUsage(prev => ({
                  ...prev,
                  scheduled_posts: parseInt(e.target.value) || 0
                }))}
                className="w-full px-2 py-1 border rounded text-sm"
                min="0"
                placeholder="0"
              />
              <div className="text-xs text-gray-500 mt-1">$0.25 each</div>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Storage (GB)</label>
              <input
                type="number"
                value={estimatedUsage.storage_gb}
                step="0.1"
                onChange={(e) => setEstimatedUsage(prev => ({
                  ...prev,
                  storage_gb: parseFloat(e.target.value) || 0
                }))}
                className="w-full px-2 py-1 border rounded text-sm"
                min="0"
                placeholder="0"
              />
              <div className="text-xs text-gray-500 mt-1">$2.99 per GB</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Total Usage Cost:</span>
                <span className="text-lg font-bold text-gray-700">
                  {formatCurrency(estimate.total)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium">You'll Be Charged:</span>
                <span className={`text-lg font-bold ${estimate.will_be_charged ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(estimate.billable_amount)}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-600 text-center">
              {!estimate.will_be_charged ? 
                "🎉 Under $5 - no charges yet!" : 
                `💳 You'll be charged ${formatCurrency(estimate.billable_amount)} (exceeded $5 threshold)`
              }
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usage) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Unable to load usage data</p>
          <Button onClick={loadUsageData} variant="outline" size="sm" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pay-as-you-Go Usage
              </CardTitle>
              <CardDescription>
                Current billing period: {new Date(usage.billing_period.start).toLocaleDateString()} - {new Date(usage.billing_period.end).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(usage.billable_amount)}
              </div>
              <Badge variant="secondary" className={`mt-1 ${usage.will_be_charged ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                <CreditCard className="h-3 w-3 mr-1" />
                {usage.will_be_charged ? 'Will be charged' : 'No charge yet'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* $5 Threshold Status */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                $5 Minimum Threshold
              </span>
              <span className="text-sm font-medium">
                {usage.will_be_charged ? 
                  'Threshold reached!' : 
                  `${formatCurrency(usage.threshold_status.remaining_until_charged)} until charged`
                }
              </span>
            </div>
            <Progress 
              value={getThresholdProgress(usage)} 
              className="h-2 mb-2" 
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Current: {formatCurrency(usage.threshold_status.current_usage)}</span>
              <span>Threshold: {formatCurrency(usage.threshold_status.minimum_threshold)}</span>
            </div>
          </div>

          {/* Current Usage Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">{usage.ai_credits}</div>
              <div className="text-xs text-gray-600">AI Credits</div>
              <div className="text-xs text-blue-500 mt-1">
                {formatCurrency(usage.cost_breakdown.ai_credits)}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">{usage.scheduled_posts}</div>
              <div className="text-xs text-gray-600">Scheduled Posts</div>
              <div className="text-xs text-purple-500 mt-1">
                {formatCurrency(usage.cost_breakdown.scheduled_posts)}
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-semibold text-orange-600">{usage.storage_gb.toFixed(1)} GB</div>
              <div className="text-xs text-gray-600">Storage Used</div>
              <div className="text-xs text-orange-500 mt-1">
                {formatCurrency(usage.cost_breakdown.storage_gb)}
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-3">This Month's Billing</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Usage Cost:</span>
                <span className="font-medium">{formatCurrency(usage.total_cost)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>You'll Be Charged:</span>
                <span className={usage.will_be_charged ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(usage.billable_amount)}
                  {!usage.will_be_charged && ' (under $5 threshold)'}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Simple, Transparent Pricing</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">AI Credits</div>
                <div className="text-gray-600">$0.15 per credit</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">Posts</div>
                <div className="text-gray-600">$0.25 per post</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">Storage</div>
                <div className="text-gray-600">$2.99 per GB</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button onClick={loadUsageData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Usage
            </Button>
          </div>

          {/* Benefits */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">✨ Your Pay-as-you-Go Benefits:</div>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>• No charges until you reach $5 in usage</li>
                <li>• Simple, transparent pricing - know exactly what you'll pay</li>
                <li>• Only pay for what you actually use</li>
                <li>• Scale up or down based on your needs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Estimator */}
      {showEstimator && renderUsageEstimator()}
    </div>
  )
} 