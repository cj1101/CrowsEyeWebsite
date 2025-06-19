'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  DocumentArrowDownIcon,
  CogIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  StarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionPage() {
  const {
    subscription,
    isLoading,
    error,
    openCustomerPortal,
    cancelSubscription,
    resumeSubscription,
  } = useSubscriptionManagement();

  const { userProfile, refreshUserProfile } = useAuth();
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState('');
  const [promoError, setPromoError] = useState('');
  const [showLifetimeButton, setShowLifetimeButton] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

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

  const handlePromoCode = async () => {
    setPromoLoading(true);
    setPromoError('');
    setPromoSuccess('');
    setShowLifetimeButton(false);

    try {
      // Check for the lifetime tester code
      const lifetimeCode = 'TESTER_CROW_2024_LIFETIME_$7d91f3a8';
      const validCodes = ['FOUNDER', 'BETA', 'INFLUENCER', 'PARTNER', 'LAUNCH'];
      
      if (promoCode === lifetimeCode) {
        // Show lifetime access claim button
        setPromoSuccess('🎉 LIFETIME TESTER CODE VERIFIED! Click below to claim your free access for life.');
        setShowLifetimeButton(true);
        
      } else if (validCodes.includes(promoCode.toUpperCase())) {
        // Immediately apply Creator plan for other valid codes
        setPromoSuccess('🎉 Promotional code verified! Upgrading to Creator plan...');
        
        // Call API to upgrade user to Creator plan
        if (userProfile?.id) {
          const response = await fetch('/api/auth/upgrade-creator', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({ user_id: userProfile.id, promo_code: promoCode })
          });
          
          if (response.ok) {
            setPromoSuccess('✅ Creator plan activated! Refreshing your account...');
            setTimeout(async () => {
              await refreshUserProfile();
              setPromoCode('');
            }, 1500);
          } else {
            throw new Error('API upgrade failed');
          }
        }
        
      } else {
        setPromoError('Invalid promotional code. Please check and try again.');
      }
    } catch (error: any) {
      setPromoError('Failed to verify promotional code. Please try again.');
      console.error('Promo code error:', error);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleClaimLifetimeAccess = async () => {
    setClaimLoading(true);
    setPromoError('');

    try {
      // Call API to upgrade user to lifetime Pro
      if (userProfile?.id) {
        const response = await fetch('/api/auth/upgrade-lifetime-pro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ 
            user_id: userProfile.id, 
            promo_code: promoCode,
            immediate_activation: true 
          })
        });
        
        if (response.ok) {
          setPromoSuccess('🎉 LIFETIME PRO ACCESS ACTIVATED! You now have unlimited access forever. Refreshing your account...');
          setShowLifetimeButton(false);
          
          // Immediate refresh to show changes
          setTimeout(async () => {
            await refreshUserProfile();
            setPromoCode('');
            // Force page reload to ensure all state is updated
            window.location.reload();
          }, 2000);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to activate lifetime access');
        }
      }
    } catch (error: any) {
      setPromoError('Failed to activate lifetime access. Please try again or contact support.');
      console.error('Lifetime activation error:', error);
    } finally {
      setClaimLoading(false);
    }
  };

  const handlePlanUpgrade = (planType: 'creator' | 'growth' | 'pro') => {
    // Store the plan type for post-purchase handling
    localStorage.setItem('pendingUpgrade', planType);
    localStorage.setItem('upgradeTimestamp', Date.now().toString());
    
    // Redirect to pricing page with plan selection
    const planUrls = {
      creator: 'https://buy.stripe.com/cNi6oH8ddcO722a5uXeIw07',
      growth: 'https://buy.stripe.com/cNicN59hh5lF6iq5uXeIw08', 
      pro: 'https://buy.stripe.com/fZucN5gJJbK35emaPheIw09'
    };
    
    // Add success URL with immediate refresh parameter
    const successUrl = `${window.location.origin}/account/subscription?upgrade_success=true&plan=${planType}`;
    const cancelUrl = `${window.location.origin}/account/subscription?upgrade_cancelled=true`;
    
    // Open Stripe with return URLs
    const stripeUrl = `${planUrls[planType]}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
    window.open(stripeUrl, '_blank');
    
    // Set up periodic check for subscription updates
    const checkInterval = setInterval(async () => {
      try {
        await refreshUserProfile();
        const currentPlan = userProfile?.subscription_tier;
        if (currentPlan === planType) {
          clearInterval(checkInterval);
          localStorage.removeItem('pendingUpgrade');
          localStorage.removeItem('upgradeTimestamp');
          
          // Show success message
          setPromoSuccess(`🎉 ${planType.toUpperCase()} plan activated! Welcome to your new subscription.`);
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    }, 3000); // Check every 3 seconds
    
    // Clear interval after 5 minutes to prevent infinite checking
    setTimeout(() => {
      clearInterval(checkInterval);
      localStorage.removeItem('pendingUpgrade');
      localStorage.removeItem('upgradeTimestamp');
    }, 300000);
  };

  // Check if user has lifetime access
  const isLifetimeUser = userProfile?.subscription_tier === 'pro' && userProfile?.subscription_status === 'active';

  // Handle successful subscription upgrades
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upgradeSuccess = urlParams.get('upgrade_success');
    const planType = urlParams.get('plan');
    
    if (upgradeSuccess === 'true' && planType) {
      setPromoSuccess(`🎉 ${planType.toUpperCase()} plan successfully activated! Welcome to your new subscription.`);
      
      // Immediately refresh user profile
      refreshUserProfile();
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Clean up any pending upgrade tracking
      localStorage.removeItem('pendingUpgrade');
      localStorage.removeItem('upgradeTimestamp');
    }
    
    const upgradeCancelled = urlParams.get('upgrade_cancelled');
    if (upgradeCancelled === 'true') {
      setPromoError('Subscription upgrade was cancelled. You can try again anytime.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshUserProfile]);

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

        {/* Promotional Code Section */}
        <div className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
          <div className="flex items-center mb-4">
            <GiftIcon className="h-6 w-6 mr-3" />
            <h3 className="text-lg font-semibold">Have a Promotional Code?</h3>
          </div>
          <p className="text-purple-100 mb-4">
            Enter your promotional code to unlock special benefits or upgrade your plan.
          </p>
          
          <div className="flex gap-3 max-w-md">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promotional code"
              className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              disabled={promoLoading}
            />
            <button
              onClick={handlePromoCode}
              disabled={promoLoading || !promoCode.trim()}
              className="px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {promoLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              ) : (
                'Apply'
              )}
            </button>
          </div>
          
          {promoSuccess && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
              <p className="text-green-100 text-sm">{promoSuccess}</p>
            </div>
          )}
          
          {promoError && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
              <p className="text-red-100 text-sm">{promoError}</p>
            </div>
          )}

          {/* Big Lifetime Access Claim Button */}
          {showLifetimeButton && (
            <div className="mt-6 text-center">
              <button
                onClick={handleClaimLifetimeAccess}
                disabled={claimLoading}
                className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 animate-pulse border-2 border-yellow-300"
              >
                {claimLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Activating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <StarIcon className="h-6 w-6 mr-3" />
                    🎉 CLAIM FREE ACCESS FOR LIFE 🎉
                    <StarIcon className="h-6 w-6 ml-3" />
                  </div>
                )}
                
                {/* Sparkle effect */}
                {!claimLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-xl animate-ping"></div>
                )}
              </button>
              
              <p className="mt-3 text-yellow-100 text-sm font-medium">
                ✨ Unlimited Pro features • No monthly fees • Forever
              </p>
            </div>
          )}
        </div>

        {/* Lifetime User Banner */}
        {isLifetimeUser && (
          <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 mr-3" />
              <div>
                <h3 className="text-xl font-bold">🎉 LIFETIME PRO ACCESS</h3>
                <p className="text-yellow-100">You have permanent access to all Pro plan features!</p>
              </div>
            </div>
          </div>
        )}

        {!subscription ? (
          <div className="space-y-6">
            {/* No subscription - Show upgrade options */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center mb-6">
                <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Choose Your Plan</h3>
                <p className="mt-2 text-gray-600">
                  Upgrade to unlock powerful features and boost your social media presence.
                </p>
              </div>

              {/* Plan Upgrade Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Creator Plan */}
                <div className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900">Creator Plan</h4>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">$15</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      <li>✓ 3 Social Accounts</li>
                      <li>✓ 150 AI Credits/month</li>
                      <li>✓ 100 Scheduled Posts</li>
                      <li>✓ 5GB Storage</li>
                    </ul>
                    <button
                      onClick={() => handlePlanUpgrade('creator')}
                      className="mt-6 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Start 7-Day Free Trial
                    </button>
                  </div>
                </div>

                {/* Growth Plan */}
                <div className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900">Growth Plan</h4>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">$20</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      <li>✓ 7 Social Accounts</li>
                      <li>✓ 400 AI Credits/month</li>
                      <li>✓ 300 Scheduled Posts</li>
                      <li>✓ 15GB Storage</li>
                    </ul>
                    <button
                      onClick={() => handlePlanUpgrade('growth')}
                      className="mt-6 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Start 7-Day Free Trial
                    </button>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="border-2 border-purple-500 rounded-lg p-6 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900">Pro Plan</h4>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">$30</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      <li>✓ 10 Social Accounts</li>
                      <li>✓ 750+ AI Credits/month</li>
                      <li>✓ Unlimited Posts</li>
                      <li>✓ 50GB Storage</li>
                      <li>✓ Team Collaboration</li>
                    </ul>
                    <button
                      onClick={() => handlePlanUpgrade('pro')}
                      className="mt-6 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Start 7-Day Free Trial
                    </button>
                  </div>
                </div>
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
                        {isLifetimeUser && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            LIFETIME
                          </span>
                        )}
                      </h4>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {isLifetimeUser ? (
                        <span className="text-green-600">FREE FOR LIFE</span>
                      ) : (
                        <>
                          {formatPrice(subscription.plan.amount, subscription.plan.currency)}
                          <span className="text-sm font-normal text-gray-500">
                            /{subscription.plan.interval}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    {!isLifetimeUser && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Next billing date: {formatDate(subscription.current_period_end)}
                      </div>
                    )}
                    {subscription.cancel_at_period_end && !isLifetimeUser && (
                      <div className="mt-2 flex items-center text-sm text-yellow-600">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        Subscription will cancel on {formatDate(subscription.current_period_end)}
                      </div>
                    )}
                    {isLifetimeUser && (
                      <div className="flex items-center text-sm text-green-600">
                        <StarIcon className="h-4 w-4 mr-2" />
                        Lifetime access - no expiration
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
                  {!isLifetimeUser && (
                    <>
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
                    </>
                  )}
                  
                  <button
                    onClick={handleManageSubscription}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download Invoices
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                  </button>
                  
                  {!isLifetimeUser && (
                    subscription.cancel_at_period_end ? (
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
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Your Plan Includes
                  {isLifetimeUser && (
                    <span className="ml-2 text-sm text-yellow-600 font-normal">
                      (Lifetime Access)
                    </span>
                  )}
                </h3>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Show Pro features for lifetime users or current plan features */}
                  {(isLifetimeUser || subscription.plan.nickname === 'Pro Plan') && (
                    <>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">10 Linked Social Accounts</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">750+ AI Credits per month</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">Unlimited Scheduled Posts</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">50GB Media Storage</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">Team Collaboration (3 members)</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">Priority Support</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">Full Custom Branding</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">API Access</span>
                      </div>
                    </>
                  )}
                  
                  {subscription.plan.nickname === 'Creator Plan' && !isLifetimeUser && (
                    <>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">3 Linked Social Accounts</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">150 AI Credits per month</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">100 Scheduled Posts per month</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">5 GB Media Storage</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">Smart AI Gallery Generator</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-900">Email Support</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Billing History - Hide for lifetime users */}
            {!isLifetimeUser && (
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
            )}
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