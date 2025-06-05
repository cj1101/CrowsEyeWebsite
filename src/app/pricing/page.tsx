'use client'

import React, { useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: 'Free Plan',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect For: Users who want to try out Crow\'s Eye and see how it works.',
      features: [
        'Linked Social Accounts: 1',
        'Users: 1',
        'AI Credits: 25 per month',
        'Scheduled Posts: 10 per month',
        'Media Storage: 500MB',
        'Basic Content Tools (Media Library, Basic Image Editing)',
        'Basic Analytics Reports',
        'Community Support'
      ],
      popular: false,
      buttonText: 'Get Started'
    },
    {
      name: 'Creator Plan',
      price: { monthly: 19, yearly: 190 },
      description: 'Perfect For: Individuals and content creators looking for more power and essential AI tools.',
      features: [
        'Linked Social Accounts: 3',
        'Users: 1',
        'AI Credits: 150 per month',
        'Scheduled Posts: 100 per month',
        'Media Storage: 5 GB',
        'All features from the Free Plan',
        'Smart AI Gallery Generator',
        'Advanced Post Formatting Tools',
        'Basic Video Processing Tools',
        'Email Support',
        'Purchase Additional AI Credit Packs'
      ],
      popular: true,
      buttonText: 'Choose Plan'
    },
    {
      name: 'Pro Plan',
      price: { monthly: 50, yearly: 500 },
      description: 'Perfect For: Professionals, marketers, and small businesses needing advanced features and higher capacity.',
      features: [
        'Linked Social Accounts: 10',
        'Users: Up to 3',
        'AI Credits: 750 per month',
        'Scheduled Posts: Unlimited',
        'Media Storage: 50 GB',
        'All features from the Creator Plan',
        'Full Video Editing Suite',
        'VEO AI Video Generation',
        'AI Highlight Reels',
        'AI Story Assistant',
        'Bulk Operations for managing content',
        'Audio Importer for videos',
        'Advanced Analytics & Reporting',
        'Team Collaboration Tools',
        'Priority Email Support',
        'Purchase Additional AI Credit Packs'
      ],
      popular: false,
      buttonText: 'Choose Plan'
    },
    {
      name: 'Business Plan',
      price: { monthly: 'Custom', yearly: 'Custom' },
      description: 'Perfect For: Agencies, larger teams, and businesses with high-volume needs or requiring custom solutions.',
      features: [
        'Linked Social Accounts: Custom / High Volume',
        'Users: Custom / More Users included',
        'AI Credits: Custom / High Volume',
        'Scheduled Posts: Unlimited',
        'Media Storage: Custom / High Volume',
        'All features from the Pro Plan',
        'Advanced Team Collaboration Features',
        'Custom Analytics & Reporting Dashboards',
        'Custom Branding Options',
        'API Access (if needed)',
        'Dedicated Account Manager & Premium Support'
      ],
      popular: false,
      buttonText: 'Contact Sales'
    }
  ]

  const handleSelectPlan = (planName: string) => {
    if (planName === 'Business Plan') {
      // Redirect to contact page for custom pricing
      window.location.href = '/contact'
    } else {
      alert(`Selected ${planName}. Checkout would open here.`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crowseye-dark via-crowseye-dark-light to-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-300 mb-8">
            Scale your social media presence with our AI-powered tools
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="ml-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                Save 17%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-black/50 backdrop-blur-sm rounded-lg p-6 ${
                plan.popular ? 'ring-2 ring-primary-500' : 'border border-gray-700'
              } flex flex-col h-full`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2 text-white">{plan.name}</h3>
                <p className="text-gray-300 text-sm mb-4 min-h-[3rem]">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">
                    {typeof plan.price[billingCycle] === 'string' 
                      ? plan.price[billingCycle]
                      : `$${plan.price[billingCycle]}`
                    }
                  </span>
                  {typeof plan.price[billingCycle] !== 'string' && (
                    <span className="text-gray-400">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-2 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mt-auto ${
                  plan.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : plan.name === 'Business Plan'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* AI Credits Section */}
        <div className="mt-16">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Need More AI Credits?</h2>
            <p className="text-gray-300 mb-6">
              Purchase additional AI Credit Packs for Creator and Pro plans when you need extra power.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">50 AI Credits</h3>
                <p className="text-2xl font-bold text-white mb-2">$9.99</p>
                <p className="text-gray-400 text-sm">Perfect for light extra usage</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">100 AI Credits</h3>
                <p className="text-2xl font-bold text-white mb-2">$17.99</p>
                <p className="text-gray-400 text-sm">Great value for heavy users</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8 text-white">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 text-left">
              <h3 className="text-lg font-semibold mb-2 text-white">Can I change plans anytime?</h3>
              <p className="text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any billing differences.
              </p>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 text-left">
              <h3 className="text-lg font-semibold mb-2 text-white">What are AI credits?</h3>
              <p className="text-gray-300">
                AI credits are used for content generation, image editing, video processing, and other AI-powered features. Each AI operation consumes a certain number of credits based on complexity.
              </p>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 text-left">
              <h3 className="text-lg font-semibold mb-2 text-white">Is there a free trial?</h3>
              <p className="text-gray-300">
                Yes, our Free Plan lets you explore all basic features with no time limit. You get 25 AI credits monthly and access to core functionality.
              </p>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 text-left">
              <h3 className="text-lg font-semibold mb-2 text-white">What's included in team collaboration?</h3>
              <p className="text-gray-300">
                Team collaboration includes user management, shared workspaces, role-based permissions, and collaborative content creation and approval workflows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 