'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

const pricingTiers = [
  {
    name: "Spark",
    price: "$0",
    frequency: "/forever",
    description: "For individuals exploring Crow's Eye and students.",
    features: [
      "Up to 2 Social Accounts (1 FB Page, 1 IG Profile)",
      "Limited AI Content Credits (50 generations/month)",
      "Basic Gemini 1.5 Flash Image Analysis",
      "Limited AI Image Editing (5 edits/month)",
      "Basic Scheduling",
      "Basic Meta Insights",
      "1 Context File Limit",
      "Limited Preset Manager (3 presets)",
      "Limited Media Library Storage (1GB)",
      "All 10 Languages Supported",
      "Community Forum & Basic FAQ Support"
    ],
    cta: "Get Started for Free",
    href: "/download",
    mostPopular: false
  },
  {
    name: "Creator",
    price: "$29",
    frequency: "/month",
    description: "For solopreneurs, content creators, and freelancers.",
    features: [
      "Up to 5 Social Accounts",
      "Moderate AI Content Credits (300 generations/month)",
      "Full Image & Basic Video Analysis (Gemini 1.5 Flash)",
      "Full Access to AI Image Editing",
      "Basic Video Processing Tools (Trim, Basic Audio Overlay)",
      "Advanced Scheduling & Content Calendar View",
      "Standard Meta Insights & Basic Reports",
      "Up to 3 Context Files",
      "Full Preset Manager Access",
      "Moderate Media Library Storage (10GB)",
      "Email Support (Standard Response)",
      "Access to Knowledge Base System"
    ],
    cta: "Choose Creator Plan",
    href: "/download?tier=creator", // Placeholder for checkout/signup
    mostPopular: true
  },
  {
    name: "Pro Agency",
    price: "$79",
    frequency: "/month",
    description: "For SMBs, marketing agencies, and power users.",
    features: [
      "Up to 15 Social Accounts (or per client add-on)",
      "Ample AI Content Credits (1000 generations/month)",
      "Full Image & Advanced Video Analysis (mood, theme, narrative)",
      "Full Video Processing Suite (Highlight Reels, Advanced Audio, Thumbnails)",
      "Full Direct Posting & Management for LinkedIn & X (once V1.1 available)",
      "Advanced Scheduling, Bulk Upload, Team Calendar",
      "Advanced Analytics, Customizable Reports, Competitor Tracking (future)",
      "Up to 10 Context Files (or per client)",
      "Preset Manager with Team Sharing (future)",
      "Large Media Library Storage (50GB)",
      "Priority Email Support & Dedicated Onboarding Session",
      "White-Label Option (Available as Add-on / Higher Sub-tier)"
    ],
    cta: "Choose Pro Agency Plan",
    href: "/download?tier=pro-agency", // Placeholder for checkout/signup
    mostPopular: false
  },
  {
    name: "Business Scale",
    price: "Custom",
    frequency: "",
    description: "For larger agencies and enterprises with custom needs.",
    features: [
      "Unlimited / Custom Social Accounts",
      "Very High / Custom AI Content Credits",
      "Full Image & Advanced Video Analysis",
      "Full Video Processing Suite",
      "Full Direct Posting & Management for All Supported Platforms",
      "Advanced Scheduling & Custom Workflows",
      "Custom Reporting & API Access (Future)",
      "Unlimited / Custom Context Files",
      "Preset Manager with Team Sharing",
      "Custom / Unlimited Media Library Storage",
      "Dedicated Account Manager & SLA",
      "White-Label Option Included / Custom"
    ],
    cta: "Contact Sales",
    href: "/contact",
    mostPopular: false
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-crowseye-dark via-crowseye-dark-light to-black text-white">
      <section className="py-20 pt-32 md:py-28 md:pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Flexible Pricing for <span className="gradient-text">Every Creator</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the perfect plan to power your social media strategy with Crow's Eye Marketing Suite.
              Annual plans include a 15% discount.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 items-stretch">
            {pricingTiers.map((tier) => (
              <div 
                key={tier.name} 
                className={`pricing-card bg-black/30 backdrop-blur-sm rounded-xl shadow-2xl p-8 flex flex-col ${tier.mostPopular ? 'border-2 border-primary-500 shadow-primary-500/30' : 'border border-gray-700/50'}`}
              >
                {tier.mostPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold text-white mb-2">{tier.name}</h2>
                  <p className="text-gray-400 text-sm mb-4 h-12">{tier.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                    {tier.frequency && <span className="text-gray-400 text-sm">{tier.frequency}</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link 
                  href={tier.href} 
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 text-center ${tier.mostPopular ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover-glow' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-400">
              All plans include access to our comprehensive knowledge base and community support. 
              <Link href="/features" className="text-primary-400 hover:text-primary-300"> Explore all features</Link>.
            </p>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .gradient-text {
          background: -webkit-linear-gradient(45deg, var(--color-primary-500), var(--color-primary-400));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .pricing-card {
          transition: all 0.3s ease-in-out;
        }
        .pricing-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  )
} 