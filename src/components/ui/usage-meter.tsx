'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'

interface UsageItem {
  name: string
  used: number
  rate: number
  unit: string
  cost: number
  icon?: React.ReactNode
}

interface UsageMeterProps {
  plan: 'payg' | 'creator' | 'growth' | 'pro'
  usage: {
    aiCredits: number
    scheduledPosts: number
    storageGB: number
  }
  currentMonth?: string
}

export function UsageMeter({ plan, usage, currentMonth = 'November 2024' }: UsageMeterProps) {
  if (plan !== 'payg') {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Plan Usage
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-300">AI Credits Used</span>
              <span className="text-white font-medium">{usage.aiCredits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Posts Scheduled</span>
              <span className="text-white font-medium">{usage.scheduledPosts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Storage Used</span>
              <span className="text-white font-medium">{usage.storageGB} GB</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const usageItems: UsageItem[] = [
    {
      name: 'AI Credits',
      used: usage.aiCredits,
      rate: 0.15,
      unit: 'credit',
      cost: usage.aiCredits * 0.15
    },
    {
      name: 'Scheduled Posts',
      used: usage.scheduledPosts,
      rate: 0.25,
      unit: 'post',
      cost: usage.scheduledPosts * 0.25
    },
    {
      name: 'Storage',
      used: usage.storageGB,
      rate: 2.99,
      unit: 'GB/month',
      cost: usage.storageGB * 2.99
    }
  ]

  const totalCost = usageItems.reduce((sum, item) => sum + item.cost, 0)
  const minimumCharge = 5.00
  const finalCost = Math.max(totalCost, minimumCharge)

  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Pay-as-you-Go Usage
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300">
            {currentMonth}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageItems.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">{item.name}</span>
              <div className="text-right">
                <div className="text-white font-medium">
                  {item.used} {item.unit}
                </div>
                <div className="text-xs text-gray-400">
                  ${item.rate}/{item.unit}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Cost:</span>
              <span className="text-emerald-400 font-medium">
                ${item.cost.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
        
        <div className="border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
            <span>Subtotal:</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
          {totalCost < minimumCharge && (
            <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
              <span>Minimum charge:</span>
              <span>${minimumCharge.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-white">Total:</span>
            <span className="text-emerald-400">${finalCost.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
          <p className="text-emerald-300 text-sm">
            💡 <strong>Pro tip:</strong> Switch to a monthly plan when your usage consistently exceeds $15-20/month for better value!
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 