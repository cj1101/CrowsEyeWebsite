'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSubscription, UserSubscription } from '@/lib/subscription';
import { 
  CreditCardIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function SubscriptionPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  // Fetch user subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      
      setSubscriptionLoading(true);
      try {
        const userSub = await getUserSubscription(user.uid);
        setSubscription(userSub);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const handleManageBilling = async () => {
    if (!subscription?.stripeCustomerId) {
      router.push('/pricing');
      return;
    }

    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: subscription.stripeCustomerId,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'trialing':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
      case 'past_due':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'cancelled':
        return 'text-red-400 bg-red-500/20 border-red-500/50';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const currentTier = subscription?.tier || 'spark';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/account" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Account
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Subscription Management</h1>
          <p className="text-xl text-gray-300">Manage your Crow's Eye subscription and billing</p>
        </div>

        {/* Current Plan Overview */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-600/20 rounded-full p-3">
                <SparklesIcon className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white capitalize">{currentTier} Plan</h2>
                <p className="text-gray-300">Your current subscription</p>
              </div>
            </div>
            {subscription?.status && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subscription.status)}`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            )}
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3" />
                <div>
                  <h3 className="text-yellow-400 font-semibold">Subscription Ending</h3>
                  <p className="text-yellow-300 text-sm">
                    Your subscription will end on {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center text-gray-300 mb-2">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Billing Amount</span>
              </div>
              <p className="text-white text-xl font-bold">
                {currentTier === 'spark' ? 'Free' : 
                 currentTier === 'enterprise' ? 'Custom' : 
                 subscription?.hasByok ? 'BYOK Pricing' : 
                 currentTier === 'creator' ? '$29' :
                 currentTier === 'pro' ? '$99' : '$0'}
                {currentTier !== 'spark' && currentTier !== 'enterprise' && '/month'}
                {subscription?.hasByok && <span className="text-sm text-green-300 ml-2">(BYOK Discount)</span>}
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center text-gray-300 mb-2">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Next Billing Date</span>
              </div>
              <p className="text-white text-xl font-bold">
                {subscription?.currentPeriodEnd 
                  ? formatDate(subscription.currentPeriodEnd)
                  : 'N/A'
                }
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center text-gray-300 mb-2">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Status</span>
              </div>
              <p className="text-white text-xl font-bold capitalize">
                {subscription?.status || 'Free'}
              </p>
            </div>
          </div>
        </div>

        {/* Billing Management */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Billing Management</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-3">Manage Billing</h4>
              <p className="text-gray-300 text-sm mb-4">
                Update payment methods, view invoices, and manage your billing information.
              </p>
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {portalLoading ? 'Loading...' : 'Manage Billing'}
              </button>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-3">Change Plan</h4>
              <p className="text-gray-300 text-sm mb-4">
                Upgrade or downgrade your subscription to better fit your needs.
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <h3 className="text-xl font-bold text-white mb-6">Your Plan Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Social Accounts</h4>
              <p className="text-gray-300">
                {currentTier === 'spark' ? '1 Account' : 
                 currentTier === 'creator' ? '3 Accounts' : 
                 currentTier === 'pro' ? '10 Accounts' : 
                 'Unlimited Accounts'}
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">AI Credits</h4>
              <p className="text-gray-300">
                {currentTier === 'spark' ? '50/month' : 
                 currentTier === 'creator' ? '500/month' : 
                 currentTier === 'pro' ? '2000/month' : 
                 'Unlimited'}
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Storage</h4>
              <p className="text-gray-300">
                {currentTier === 'spark' ? '1GB' : 
                 currentTier === 'creator' ? '10GB' : 
                 currentTier === 'pro' ? '100GB' : 
                 'Unlimited'}
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Team Members</h4>
              <p className="text-gray-300">
                {currentTier === 'spark' ? '1 User' : 
                 currentTier === 'creator' ? '1 User' : 
                 currentTier === 'pro' ? '5 Users' : 
                 'Unlimited Users'}
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Support</h4>
              <p className="text-gray-300">
                {currentTier === 'spark' ? 'Community' : 
                 currentTier === 'creator' ? 'Email' : 
                 currentTier === 'pro' ? 'Priority' : 
                 'Dedicated'}
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Analytics</h4>
              <p className="text-gray-300">
                {currentTier === 'spark' ? 'Basic' : 
                 currentTier === 'creator' ? 'Standard' : 
                 currentTier === 'pro' ? 'Advanced' : 
                 'Custom'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 