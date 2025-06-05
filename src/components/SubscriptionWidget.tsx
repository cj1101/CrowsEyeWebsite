'use client'

import React from 'react'
import { 
  CreditCardIcon, 
  CogIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement'

interface SubscriptionWidgetProps {
  compact?: boolean
  showActions?: boolean
}

export default function SubscriptionWidget({ 
  compact = false, 
  showActions = true 
}: SubscriptionWidgetProps) {
  const { subscription, isLoading, openCustomerPortal } = useSubscriptionManagement()

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'trialing':
        return 'text-blue-600 bg-blue-100'
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100'
      case 'canceled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow ${compact ? 'p-3' : 'p-4'} animate-pulse`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className={`bg-white rounded-lg shadow border-l-4 border-gray-400 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="h-6 w-6 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">No Active Subscription</p>
              {!compact && (
                <p className="text-sm text-gray-600">Choose a plan to get started</p>
              )}
            </div>
          </div>
          {showActions && (
            <a
              href="/pricing"
              className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors"
            >
              View Plans
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 border-green-400 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircleIcon className="h-6 w-6 text-green-500" />
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900">{subscription.plan.nickname}</p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                {subscription.status}
              </span>
            </div>
            {!compact && (
              <p className="text-sm text-gray-600">
                {formatPrice(subscription.plan.amount, subscription.plan.currency)}/{subscription.plan.interval}
              </p>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            <button
              onClick={openCustomerPortal}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <CogIcon className="h-4 w-4 mr-1" />
              Manage
              <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
            </button>
          </div>
        )}
      </div>
      
      {!compact && subscription.cancel_at_period_end && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              Subscription will cancel at the end of your current billing period.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 