'use client'

import React from 'react'
import Link from 'next/link'
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid'

export default function Pricing() {
  const pricingTiers = [
    {
      name: 'Creator',
      price: '$5',
      description: 'Perfect for individual creators and those just starting out.',
      features: [
        'Desktop App: Unlimited Local Media Uploads & Organization',
        'Smart Media Library (Auto-Sort, Carousel Builder)',
        'AI Gallery Generator (NL Prompts, Basic Auto-Enhance, AI Captions)',
        'Post Formatting Options (Single, Carousel, Story)',
        'Interface Language Selection (10+ Languages)',
        'Smart Media Search (Content & Prompt-based)'
      ],
      webFeatures: [
        'Cloud Storage: 1 GB (approx. 100 high-res media items)',
        'AI Generations: 20 tasks/month (gallery, caption, etc.)',
        'Overage: Prompts to upgrade to Pro'
      ],
      buttonText: 'Get Started with Creator',
      popular: false,
      color: 'primary'
    },
    {
      name: 'Pro',
      price: '$30',
      description: 'For serious creators, professionals, and small businesses needing advanced AI power.',
      features: [
        'Everything in Creator, PLUS:',
        '✨ Highlight Reel Generator (AI Video Shorts)',
        '✨ Audio Importer & Natural Language Editor',
        '✨ Story Assistant (Video Slicing, Vertical Formatting, Overlays)',
        '✨ Reel Thumbnail Selector (AI Suggestions & Custom Upload)',
        '✨ Post Performance Graphs (Internal App Tracking)'
      ],
      webFeatures: [
        'Cloud Storage: 10 GB (approx. 1000 high-res media items)',
        'AI Generations: 150 tasks/month',
        'Overage: Prompts to upgrade to Agent or contact for custom plan'
      ],
      buttonText: 'Go Pro',
      popular: true,
      color: 'primary'
    },
    {
      name: 'Agent',
      price: '$300',
      description: 'Tailored for marketing agencies, social media managers, and teams.',
      features: [
        'Everything in Pro, PLUS:',
        '🚀 Multi-User Collaboration (e.g., Up to 5 Team Seats included)',
        '🚀 Multi-Account Management (e.g., Connect up to 10 Client Social Profiles)',
        '🚀 Role-Based Permissions (Admin, Editor)',
        '🚀 Priority Support',
        'Additional seats/client accounts available - Contact Sales'
      ],
      webFeatures: [
        'Cloud Storage: 100 GB (or "Generous Fair Use")',
        'AI Generations: 1000 tasks/month (or "Generous Fair Use")'
      ],
      buttonText: 'Choose Agent Tier',
      popular: false,
      color: 'yellow'
    }
  ]

  const allTiersInclude = [
    'Full-featured Desktop Application',
    'Access to Web Platform (with tier-specific limits)',
    'Meta Compliance Features (Data Export, Deletion)',
    'Regular Updates & New Features',
    'Community Support'
  ]

  const faqs = [
    {
      question: "What counts as an 'AI Generation Task'?",
      answer: "One AI generation task includes activities like generating one gallery, creating one caption, producing one highlight reel, or any single AI-powered content creation operation."
    },
    {
      question: "What happens if I exceed my web platform limits on the Creator or Pro tier?",
      answer: "When you approach your limits, you'll receive upgrade prompts. For storage, you can always use the unlimited desktop app. For AI tasks, you'll be prompted to upgrade to access more monthly generations."
    },
    {
      question: "Is the Desktop App truly unlimited?",
      answer: "Yes, for local storage and organization. AI tasks might still be tied to your account's monthly quota if they require cloud processing, even if initiated from desktop."
    },
    {
      question: "Can I change my plan later?",
      answer: "Absolutely! You can upgrade or downgrade your plan anytime. Changes take effect at your next billing cycle."
    },
    {
      question: "Is there an annual discount?",
      answer: "Yes! Get 2 months free with annual billing on any plan."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise plans."
    }
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Find the Perfect Crow's Eye Plan for You
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Powerful tools for every creator, from individuals to agencies. All plans include our 
            full-featured Desktop App with unlimited local media organization.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative feature-card rounded-lg p-8 ${
                tier.popular ? 'border-primary-500 scale-105' : 'border-primary-600/30'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    <StarIcon className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-gray-400"> / month</span>
                </div>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Key Features:</h4>
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4">Web Platform Usage:</h4>
                <ul className="space-y-2">
                  {tier.webFeatures.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover-glow'
                    : tier.color === 'yellow'
                    ? 'border border-yellow-500 text-yellow-400 hover:bg-yellow-500/10'
                    : 'border border-primary-500 text-primary-400 hover:bg-primary-500/10'
                }`}
              >
                {tier.buttonText}
              </button>

              {tier.name === 'Agent' && (
                <div className="mt-4 text-center">
                  <Link
                    href="/contact"
                    className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                  >
                    Contact Sales for Custom Agency Solutions
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* All Tiers Include */}
        <div className="bg-gradient-to-r from-primary-900/20 to-primary-600/20 rounded-2xl p-8 mb-20">
          <h3 className="text-2xl font-bold text-white text-center mb-6">
            All Tiers Include:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {allTiersInclude.map((item, index) => (
              <div key={index} className="flex items-center">
                <CheckIcon className="h-5 w-5 text-primary-500 mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="feature-card rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-6">
            Ready to Transform Your Creative Workflow?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Start with our free desktop app or choose the plan that fits your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover-glow transition-all duration-300">
              Download Free Desktop App
            </button>
            <Link
              href="/contact"
              className="border border-primary-500 text-primary-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-500/10 transition-all duration-300"
            >
              Need Custom Pricing?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 