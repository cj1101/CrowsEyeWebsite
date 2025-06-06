'use client'

import React, { useState } from 'react'
import { CheckIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useStripeCheckout, PricingPlan, BillingInterval } from '@/hooks/useStripeCheckout'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingInterval>('monthly')
  const { createCheckoutSession, isLoading, error, clearError } = useStripeCheckout()

  const plans = [
    {
      name: 'Free Plan',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started and exploring Crow\'s Eye capabilities.',
      features: [
        'Linked Social Accounts: 1',
        'Users: 1',
        'AI Credits: 25 per month',
        'Scheduled Posts: 10 per month',
        'Media Storage: 500MB',
        'Basic Content Tools',
        'Basic Analytics Reports',
        'Community Support'
      ],
      popular: false,
      buttonText: 'Get Started',
      stripePlan: null,
      badge: 'Free',
      badgeColor: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Creator Plan',
      price: { monthly: 19, yearly: 190 },
      description: 'Ideal for individuals and content creators seeking powerful AI tools.',
      features: [
        'Linked Social Accounts: 3',
        'Users: 1',
        'AI Credits: 150 per month',
        'Scheduled Posts: 100 per month',
        'Media Storage: 5 GB',
        'All Free Plan features',
        'Smart AI Gallery Generator',
        'Advanced Post Formatting',
        'Basic Video Processing',
        'Email Support',
        'Additional AI Credit Packs'
      ],
      popular: true,
      buttonText: 'Choose Plan',
      stripePlan: 'creator' as PricingPlan,
      badge: 'Most Popular',
      badgeColor: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Growth Plan',
      price: { monthly: 35, yearly: 350 },
      description: 'Perfect for growing businesses and marketers needing more capacity.',
      features: [
        'Linked Social Accounts: 7',
        'Users: Up to 2',
        'AI Credits: 400 per month',
        'Scheduled Posts: 500 per month',
        'Media Storage: 25 GB',
        'All Creator Plan features',
        'Advanced Video Processing',
        'AI Content Suggestions',
        'Team Collaboration (Basic)',
        'Advanced Analytics',
        'Priority Email Support',
        'Additional AI Credit Packs'
      ],
      popular: false,
      buttonText: 'Choose Plan',
      stripePlan: 'growth' as PricingPlan,
      badge: 'Growing Teams',
      badgeColor: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Pro Plan',
      price: { monthly: 49, yearly: 490 },
      description: 'Comprehensive solution for professionals and small businesses.',
      features: [
        'Linked Social Accounts: 10',
        'Users: Up to 3',
        'AI Credits: 750 per month',
        'Scheduled Posts: Unlimited',
        'Media Storage: 50 GB',
        'All Growth Plan features',
        'Full Video Editing Suite',
        'VEO AI Video Generation',
        'AI Highlight Reels',
        'AI Story Assistant',
        'Bulk Operations',
        'Audio Importer',
        'Team Collaboration Tools',
        'Priority Support'
      ],
      popular: false,
      buttonText: 'Choose Plan',
      stripePlan: 'pro' as PricingPlan,
      badge: 'Pro Features',
      badgeColor: 'from-orange-500 to-red-500'
    },
    {
      name: 'Business Plan',
      price: { monthly: 'Custom', yearly: 'Custom' },
      description: 'Enterprise solution for agencies and high-volume businesses.',
      features: [
        'Unlimited Social Accounts',
        'Custom User Limits',
        'High-Volume AI Credits',
        'Unlimited Scheduled Posts',
        'Custom Media Storage',
        'All Pro Plan features',
        'Advanced Team Collaboration',
        'Custom Analytics Dashboards',
        'Custom Branding Options',
        'API Access',
        'Dedicated Account Manager',
        'Premium Support'
      ],
      popular: false,
      buttonText: 'Contact Sales',
      stripePlan: null,
      badge: 'Enterprise',
      badgeColor: 'from-gray-600 to-gray-500'
    }
  ]

  const handleSelectPlan = async (planName: string, stripePlan: PricingPlan | null) => {
    clearError()
    
    if (planName === 'Business Plan') {
      window.location.href = '/contact'
      return
    }

    if (planName === 'Free Plan') {
      alert('Free plan selected! You can start using Crow\'s Eye immediately.')
      return
    }

    if (stripePlan) {
      try {
        await createCheckoutSession(stripePlan, billingCycle)
      } catch (err) {
        console.error('Failed to create checkout session:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
            <SparklesIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Flexible Pricing Plans</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Choose Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Scale your social media presence with AI-powered tools designed for every stage of your journey.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 flex items-center gap-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}  
                className={`px-6 py-3 rounded-xl font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-md mx-auto bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4">
            <p className="text-red-200 text-sm text-center">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-xs text-red-300 hover:text-red-100 underline block mx-auto"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white/5 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 flex flex-col ${
                  plan.popular 
                    ? 'border-purple-500/50 ring-2 ring-purple-500/20 lg:scale-105' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Badge */}
                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 z-10`}>
                  <span className={`bg-gradient-to-r ${plan.badgeColor} text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg`}>
                    {plan.badge}
                  </span>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="text-center mb-6 mt-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed min-h-[3rem] flex items-center">
                      {plan.description}
                    </p>
                  </div>
                  
                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-white">
                        {typeof plan.price[billingCycle] === 'string' 
                          ? plan.price[billingCycle]
                          : `$${plan.price[billingCycle]}`
                        }
                      </span>
                      {typeof plan.price[billingCycle] !== 'string' && (
                        <span className="text-gray-400 text-sm">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && typeof plan.price.yearly === 'number' && plan.price.yearly > 0 && typeof plan.price.monthly === 'number' && (
                      <p className="text-green-400 text-sm mt-2">
                        Save ${(plan.price.monthly * 12) - plan.price.yearly} annually
                      </p>
                    )}
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckIcon className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <button 
                    onClick={() => handleSelectPlan(plan.name, plan.stripePlan)}
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      isLoading
                        ? 'bg-gray-500 text-white cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                        : plan.name === 'Business Plan'
                        ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        {plan.popular && <StarIcon className="h-5 w-5" />}
                        {plan.buttonText}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ/Benefits Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Why Choose Crow's Eye?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Commitment</h3>
              <p className="text-gray-300 text-sm">Cancel anytime. No hidden fees or long-term contracts.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI-Powered</h3>
              <p className="text-gray-300 text-sm">Leverage Google's Gemini AI for unmatched content creation.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <StarIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Premium Support</h3>
              <p className="text-gray-300 text-sm">Get help when you need it with our dedicated support team.</p>
            </div>
          </div>
          
          <div className="mt-12">
            <p className="text-gray-400 text-sm">
              All plans include a 14-day money-back guarantee. Start your journey with confidence.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
} 