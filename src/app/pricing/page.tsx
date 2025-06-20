/**
 * CROW'S EYE PRICING PAGE - REVOLUTIONARY PRICING MODEL IMPLEMENTATION
 * ===================================================================
 * 
 * ✅ IMPLEMENTED FEATURES:
 * 
 * 🚀 PAY-AS-YOU-GO TIER:
 * - Usage-based pricing: $0.15/AI credit, $0.25/post, $2.99/GB storage
 * - Healthy profit margins for occasional users
 * - $5 minimum monthly charge
 * - Up to 5 social accounts
 * 
 * 🎯 7-DAY FREE TRIALS:
 * - All paid plans include 7-day free trial
 * - No credit card required to start
 * - Trial messaging throughout UI
 * 
 * 🎟️ PROMOTION CODES:
 * - FOUNDER, BETA, INFLUENCER, PARTNER, LAUNCH
 * - Grants free access to any plan
 * - Stored in localStorage for signup process
 * 
 * 💰 COMPETITIVE PRICING:
 * - Creator: $15/month (was $19) - 40% cheaper than Later
 * - Growth: $20/month (was $35) - 55% cheaper than Later  
 * - Pro: $30/month (was $49) - 62% cheaper than Later
 * 
 * 🔄 BACKEND INTEGRATION READY:
 * - Updated subscription tiers in models
 * - Usage limits configured
 * - Access control updated
 * - Stripe configuration ready
 * 
 * 📱 UI COMPONENTS:
 * - UsageMeter component for PAYG tracking
 * - Promotion code input/validation
 * - Trial messaging and badges
 * - Plan selection logic
 */

'use client'

import React, { useState, Suspense } from 'react'
import { Check, X, Gift, Calculator, CreditCard } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

const pricingPlans = [
  {
    id: "payg",
    name: "Pay-as-you-Go",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Simple, transparent pricing - pay only for what you use",
    targetUser: "Perfect for everyone - no commitments",
    badge: "Start Free",
    isPayAsYouGo: true,
    limits: {
      linkedAccounts: "Up to 5 social accounts",
      users: "1 user",
      aiCredits: "$0.15 per AI credit",
      scheduledPosts: "$0.25 per scheduled post",
      mediaStorage: "$2.99 per GB/month"
    },
    features: {
      basicContentTools: true,
      mediaLibrary: true,
      smartGallery: true,
      postFormatting: true,
      basicVideoTools: true,
      advancedContent: true,
      analytics: "Full Analytics",
      teamCollaboration: false,
      support: "Email Support",
      customBranding: false,
      apiAccess: true,
      prioritySupport: false
    },
    buttonText: "Start Free - No Credit Card",
    buttonVariant: "outline" as const,
    paymentType: "payg",
    monthlyUrl: "https://buy.stripe.com/PAYG_URL_PENDING",
    popular: false,
    trial: false,
    benefits: [
      "No monthly minimums",
      "Start completely free", 
      "Credit card required at $5 usage",
      "Pay only for what you use",
      "Scale up or down anytime"
    ]
  },
  {
    id: "creator",
    name: "Creator Plan",
    monthlyPrice: 15,
    yearlyPrice: 150,
    description: "For content creators and influencers",
    targetUser: "Content Creators & Influencers",
    badge: "Most Popular",
    limits: {
      linkedAccounts: "3 social accounts",
      users: "1 user",
      aiCredits: "150 AI credits/month",
      scheduledPosts: "100 scheduled posts/month",
      mediaStorage: "5GB storage"
    },
    features: {
      basicContentTools: true,
      mediaLibrary: true,
      smartGallery: true,
      postFormatting: true,
      basicVideoTools: true,
      advancedContent: false,
      analytics: "Enhanced Analytics",
      teamCollaboration: false,
      support: "Email Support",
      customBranding: false,
      apiAccess: false,
      prioritySupport: false
    },
    buttonText: "Start 7-Day Free Trial",
    buttonVariant: "default" as const,
    paymentType: "creator",
    monthlyUrl: "https://buy.stripe.com/cNi6oH8ddcO722a5uXeIw07",
    yearlyUrl: "https://buy.stripe.com/7sYcN5799dSbbCK4qTeIw0a",
    popular: true,
    trial: true,
    trialDays: 7
  },
  {
    id: "growth",
    name: "Growth Plan",
    monthlyPrice: 20,
    yearlyPrice: 200,
    description: "For growing businesses and marketers",
    targetUser: "Growing Businesses & Marketers",
    badge: "Great Value",
    limits: {
      linkedAccounts: "7 social accounts",
      users: "1 user",
      aiCredits: "400 AI credits/month",
      scheduledPosts: "300 scheduled posts/month",
      mediaStorage: "15GB storage"
    },
    features: {
      basicContentTools: true,
      mediaLibrary: true,
      smartGallery: true,
      postFormatting: true,
      basicVideoTools: true,
      advancedContent: "Advanced Video Processing",
      analytics: "Advanced Analytics",
      teamCollaboration: "Coming Soon",
      support: "Priority Email Support",
      customBranding: "Basic Branding",
      apiAccess: false,
      prioritySupport: true
    },
    buttonText: "Start 7-Day Free Trial",
    buttonVariant: "default" as const,
    paymentType: "growth",
    monthlyUrl: "https://buy.stripe.com/cNicN59hh5lF6iq5uXeIw08",
    yearlyUrl: "https://buy.stripe.com/bJe8wP9hhdSb22a9LdeIw0b",
    popular: false,
    trial: true,
    trialDays: 7
  },
  {
    id: "pro",
    name: "Pro Plan",
    monthlyPrice: 30,
    yearlyPrice: 300,
    description: "For professionals and small teams", 
    targetUser: "Professionals & Small Teams",
    badge: "Full Features",
    limits: {
      linkedAccounts: "10 social accounts",
      users: "Up to 3 team members",
      aiCredits: "750+ AI credits/month",
      scheduledPosts: "Unlimited scheduled posts",
      mediaStorage: "50GB storage"
    },
    features: {
      basicContentTools: true,
      mediaLibrary: true,
      smartGallery: true,
      postFormatting: true,
      basicVideoTools: true,
      advancedContent: "Full Video Suite + AI",
      analytics: "Advanced Analytics + Custom Reports",
      teamCollaboration: true,
      support: "Priority Email Support",
      customBranding: "Full Custom Branding",
      apiAccess: true,
      prioritySupport: true
    },
    buttonText: "Start 7-Day Free Trial",
    buttonVariant: "default" as const,
    paymentType: "pro",
    monthlyUrl: "https://buy.stripe.com/fZucN5gJJbK35emaPheIw09",
    yearlyUrl: "https://buy.stripe.com/eVq00j1OPaFZ5emf5xeIw0c",
    popular: false,
    trial: true,
    trialDays: 7
  }
];

const FeatureRow = ({ feature, plans }: { feature: string; plans: typeof pricingPlans }) => {
  const getFeatureValue = (plan: typeof pricingPlans[0], feature: string) => {
    switch (feature) {
      case 'basicContentTools':
        return plan.features.basicContentTools;
      case 'mediaLibrary':
        return plan.features.mediaLibrary;
      case 'smartGallery':
        return plan.features.smartGallery;
      case 'postFormatting':
        return plan.features.postFormatting;
      case 'basicVideoTools':
        return plan.features.basicVideoTools;
      case 'advancedContent':
        return plan.features.advancedContent;
      case 'analytics':
        return plan.features.analytics;
      case 'teamCollaboration':
        return plan.features.teamCollaboration;
      case 'support':
        return plan.features.support;
      case 'customBranding':
        return plan.features.customBranding;
      case 'apiAccess':
        return plan.features.apiAccess;
      default:
        return false;
    }
  };

  return (
    <tr className="border-b border-gray-800">
      <td className="py-4 px-4 text-left text-gray-300">{feature}</td>
      {plans.map((plan) => {
        const value = getFeatureValue(plan, feature);
        return (
          <td key={plan.id} className="py-4 px-4 text-center">
            {typeof value === 'boolean' ? (
              value ? (
                <Check className="h-5 w-5 text-green-500 mx-auto" />
              ) : (
                <X className="h-5 w-5 text-gray-500 mx-auto" />
              )
            ) : (
              <span className="text-gray-300 text-sm">{value}</span>
            )}
          </td>
        );
      })}
    </tr>
  );
};

// Simple PAYG Benefits Component
const PAYGBenefits = ({ plan }: { plan: typeof pricingPlans[0] }) => {
  if (!plan.benefits) return null
  
  return (
    <div className="mt-4 space-y-3">
      <div className="bg-gray-800/50 p-3 rounded-lg space-y-3 text-xs border border-gray-700">
        <div className="text-center">
          <Badge className="bg-green-500/20 text-green-400 text-xs border-green-500/30">
            ✨ Start Free - No Minimums
          </Badge>
        </div>
        
        <div>
          <h5 className="font-medium text-gray-300 mb-2">Why Pay-as-you-Go?</h5>
          <ul className="space-y-1">
            {plan.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center text-gray-300">
                <div className="w-1 h-1 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="text-center p-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded text-xs text-gray-300 border border-green-500/30">
          💡 Simple, transparent pricing - pay exactly for what you use!
        </div>
      </div>
    </div>
  )
}

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile, isAuthenticated } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  
  // Check if subscription is required
  const isRequired = searchParams?.get('required') === 'true';

  const handleFounderClick = () => {
    const passcode = prompt("What's the founder passcode?");
    if (passcode && passcode.toLowerCase() === 'plz') {
      router.push('/pricing/founder');
    }
  };

  const handlePromoCode = () => {
    // Valid promo codes for free access
    const validCodes = ['FOUNDER', 'BETA', 'INFLUENCER', 'PARTNER', 'LAUNCH'];
    
    if (validCodes.includes(promoCode.toUpperCase())) {
      setPromoApplied(true);
      setPromoError('');
      // Store promo code for signup process
      localStorage.setItem('crowsEyePromoCode', promoCode.toUpperCase());
      localStorage.setItem('crowsEyePromoTier', 'free_trial');
    } else {
      setPromoError('Invalid promotion code');
      setPromoApplied(false);
    }
  };



  const getDisplayPrice = (plan: typeof pricingPlans[0]) => {
    if (plan.paymentType === 'payg') return 'Pay-as-you-Go';
    
    if (billingPeriod === 'monthly') {
      return `$${plan.monthlyPrice}`;
    } else {
      return `$${Math.round(plan.yearlyPrice / 12)}`;
    }
  };

  const getSavings = (plan: typeof pricingPlans[0]) => {
    if (plan.paymentType === 'payg') return null;
    if (billingPeriod === 'monthly') return null;
    
    const savings = plan.monthlyPrice * 12 - plan.yearlyPrice;
    return savings > 0 ? `Save $${savings}` : null;
  };

  const handlePlanSelect = async (plan: typeof pricingPlans[0]) => {
    console.log('🚀 Plan selection:', {
      planType: plan.paymentType,
      isAuthenticated,
      hasUserProfile: !!userProfile,
      userEmail: userProfile?.email,
      promoApplied
    })
    
    if (promoApplied) {
      // If promo code is applied, redirect to signup with free access
      router.push(`/auth/signup?plan=${plan.paymentType}&promo=true`);
    } else if (plan.paymentType === 'payg') {
      // For PAYG, check if user is logged in first
      if (isAuthenticated && userProfile) {
        // User is logged in, skip terms and go directly to setup
        console.log('✅ User is authenticated, skipping terms and going directly to PAYG setup')
        router.push('/payg-setup');
      } else {
        // User not logged in, start with terms page
        console.log('❌ User not authenticated, starting with terms page')
        router.push('/payg-terms');
      }
    } else {
      const url = billingPeriod === 'monthly' ? plan.monthlyUrl : plan.yearlyUrl;
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl" />
        
        {/* Subscription Required Banner */}
        {isRequired && (
          <div className="relative max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-red-400 mr-3" />
                <h3 className="text-2xl font-bold text-red-300">Subscription Required</h3>
              </div>
              <p className="text-red-200 text-lg mb-4">
                Access to Crow's Eye requires an active subscription with payment method on file.
              </p>
              <p className="text-red-100 text-base">
                Choose a plan below to continue. Even our Pay-as-you-Go option requires a card for billing when you reach the $5 minimum.
              </p>
            </div>
          </div>
        )}
        
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {isRequired ? 'Complete Your Setup' : 'Choose Your Plan'}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {isRequired 
              ? 'Set up your subscription to access all the powerful AI-driven social media tools'
              : 'Unlock the full potential of AI-powered social media marketing with plans designed for every creator and business'
            }
          </p>

          {/* Promotion Code Section */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promotion code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handlePromoCode}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-red-400 text-sm mt-2">{promoError}</p>
              )}
              {promoApplied && (
                <p className="text-green-400 text-sm mt-2">
                  🎉 Promotion code applied! Free access granted.
                </p>
              )}
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-full p-1 flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingPeriod === 'monthly'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingPeriod === 'yearly'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Pay-as-you-Go Plan - Featured */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            {/* Pay-as-you-Go Plan - Standalone */}
            <Card className="relative border-2 border-green-500 shadow-xl bg-gradient-to-br from-green-50 to-blue-50">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold">
                  <Gift className="h-4 w-4 mr-1" />
                  Start Free - $5 Minimum
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-3xl font-bold text-gray-900">Pay-as-you-Go</CardTitle>
                <div className="text-4xl font-bold text-green-600 mb-2">Simple & Fair</div>
                <CardDescription className="text-lg text-gray-700">
                  Perfect for everyone - pay only for what you use with a generous $5 minimum threshold
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* How It Works */}
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-3 text-lg">🎯 How It Works:</h4>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">1</span>
                        <span>Sign up and add your payment method</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">2</span>
                        <span>Use the platform freely - no charges yet!</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">3</span>
                        <span>Get charged only when you reach $5 in usage</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">4</span>
                        <span>Then pay monthly for actual usage</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                      <Calculator className="h-5 w-5 mr-2" />
                      Simple Pricing Structure
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="font-medium text-black">AI Credits:</span>
                        <span className="font-bold text-green-600 text-lg">$0.15 each</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="font-medium text-black">Scheduled Posts:</span>
                        <span className="font-bold text-green-600 text-lg">$0.25 each</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="font-medium text-black">Storage:</span>
                        <span className="font-bold text-green-600 text-lg">$2.99/GB/month</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-green-100 px-3 rounded border-2 border-green-300">
                        <span className="font-bold text-green-800">Minimum monthly charge:</span>
                        <span className="font-bold text-green-800 text-xl">$5.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Examples */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-3 text-lg">💡 Usage Examples:</h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium text-blue-800 mb-1">Light User:</div>
                        <div className="text-gray-600">10 AI credits + 3 posts + 1GB = $4.24</div>
                        <div className="text-green-600 font-medium">💸 Charged: $0 (under $5)</div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium text-blue-800 mb-1">Medium User:</div>
                        <div className="text-gray-600">25 AI credits + 10 posts + 2GB = $12.23</div>
                        <div className="text-blue-600 font-medium">💳 Charged: $12.23</div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium text-blue-800 mb-1">Power User:</div>
                        <div className="text-gray-600">100 AI credits + 50 posts + 10GB = $57.40</div>
                        <div className="text-purple-600 font-medium">🚀 Charged: $57.40</div>
                      </div>
                    </div>
                  </div>

                  {/* Key Benefits */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-lg">✨ Key Benefits:</h4>
                    <ul className="space-y-3">
                      {[
                        '🆓 True free start - no upfront costs',
                        '💳 Card required but no charges until $5',
                        '📊 Transparent pricing - know exactly what you pay',
                        '📈 Scale naturally with your business',
                        '🔄 No long-term commitments',
                        '⚡ All features included from day one',
                        '🛡️ Fair usage protection for light users'
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center text-sm font-medium text-gray-700">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <Button 
                    className="w-full text-lg py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold shadow-lg" 
                    size="lg"
                    onClick={() => handlePlanSelect(pricingPlans.find(p => p.id === 'payg')!)}
                  >
                    {isRequired ? '💳 Setup PAYG & Access Platform' : '🚀 Start Free with PAYG'}
                  </Button>
                  <p className="text-sm text-gray-600 text-center mt-3 font-medium">
                    {isRequired 
                      ? 'Required: Add payment method to access the platform'
                      : 'Add payment method • No charges until $5 usage • Cancel anytime'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Traditional Plans Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Traditional Monthly Plans</h2>
          <p className="text-gray-400">Fixed pricing with set limits - perfect for consistent usage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.filter(plan => plan.id !== 'payg').map((plan) => (
            <Card 
              key={plan.id}
              className={`relative bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white hover:border-purple-500/50 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-purple-500/50 scale-105' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400 mb-4">
                  {plan.description}
                </CardDescription>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold">
                    {getDisplayPrice(plan)}
                    {plan.paymentType !== 'free' && (
                      <span className="text-lg text-gray-400">
                        /{billingPeriod === 'monthly' ? 'mo' : 'mo'}
                      </span>
                    )}
                  </div>
                  {getSavings(plan) && (
                    <div className="text-sm text-green-400 mt-1">
                      {getSavings(plan)}
                    </div>
                  )}
                  {billingPeriod === 'yearly' && plan.paymentType !== 'payg' && (
                    <div className="text-xs text-gray-500 mt-1">
                      Billed annually (${plan.yearlyPrice})
                    </div>
                  )}
                  {plan.trial && (
                    <div className="text-xs text-green-400 mt-1 font-medium">
                      {plan.trialDays}-day free trial included
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Usage Limits */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-400">Usage Limits:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>{plan.limits.linkedAccounts}</li>
                    <li>{plan.limits.users}</li>
                    <li>{plan.limits.aiCredits}</li>
                    <li>{plan.limits.scheduledPosts}</li>
                    <li>{plan.limits.mediaStorage}</li>
                  </ul>
                </div>

                {/* Key Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-400">Key Features:</h4>
                  <ul className="text-sm space-y-2">
                    {Object.entries(plan.features).slice(0, 6).map(([key, value]) => (
                      <li key={key} className="flex items-center">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <>
                              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-gray-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                              <span className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                            </>
                          )
                        ) : (
                          <>
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-300">{value}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex-col space-y-3">
                <Button
                  onClick={() => handlePlanSelect(plan)}
                  variant={plan.buttonVariant}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                      : ''
                  }`}
                >
                  {plan.buttonText}
                </Button>
                
                {/* Add PAYG benefits for pay-as-you-go plan */}
                {plan.paymentType === 'payg' && <PAYGBenefits plan={plan} />}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Detailed Feature Comparison
            </span>
          </h2>
          
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="py-4 px-4 text-left text-gray-300 font-semibold">Feature</th>
                    {pricingPlans.map((plan) => (
                      <th key={plan.id} className="py-4 px-4 text-center text-gray-300 font-semibold min-w-[120px]">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <FeatureRow feature="basicContentTools" plans={pricingPlans} />
                  <FeatureRow feature="mediaLibrary" plans={pricingPlans} />
                  <FeatureRow feature="smartGallery" plans={pricingPlans} />
                  <FeatureRow feature="postFormatting" plans={pricingPlans} />
                  <FeatureRow feature="basicVideoTools" plans={pricingPlans} />
                  <FeatureRow feature="advancedContent" plans={pricingPlans} />
                  <FeatureRow feature="analytics" plans={pricingPlans} />
                  <FeatureRow feature="teamCollaboration" plans={pricingPlans} />
                  <FeatureRow feature="customBranding" plans={pricingPlans} />
                  <FeatureRow feature="apiAccess" plans={pricingPlans} />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-8">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade or downgrade anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white">
              <CardHeader>
                <CardTitle className="text-lg">What happens if I exceed my limits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">We'll notify you when you're approaching your limits and offer easy upgrade options.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Yes! All paid plans come with a 7-day free trial. No credit card required to start.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
                      <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border-purple-500/30 text-white max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Transform Your Social Media?</CardTitle>
              <CardDescription className="text-gray-300">
                Join thousands of creators and businesses already using Crow's Eye to supercharge their social media presence.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/auth/signup')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Start 7-Day Free Trial
              </Button>
              <Button 
                onClick={() => router.push('/features')}
                variant="outline"
                className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
              >
                Watch Demo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hidden Founder Access */}
        <div className="mt-8 text-center">
          <button 
            onClick={handleFounderClick}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors duration-300"
          >
            ··· ··· ···
          </button>
        </div>



      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>}>
      <PricingContent />
    </Suspense>
  );
} 