'use client';

import React, { useState } from 'react';
import { 
  CreditCardIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  DocumentArrowDownIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';

export default function SubscriptionPage() {
  const {
    subscription,
    isLoading,
    error,
    openCustomerPortal,
    cancelSubscription,
    resumeSubscription,
  } = useSubscriptionManagement();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (err) {
      console.error('Error opening portal:', err);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      setShowCancelConfirm(false);
    } catch (err) {
      console.error('Error canceling subscription:', err);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      await resumeSubscription();
    } catch (err) {
      console.error('Error resuming subscription:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6 w-1/3"></div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-300 rounded mb-4 w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your Crow's Eye subscription, billing, and payment methods
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!subscription ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Active Subscription</h3>
              <p className="mt-2 text-gray-600">
                You don't have an active subscription. Choose a plan to get started.
              </p>
              <div className="mt-6">
                <a
                  href="/pricing"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  View Plans
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Subscription Overview */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center">
                      <h4 className="text-xl font-semibold text-gray-900">
                        {subscription.plan.nickname}
                      </h4>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {formatPrice(subscription.plan.amount, subscription.plan.currency)}
                      <span className="text-sm font-normal text-gray-500">
                        /{subscription.plan.interval}
                      </span>
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Next billing date: {formatDate(subscription.current_period_end)}
                    </div>
                    {subscription.cancel_at_period_end && (
                      <div className="mt-2 flex items-center text-sm text-yellow-600">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        Subscription will cancel on {formatDate(subscription.current_period_end)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Subscription Actions</h3>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={handleManageSubscription}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <CogIcon className="h-4 w-4 mr-2" />
                    Manage Billing
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                  </button>
                  
                  <button
                    onClick={handleManageSubscription}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Update Payment
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                  </button>
                  
                  <button
                    onClick={handleManageSubscription}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download Invoices
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                  </button>
                  
                  {subscription.cancel_at_period_end ? (
                    <button
                      onClick={handleResumeSubscription}
                      className="flex items-center justify-center px-4 py-3 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Resume Subscription
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="flex items-center justify-center px-4 py-3 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Your Plan Includes</h3>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscription.plan.nickname === 'Creator Plan' && (
                    <>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span>3 Linked Social Accounts</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span>150 AI Credits per month</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span>100 Scheduled Posts per month</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span>5 GB Media Storage</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span>Smart AI Gallery Generator</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span>Email Support</span>
                      </div>
                    </>
                  )}
                  {/* Add other plan features here */}
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Billing</h3>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-600 mb-4">
                  View and download your complete billing history in the customer portal.
                </p>
                <button
                  onClick={handleManageSubscription}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  View All Invoices
                  <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="text-lg font-medium text-gray-900 mt-4">Cancel Subscription</h3>
                                 <div className="mt-2 px-7 py-3">
                   <p className="text-sm text-gray-500">
                     Are you sure you want to cancel your subscription? You'll continue to have access until your current billing period ends.
                   </p>
                 </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 