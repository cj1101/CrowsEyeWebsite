'use client'

import React from 'react'
import { Check, Eye, Crown, Zap, Star, Shield, Headphones } from 'lucide-react'

const founderPlan = {
  name: "Founder's Legacy",
  price: { monthly: 10 },
  originalPrice: { monthly: 49 },
  description: "Exclusive lifetime pricing for visionary founders",
  features: [
    "1000 AI credits per month",
    "Advanced team management",
    "Unlimited connected accounts",
    "Full white-label solution",
    "Dedicated account manager",
    "Custom analytics & reporting",
    "Priority API access",
    "Custom integrations",
    "Up to 10 team members",
    "Revenue sharing program",
    "200 GB storage",
    "Priority AI model access (GPT-4, Claude, etc.)",
    "Custom AI training on your brand voice",
    "Advanced scheduling automation",
    "Exclusive founder community access",
    "Beta feature early access",
    "Custom domain support",
    "Enterprise-grade security & compliance"
  ],
  buttonText: "Claim Founder's Price"
};

const founderBenefits = [
  {
    icon: <Crown className="h-8 w-8 text-yellow-400" />,
    title: "Pro-Level Access",
    description: "Get all Pro features for $10/month - locked in forever as a founding member"
  },
  {
    icon: <Zap className="h-8 w-8 text-purple-400" />,
    title: "Cutting-Edge Features",
    description: "Same powerful features as Pro plan: 1000 AI credits, unlimited accounts, team management"
  },
  {
    icon: <Shield className="h-8 w-8 text-green-400" />,
    title: "Lifetime Price Lock",
    description: "Your $10/month pricing will never increase, even as Pro plan prices go up"
  }
];

export default function FounderPricingPage() {
  const calculateSavings = () => {
    const monthlySavings = founderPlan.originalPrice.monthly - founderPlan.price.monthly;
    return { monthly: monthlySavings, percent: Math.round((monthlySavings / founderPlan.originalPrice.monthly) * 100) };
  };

  const savings = calculateSavings();

  const handleClaimFounderPrice = () => {
    window.open('https://buy.stripe.com/3cI8wP2ST9BVcGO9LdeIw06', '_blank');
  };

  return (
    <div className="min-h-screen darker-gradient-bg logo-bg-overlay">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-purple-500/10"></div>
        
        {/* Logo Header */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img 
              src="/favicon.ico" 
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
          <div className="flex items-center justify-center gap-2 mb-6">
            <Crown className="h-12 w-12 text-yellow-400" />
            <h2 className="text-5xl md:text-7xl font-bold tech-heading">
              <span className="bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
                $10/Month
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Pro Access
              </span>
            </h2>
          </div>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed tech-body">
            You found the secret! As one of our early believers, you deserve something special. 
            Get Pro-level features for just $10/month - our way of saying thank you for believing in our vision.
          </p>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-3 rounded-full font-bold text-lg mb-12">
            <Star className="h-5 w-5" />
            Save {savings.percent}% Forever!
          </div>
        </div>
      </section>

      {/* Founder Pricing Card */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative vision-card rounded-3xl p-12 ring-4 ring-yellow-500/50 bg-gradient-to-br from-purple-900/20 to-yellow-900/20">

            
            <div className="text-center mb-12 pt-4">
              <h3 className="text-4xl font-bold text-white mb-4 tech-heading">{founderPlan.name}</h3>
              <p className="text-gray-300 text-lg mb-8 tech-body">{founderPlan.description}</p>
              
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-gray-400 line-through text-2xl">
                      ${founderPlan.originalPrice.monthly}/mo
                    </div>
                    <div className="text-5xl font-bold text-white tech-heading">
                      ${founderPlan.price.monthly}
                      <span className="text-xl text-gray-400">/month</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 vision-card rounded-xl p-4 mb-6">
                  <div className="text-2xl font-bold text-green-400 mb-2">Save ${savings.monthly} per month!</div>
                  <div className="text-green-300">That's {savings.percent}% off Pro pricing forever - same features, founder price!</div>
                </div>
              </div>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {founderPlan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-200 tech-body">{feature}</span>
                </div>
              ))}
            </div>
            
            {/* CTA Button */}
            <div className="text-center">
              <button 
                onClick={handleClaimFounderPrice}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-12 py-6 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-105 tech-subheading shadow-2xl shadow-yellow-500/25"
              >
                <Crown className="h-6 w-6" />
                {founderPlan.buttonText}
              </button>
              <p className="text-gray-400 mt-4 tech-body">
                🔒 Price locked forever • 💳 Cancel anytime • 🚀 Start immediately
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Benefits */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 tech-heading">Why This Matters</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto tech-body">
              As a founder yourself, you understand the value of being first
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {founderBenefits.map((benefit, index) => (
              <div 
                key={benefit.title}
                className="text-center vision-card rounded-xl p-8 hover:bg-white/5 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 vision-card rounded-full mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tech-subheading">{benefit.title}</h3>
                <p className="text-gray-400 tech-body">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusive Message */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/10 to-yellow-500/10 vision-card rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-6 tech-heading">
              A Personal Message from Our Team
            </h2>
            <div className="text-lg text-gray-300 leading-relaxed tech-body space-y-4">
              <p>
                "You took the time to explore, to dig deeper, to find what others missed. 
                That's exactly the kind of curiosity and determination that builds successful businesses."
              </p>
              <p>
                "This isn't just a discount—it's our partnership offer. Help us grow, and we'll make sure 
                you have every tool you need to dominate your market."
              </p>
              <p className="text-purple-300 font-semibold">
                "Welcome to the Crow's Eye founder family."
              </p>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold">CE</span>
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">The Crow's Eye Team</div>
                <div className="text-gray-400 text-sm">Founders & Builders</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 