'use client'

import React, { useState } from 'react'
import { Check, Eye, Zap, ArrowRight, Star, Shield, Headphones } from 'lucide-react'

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for trying out Crow's Eye",
    features: [
      "5 AI content generations per month",
      "Basic social media posting",
      "2 connected accounts",
      "Standard templates",
      "Community support"
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    name: "Creator",
    price: { monthly: 29, yearly: 290 },
    description: "Ideal for content creators and influencers",
    features: [
      "100 AI content generations per month",
      "Advanced editing tools",
      "10 connected accounts",
      "Custom templates & presets",
      "Priority support",
      "Performance analytics",
      "Video processing"
    ],
    buttonText: "Start Creating",
    buttonVariant: "primary" as const,
    popular: true
  },
  {
    name: "Business",
    price: { monthly: 79, yearly: 790 },
    description: "For growing businesses and agencies",
    features: [
      "Unlimited AI content generations",
      "Team collaboration tools",
      "Unlimited connected accounts",
      "White-label options",
      "24/7 dedicated support",
      "Advanced analytics & reporting",
      "API access",
      "Custom integrations"
    ],
    buttonText: "Scale Your Business",
    buttonVariant: "primary" as const,
    popular: false
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

  const calculateSavings = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    return Math.round((savings / monthlyCost) * 100);
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
            Choose the perfect plan for your content creation needs. All plans include our core AI features 
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={plan.name}
                className={`relative vision-card rounded-2xl p-8 hover:bg-white/5 transition-all duration-500 hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-purple-500/50 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium tech-subheading">
                      <Star className="h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2 tech-heading">{plan.name}</h3>
                  <p className="text-gray-400 mb-6 tech-body">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-white tech-heading">
                        ${isYearly ? plan.price.yearly : plan.price.monthly}
                      </span>
                      {!isYearly && (
                        <span className="text-gray-400 tech-body">/month</span>
                      )}
                      {isYearly && plan.price.yearly > 0 && (
                        <span className="text-gray-400 tech-body">/year</span>
                      )}
                    </div>
                    
                    {isYearly && plan.price.monthly > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-purple-300 font-medium tech-body">
                          Save {calculateSavings(plan.price.monthly, plan.price.yearly)}% annually
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 tech-body">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading ${
                    plan.buttonVariant === 'primary' 
                      ? 'vision-button text-white' 
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