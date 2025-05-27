'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOutUser } from '@/lib/auth';
import { getUserSubscription, UserSubscription } from '@/lib/subscription';
import { getSubscriptionFeatures } from '@/lib/subscription';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  CreditCardIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AccountPage() {
  const { user, userProfile, loading } = useAuth();
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success message from Stripe checkout
  const success = searchParams.get('success');
  const sessionId = searchParams.get('session_id');

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

  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSignOutLoading(false);
    }
  };

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getSubscriptionBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'trialing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'past_due':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const currentTier = subscription?.tier || 'spark';
  const features = getSubscriptionFeatures(currentTier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-8 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3" />
              <div>
                <h3 className="text-green-400 font-semibold">Subscription Activated!</h3>
                <p className="text-green-300 text-sm">Your subscription has been successfully activated. Welcome to Crow's Eye!</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Account Center</h1>
          <p className="text-xl text-gray-300">Manage your Crow&apos;s Eye account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8">
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-20 w-20 rounded-full border-4 border-purple-500"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-purple-600 flex items-center justify-center border-4 border-purple-500">
                  <UserIcon className="h-10 w-10 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user.displayName || 'User'}
              </h2>
              <p className="text-gray-300 flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                {user.email}
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSubscriptionBadgeColor(subscription?.status || 'inactive')}`}>
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  {currentTier.toUpperCase()} Plan
                  {subscription?.hasByok && <span className="ml-1 text-xs">(BYOK)</span>}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center text-gray-300 mb-2">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Member Since</span>
              </div>
              <p className="text-white">{formatDate(userProfile.createdAt)}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center text-gray-300 mb-2">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Last Login</span>
              </div>
              <p className="text-white">{formatDate(userProfile.lastLoginAt)}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-left hover:bg-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <CogIcon className="h-8 w-8 text-purple-400" />
              <span className="text-sm text-gray-400">Settings</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Account Settings</h3>
            <p className="text-gray-300 text-sm">Update your profile, password, and preferences</p>
          </button>

          <button 
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-left hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-4">
              <CreditCardIcon className="h-8 w-8 text-green-400" />
              <span className="text-sm text-gray-400">Billing</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {portalLoading ? 'Loading...' : 'Subscription'}
            </h3>
            <p className="text-gray-300 text-sm">Manage your subscription and billing information</p>
          </button>

          <button className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-left hover:bg-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-blue-400" />
              <span className="text-sm text-gray-400">Security</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Security</h3>
            <p className="text-gray-300 text-sm">Two-factor authentication and security settings</p>
          </button>
        </div>

        {/* Subscription Details */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Subscription Details</h3>
            {subscription?.cancelAtPeriodEnd && (
              <div className="flex items-center text-yellow-400">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">Cancels at period end</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-gray-300 text-sm">Current Plan</p>
              <p className="text-white font-semibold text-lg capitalize">
                {currentTier}
                {subscription?.hasByok && <span className="text-sm text-purple-300 ml-2">(BYOK Discount)</span>}
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Status</p>
              <p className="text-white font-semibold text-lg capitalize">
                {subscription?.status || 'Free'}
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">
                {subscription?.status === 'active' ? 'Next Billing' : 'Period End'}
              </p>
              <p className="text-white font-semibold text-lg">
                {subscription?.currentPeriodEnd 
                  ? formatDate(subscription.currentPeriodEnd)
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          {/* Plan Features */}
          <div className="border-t border-gray-700 pt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Plan Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 text-sm">Social Accounts</p>
                <p className="text-white font-semibold">{features.socialSets}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 text-sm">AI Credits/month</p>
                <p className="text-white font-semibold">{features.aiCredits}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 text-sm">Storage</p>
                <p className="text-white font-semibold">{features.storageGB}GB</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 text-sm">Team Members</p>
                <p className="text-white font-semibold">{features.seats}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 text-sm">Support</p>
                <p className="text-white font-semibold capitalize">{features.support}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 text-sm">Analytics</p>
                <p className="text-white font-semibold capitalize">{features.analytics}</p>
              </div>
            </div>
          </div>

          {/* Upgrade/Manage Button */}
          {currentTier === 'spark' ? (
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/pricing')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
              >
                Upgrade Your Plan
              </button>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {portalLoading ? 'Loading...' : 'Manage Billing'}
              </button>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <div className="text-center">
          <button
            onClick={handleSignOut}
            disabled={signOutLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            {signOutLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
} 