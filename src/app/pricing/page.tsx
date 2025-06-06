'use client'

import React, { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

const pricingPlans = [
  {
    name: "Free Plan",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Try us out!",
    targetUser: "Individuals",
    limits: {
      linkedAccounts: 1,
      users: 1,
      aiCredits: "25/month",
      scheduledPosts: "10/month",
      mediaStorage: "500MB"
    },
    features: {
      basicContentTools: true,
      mediaLibrary: true,
      smartGallery: false,
      postFormatting: false,
      basicVideoTools: false,
      advancedContent: false,
      analytics: "Basic Reports",
      teamCollaboration: false,
      support: "Community",
      customBranding: false,
      apiAccess: false
    },
    buttonText: "Get Started Free",
    buttonClass: "border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10",
    paymentType: "free"
  },
  {
    name: "Creator Plan",
    monthlyPrice: 19,
    yearlyPrice: 190,
    description: "Individuals & Creators",
    targetUser: "Content Creators",
    limits: {
      linkedAccounts: 3,
      users: 1,
      aiCredits: "150/month",
      scheduledPosts: "100/month",
      mediaStorage: "5 GB"
    },
    features: {
      basicContentTools: true,
      mediaLibrary: true,
      smartGallery: true,
      postFormatting: true,
      basicVideoTools: true,
      advancedContent: false,
      analytics: "Basic Reports",
      teamCollaboration: false,
      support: "Email Support",
      customBranding: false,
      apiAccess: false
    },
    buttonText: "Start Creating",
    buttonClass: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600",
    paymentType: "creator",
    monthlyUrl: "https://buy.stripe.com/9B65kD655g0j6iqg9BeIw00",
    yearlyUrl: "https://buy.stripe.com/6oU4gz511bK36iqf5xeIw01"
  },
  {
    name: "Growth Plan",
    monthlyPrice: 35,
    yearlyPrice: 350,
    description: "Growing businesses & marketers",
    targetUser: "Growing Businesses",
    limits: {
      linkedAccounts: 7,
      users: "Up to 2",
      aiCredits: "400/month",
      scheduledPosts: "300/month",
      mediaStorage: "25 GB"
    },
    features: {
      basicContentTools: true,
      mediaLibrary: true,
      smartGallery: true,
      postFormatting: true,
      basicVideoTools: true,
      advancedContent: "Basic Video Suite",
      analytics: "Enhanced Analytics",
      teamCollaboration: true,
      support: "Priority Email Support",
      customBranding: "Basic Branding",
      apiAccess: false
    },
    buttonText: "Scale Your Growth",
    buttonClass: "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600",
    paymentType: "growth",
    monthlyUrl: "https://buy.stripe.com/bJe9ATeBB7tN6iqf5xeIw02",
    yearlyUrl: "https://buy.stripe.com/3cI5kDbpp15p5emcXpeIw03"
  },
  {
    name: "Pro Plan",
    monthlyPrice: 49,
    yearlyPrice: 490,
    description: "Professionals & Small Teams", 
    targetUser: "Professionals",
    limits: {
      linkedAccounts: 10,
      users: "Up to 3",
      aiCredits: "Over 750/month",
      scheduledPosts: "Unlimited",
      mediaStorage: "50 GB"
    },
    features: {
      basicContentTools: true,
      mediaLibrary: true,
      smartGallery: true,
      postFormatting: true,
      basicVideoTools: true,
      advancedContent: "Full Video Suite",
      analytics: "Advanced Analytics",
      teamCollaboration: true,
      support: "Priority Email Support",
      customBranding: "Full Custom Branding",
      apiAccess: true
    },
    buttonText: "Go Pro",
    buttonClass: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600",
    paymentType: "pro",
    monthlyUrl: "https://buy.stripe.com/5kQ3cvfFF3dx22a8H9eIw04",
    yearlyUrl: "https://buy.stripe.com/dRm00j2ST9BVeOW6z1eIw05"
  },
  {
    name: "Business Plan",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Agencies & Larger Teams",
    targetUser: "Enterprise",
    limits: {
      linkedAccounts: "Custom / High Volume",
      users: "Custom / More Users", 
      aiCredits: "Custom / High Volume",
      scheduledPosts: "Unlimited",
      mediaStorage: "Custom / High Volume"
    },
    features: {
      basicContentTools: true,
      mediaLibrary: true,
      smartGallery: true,
      postFormatting: true,
      basicVideoTools: true,
      advancedContent: "All Pro features +",
      analytics: "Custom Analytics & Reporting",
      teamCollaboration: true,
      support: "Dedicated Account Manager",
      customBranding: "Enterprise Branding",
      apiAccess: true
    },
    buttonText: "Contact Sales",
    buttonClass: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600",
    paymentType: "contact"
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handlePerfectClick = () => {
    const passcode = prompt("What's the passcode?");
    if (passcode && passcode.toLowerCase() === 'plz') {
      router.push('/pricing/founder');
    }
  };

  const getDisplayPrice = (plan: typeof pricingPlans[0]) => {
    if (plan.paymentType === 'free') return '$0/month';
    if (plan.paymentType === 'contact') return 'Contact Us';
    
    if (billingPeriod === 'monthly') {
      return `$${plan.monthlyPrice}/month`;
    } else {
      return `$${plan.yearlyPrice}/year`;
    }
  };

  const handlePlanSelect = (plan: typeof pricingPlans[0]) => {
    if (plan.paymentType === 'free') {
      // Handle free plan signup
      window.open('/auth/register', '_blank');
    } else if (plan.paymentType === 'contact') {
      // Handle contact sales
      window.open('/contact', '_blank');
    } else {
      // Handle paid plans
      const url = billingPeriod === 'monthly' ? plan.monthlyUrl : plan.yearlyUrl;
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  return (
    <div className="min-h-screen darker-gradient-bg logo-bg-overlay">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img 
              src="/crows_eye_logo_transparent.png" 
              alt="Crow's Eye Logo" 
              className="h-16 w-16 opacity-90"
            />
            <div className="text-left">
              <h1 className="text-2xl md:text-4xl font-bold tech-heading gradient-text-animated">
                CROW'S EYE
              </h1>
              <p className="text-purple-300 text-sm md:text-base tech-subheading">
                AI Marketing Suite
              </p>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold tech-heading mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed tech-body">
            Choose the{' '}
            <span 
              onClick={handlePerfectClick}
              className="text-gray-300 cursor-default select-none"
              style={{ 
                cursor: 'default',
                textDecoration: 'none',
                border: 'none',
                outline: 'none'
              }}
            >
              perfect
            </span>{' '}
            plan for your content creation needs. All plans include our core AI features 
            and direct social media posting capabilities.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg ${billingPeriod === 'monthly' ? 'text-white font-semibold' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${billingPeriod === 'yearly' ? 'text-white font-semibold' : 'text-gray-400'}`}>
              Annual
            </span>
            {billingPeriod === 'yearly' && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Save 17%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] bg-black/20 rounded-2xl border border-purple-500/20">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left p-6 text-white font-semibold">Feature Category</th>
                  {pricingPlans.map((plan, index) => (
                    <th key={index} className="text-center p-6 relative pt-8 pb-12">
                      <div className="text-white font-bold text-lg mb-2 mt-2">{plan.name}</div>
                      <div className="text-2xl font-bold text-white mb-2">{getDisplayPrice(plan)}</div>
                      <div className="text-gray-300 text-sm">{plan.targetUser}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Price</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white font-semibold">
                      <div>{getDisplayPrice(plan)}</div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Target User</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-gray-300 text-sm">{plan.description}</td>
                  ))}
                </tr>

                {/* Core Usage Limits */}
                <tr className="border-b border-purple-500/10">
                  <td colSpan={6} className="p-6 bg-purple-900/30 font-bold text-white text-lg">
                    Core Usage Limits
                  </td>
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Linked Social Accounts</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white font-semibold">{plan.limits.linkedAccounts}</td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Users</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white font-semibold">{plan.limits.users}</td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">AI Credits</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white font-semibold">{plan.limits.aiCredits}</td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Scheduled Posts</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white font-semibold">{plan.limits.scheduledPosts}</td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Media Storage</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white font-semibold">{plan.limits.mediaStorage}</td>
                  ))}
                </tr>

                {/* Key Features */}
                <tr className="border-b border-purple-500/10">
                  <td colSpan={6} className="p-6 bg-purple-900/30 font-bold text-white text-lg">
                    Key Features
                  </td>
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Basic Content Tools</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center">
                      {plan.features.basicContentTools ? (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Smart Gallery</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center">
                      {plan.features.smartGallery ? (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Post Formatting</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center">
                      {plan.features.postFormatting ? (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Basic Video Tools</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center">
                      {plan.features.basicVideoTools ? (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Advanced Content</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">
                      {plan.features.advancedContent === false ? (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      ) : typeof plan.features.advancedContent === 'string' ? (
                        <span className="text-sm text-white font-medium">{plan.features.advancedContent}</span>
                      ) : (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Analytics</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">
                      <span className="text-sm text-white font-medium">{plan.features.analytics}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Team Collaboration</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center">
                      {plan.features.teamCollaboration ? (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Support</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">
                      <span className="text-sm text-white font-medium">{plan.features.support}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">Custom Branding</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">
                      {plan.features.customBranding === false ? (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      ) : typeof plan.features.customBranding === 'string' ? (
                        <span className="text-sm text-white font-medium">{plan.features.customBranding}</span>
                      ) : (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-white font-medium">API Access</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center">
                      {plan.features.apiAccess ? (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Action Buttons */}
                <tr>
                  <td className="p-4"></td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-6 text-center">
                      <button 
                        onClick={() => handlePlanSelect(plan)}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${plan.buttonClass}`}
                      >
                        {plan.buttonText}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
} 