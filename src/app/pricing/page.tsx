'use client'

import React from 'react'
import { Check, X, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

const pricingPlans = [
  {
    name: "Free Plan",
    price: "$0/month",
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
    buttonClass: "border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10"
  },
  {
    name: "Creator Plan",
    price: "$19/month", 
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
    popular: true
  },
  {
    name: "Pro Plan",
    price: "$59/month",
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
      customBranding: false,
      apiAccess: false
    },
    buttonText: "Go Pro",
    buttonClass: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
  },
  {
    name: "Business Plan",
    price: "Contact Us",
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
      teamCollaboration: "Advanced Collaboration",
      support: "Dedicated Account Manager",
      customBranding: true,
      apiAccess: true
    },
    buttonText: "Contact Sales",
    buttonClass: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
  }
];

export default function PricingPage() {
  const router = useRouter();

  const handlePerfectClick = () => {
    const passcode = prompt("What's the passcode?");
    if (passcode && passcode.toLowerCase() === 'plz') {
      router.push('/pricing/founder');
    }
  };

  return (
    <div className="min-h-screen darker-gradient-bg logo-bg-overlay">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Eye className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl md:text-6xl font-bold tech-heading">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h1>
          </div>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed tech-body">
            Choose the{' '}
            <span 
              onClick={handlePerfectClick}
              className="cursor-pointer hover:text-purple-300 transition-colors underline decoration-dotted"
              style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              title="Click for special access"
            >
              perfect
            </span>{' '}
            plan for your content creation needs. All plans include our core AI features 
            and direct social media posting capabilities.
          </p>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] bg-black/20 rounded-2xl border border-purple-500/20">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left p-6 text-purple-300 font-semibold">Feature Category</th>
                  {pricingPlans.map((plan, index) => (
                    <th key={index} className="text-center p-6 relative">
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <div className="text-white font-bold text-lg mb-2">{plan.name}</div>
                      <div className="text-2xl font-bold text-purple-300 mb-2">{plan.price}</div>
                      <div className="text-gray-400 text-sm">{plan.targetUser}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300 font-medium">Price</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white font-semibold">{plan.price}</td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300 font-medium">Target User</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-gray-300 text-sm">{plan.description}</td>
                  ))}
                </tr>

                {/* Core Usage Limits */}
                <tr className="border-b border-purple-500/10">
                  <td colSpan={5} className="p-4 bg-purple-900/20 font-semibold text-purple-300">
                    Core Usage Limits
                  </td>
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300">Linked Social Accounts</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">{plan.limits.linkedAccounts}</td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300">Users</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">{plan.limits.users}</td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300">AI Credits</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">{plan.limits.aiCredits}</td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300">Scheduled Posts</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">{plan.limits.scheduledPosts}</td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300">Media Storage</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">{plan.limits.mediaStorage}</td>
                  ))}
                </tr>

                {/* Key Features */}
                <tr className="border-b border-purple-500/10">
                  <td colSpan={5} className="p-4 bg-purple-900/20 font-semibold text-purple-300">
                    Key Features
                  </td>
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300">Basic Content Tools</td>
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
                  <td className="p-4 text-gray-300">Smart Gallery</td>
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
                  <td className="p-4 text-gray-300">Post Formatting</td>
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
                  <td className="p-4 text-gray-300">Basic Video Tools</td>
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
                  <td className="p-4 text-gray-300">Advanced Content</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">
                      {plan.features.advancedContent === false ? (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      ) : typeof plan.features.advancedContent === 'string' ? (
                        <span className="text-sm text-purple-300">{plan.features.advancedContent}</span>
                      ) : (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300">Analytics</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">
                      <span className="text-sm text-purple-300">{plan.features.analytics}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300">Team Collaboration</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center">
                      {plan.features.teamCollaboration === false ? (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      ) : typeof plan.features.teamCollaboration === 'string' ? (
                        <span className="text-sm text-purple-300">{plan.features.teamCollaboration}</span>
                      ) : (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300">Support</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center text-white">
                      <span className="text-sm text-purple-300">{plan.features.support}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300">Custom Branding</td>
                  {pricingPlans.map((plan, index) => (
                    <td key={index} className="p-4 text-center">
                      {plan.features.customBranding ? (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-purple-500/10">
                  <td className="p-4 text-gray-300">API Access</td>
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
                      <button className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${plan.buttonClass}`}>
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