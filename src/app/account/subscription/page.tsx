'use client';

import React, { useState } from 'react';
import { CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function SubscriptionPage() {
  const [subscription] = useState({
    plan: 'Free',
    status: 'active',
    nextBilling: '2024-02-01',
    features: ['Basic Analytics', 'Limited AI Credits', '1GB Storage']
  });

  const handleManageSubscription = () => {
    alert('Subscription management would open here');
  };

  const handleUpgrade = () => {
    alert('Upgrade flow would start here');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>

        {/* Current Subscription */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <CreditCardIcon className="h-6 w-6 mr-2" />
              Current Plan
            </h2>
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
              {subscription.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">{subscription.plan} Plan</h3>
              <p className="text-gray-400 mb-4">
                Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}
              </p>
              
              <h4 className="text-sm font-medium text-gray-300 mb-2">Features included:</h4>
              <ul className="space-y-1">
                {subscription.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-300">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleManageSubscription}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Manage Billing
              </button>
              
              {subscription.plan === 'Free' && (
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Billing History</h3>
          <div className="text-center py-8 text-gray-400">
            <p>No billing history available for free plan</p>
          </div>
        </div>
      </div>
    </div>
  );
} 