'use client'

import React, { useState } from 'react'
import { Check, Eye, Zap, ArrowRight, Star, Shield, Headphones, Plus, Crown, Building } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TIERS } from '@/data/tiers'

// Enhanced tier data with overage pricing
const enhancedTiers = [
  {
    ...TIERS[0], // Spark (Free)
    price: { monthly: 0, yearly: 0 },
    features: [
      "50 AI credits per month",
      "5 AI edits per month", 
      "1 social media set",
      "Basic community support",
      "Standard templates",
      "Basic analytics",
      "1 context file"
    ],
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const,
    popular: false,
    limits: {
      aiCredits: 50,
      aiEdits: 5,
      socialSets: 1,
      seats: 1,
      storage: "500 MB",
      contextFiles: 1
    },
    isEnterprise: false
  },
  {
    ...TIERS[1], // Creator
    price: { monthly: 19, yearly: 190 },
    features: [
      "300 AI credits per month",
      "30 AI edits per month",
      "3 social media sets",
      "Basic video editing suite",
      "Email support",
      "Custom templates & presets",
      "Basic analytics",
      "3 context files"
    ],
    buttonText: "Start Creating",
    buttonVariant: "primary" as const,
    popular: true,
    limits: {
      aiCredits: 300,
      aiEdits: 30,
      socialSets: 3,
      seats: 1,
      storage: "5 GB",
      contextFiles: 3
    },
    overage: {
      aiCredits: "$0.12 per credit",
      aiEdits: "$2 per edit",
      storage: "$8 per GB"
    }
  },
  {
    ...TIERS[2], // Growth
    price: { monthly: 35, yearly: 350 },
    features: [
      "600 AI credits per month",
      "60 AI edits per month",
      "6 social media sets",
      "Basic video editing suite",
      "Up to 3 team members",
      "Priority support",
      "Advanced analytics & reporting",
      "5 context files"
    ],
    buttonText: "Scale Your Growth",
    buttonVariant: "primary" as const,
    popular: false,
    limits: {
      aiCredits: 600,
      aiEdits: 60,
      socialSets: 6,
      seats: 3,
      storage: "25 GB",
      contextFiles: 5
    },
    overage: {
      aiCredits: "$0.10 per credit",
      aiEdits: "$1.75 per edit",
      storage: "$6 per GB",
      seats: "$18 per additional user"
    }
  },
  {
    ...TIERS[3], // Pro Agency
    price: { monthly: 49, yearly: 490 },
    features: [
      "1000 AI credits per month",
      "120 AI edits per month",
      "15 social media sets",
      "Full video editing suite",
      "Up to 10 team members",
      "Priority support",
      "Advanced analytics & reporting",
      "API access",
      "10 context files"
    ],
    buttonText: "Go Professional",
    buttonVariant: "primary" as const,
    popular: false,
    limits: {
      aiCredits: 1000,
      aiEdits: 120,
      socialSets: 15,
      seats: 10,
      storage: "100 GB",
      contextFiles: 10
    },
    overage: {
      aiCredits: "$0.08 per credit",
      aiEdits: "$1.50 per edit",
      storage: "$4 per GB",
      seats: "$15 per additional user"
    }
  },
  {
    ...TIERS[4], // Enterprise
    price: { monthly: 0, yearly: 0 }, // Custom pricing
    features: [
      "Custom AI credits",
      "Custom AI edits",
      "Unlimited social media sets",
      "Full video editing suite",
      "Unlimited team members",
      "Dedicated account manager",
      "Custom analytics & reporting",
      "Priority API access",
      "Custom integrations",
      "Unlimited context files"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "enterprise" as const,
    popular: false,
    limits: {
      aiCredits: "Custom",
      aiEdits: "Custom",
      socialSets: "Unlimited",
      seats: "Unlimited",
      storage: "Custom",
      contextFiles: "Custom"
    },
    isEnterprise: true
  }
];

const benefits = [
  {
    icon: <Shield className="h-6 w-6 text-green-400" />,
    title: "Secure & Private",
    description: "Your data stays safe with enterprise-grade security"
  },
  {
    icon: <Zap className="h-6 w-6 text-yellow-400" />,
    title: "Lightning Fast",
    description: "AI-powered processing that works at the speed of thought"
  },
  {
    icon: <Headphones className="h-6 w-6 text-blue-400" />,
    title: "Expert Support",
    description: "Get help from our team of social media experts"
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const router = useRouter();

  const calculateSavings = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    return Math.round((savings / monthlyCost) * 100);
  };

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
        
        {/* Logo Header */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img 
              src="/icon.png" 
              alt="Crow's Eye Logo" 
              className="h-16 w-16 md:h-20 md:w-20 opacity-90"
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
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 tech-heading">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Simple Pricing
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Powerful Results
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed tech-body">
            Choose the{' '}
            <span 
              onClick={handlePerfectClick}
              className="cursor-pointer hover:text-purple-300 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              perfect
            </span>{' '}
            plan for your content creation needs. All plans include our core AI features 
            and direct social media posting capabilities.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-base font-medium tech-body ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isYearly ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-base font-medium tech-body ${isYearly ? 'text-white' : 'text-gray-400'}`}>
              Yearly
            </span>
            <div className="vision-card rounded-full px-3 py-1">
              <span className="text-sm text-purple-300 font-medium tech-body">Save up to 25%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {enhancedTiers.map((plan, index) => (
              <div 
                key={plan.name}
                className={`relative vision-card rounded-2xl p-6 hover:bg-white/5 transition-all duration-500 hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-purple-500/50 scale-105' : ''
                } ${plan.isEnterprise ? 'ring-2 ring-gradient-to-r from-amber-500 to-orange-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium tech-subheading">
                      <Star className="h-3 w-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {plan.isEnterprise && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium tech-subheading">
                      <Building className="h-3 w-3" />
                      Enterprise
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2 tech-heading">{plan.name}</h3>
                  <p className="text-gray-400 mb-4 text-sm tech-body">{plan.description}</p>
                  
                  <div className="mb-4">
                    {plan.isEnterprise ? (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-white tech-heading">Custom</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-white tech-heading">
                          ${isYearly ? plan.price.yearly : plan.price.monthly}
                        </span>
                        {!isYearly && plan.price.monthly > 0 && (
                          <span className="text-gray-400 text-sm tech-body">/mo</span>
                        )}
                        {isYearly && plan.price.yearly > 0 && (
                          <span className="text-gray-400 text-sm tech-body">/yr</span>
                        )}
                      </div>
                    )}
                    
                    {isYearly && plan.price.monthly > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-purple-300 font-medium tech-body">
                          Save {calculateSavings(plan.price.monthly, plan.price.yearly)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {plan.features.slice(0, 4).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm tech-body">{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 4 && (
                    <div className="text-center">
                      <span className="text-purple-300 text-xs tech-body">
                        +{plan.features.length - 4} more features
                      </span>
                    </div>
                  )}
                </div>

                {/* Plan Limits */}
                <div className="mb-6 p-3 bg-black/20 rounded-lg">
                  <h4 className="text-xs font-semibold text-purple-300 mb-2 tech-subheading">Limits</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">AI Credits</span>
                      <span className="text-white">{plan.limits.aiCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">AI Edits</span>
                      <span className="text-white">{plan.limits.aiEdits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Social Sets</span>
                      <span className="text-white">{plan.limits.socialSets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Team Size</span>
                      <span className="text-white">{plan.limits.seats}</span>
                    </div>
                  </div>
                </div>

                {/* Overage Pricing */}
                {plan.overage && (
                  <div className="mb-6 p-3 bg-purple-900/20 rounded-lg">
                    <h4 className="text-xs font-semibold text-purple-300 mb-2 tech-subheading">Overage</h4>
                    <div className="space-y-1 text-xs">
                      {Object.entries(plan.overage).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400 capitalize">
                            {key === 'aiCredits' ? 'Credits' : key === 'aiEdits' ? 'Edits' : key === 'seats' ? 'Users' : 'Storage'}
                          </span>
                          <span className="text-purple-300">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-sm tech-subheading ${
                    plan.buttonVariant === 'primary' 
                      ? 'vision-button text-white' 
                      : plan.buttonVariant === 'enterprise'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                      : 'vision-card text-white hover:bg-white/10'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 tech-heading">Why Choose Crow's Eye?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto tech-body">
              More than just features—we deliver results
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.title}
                className="text-center vision-card rounded-xl p-8 hover:bg-white/5 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 vision-card rounded-full mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tech-subheading">{benefit.title}</h3>
                <p className="text-gray-400 tech-body">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 vision-card rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6 tech-heading">
              Ready to Transform Your Content Strategy?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto tech-body">
              Join thousands of creators who are already using Crow's Eye to amplify their social media presence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/demo" 
                className="inline-flex items-center gap-2 vision-button text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading"
              >
                <Eye className="h-5 w-5" />
                Try Free Demo
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center gap-2 vision-card text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 tech-subheading"
              >
                <ArrowRight className="h-5 w-5" />
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 