'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { TIERS } from '@/data/tiers'
import { useAuth } from '@/contexts/AuthContext'
import { useStripeCheckout } from '@/hooks/useStripeCheckout'

// Helper function to detect BYOK
function useByokDetection() {
  const [hasByok, setHasByok] = useState(false);
  
  useEffect(() => {
    // Check localStorage for custom API key
    const customApiKey = localStorage.getItem('CUSTOM_API_KEY');
    // Also check environment variable (for testing)
    const envApiKey = process.env.NEXT_PUBLIC_CUSTOM_API_KEY;
    setHasByok(Boolean(customApiKey || envApiKey));
  }, []);
  
  return hasByok;
}

// Convert tier data to pricing display format
function convertTierToDisplay(tier: any, hasByok: boolean) {
  const base = tier.monthly;
  const price = hasByok && tier.monthlyByok ? tier.monthlyByok : base;
  
  let displayPrice;
  if (base === 0) {
    displayPrice = '$0';
  } else if (tier.id === 'enterprise') {
    displayPrice = 'Custom';
  } else {
    displayPrice = `$${price}${hasByok ? ' (BYOK)' : ''}`;
  }
  
  return {
    id: tier.id,
    name: tier.name,
    price: displayPrice,
    frequency: base === 0 || tier.id === 'enterprise' ? '' : '/month',
    description: tier.description,
    features: generateFeatureList(tier),
    cta: tier.id === 'enterprise' ? 'Contact Sales' : tier.id === 'spark' ? 'Get Started for Free' : `Choose ${tier.name} Plan`,
    href: tier.id === 'enterprise' ? '/contact' : tier.id === 'spark' ? '/download' : null,
    mostPopular: tier.id === 'creator',
    monthly: tier.monthly,
    hasByokDiscount: hasByok && tier.monthly > 0 && tier.id !== 'enterprise',
    isPaid: tier.monthly > 0 && tier.id !== 'enterprise'
  };
}

function generateFeatureList(tier: any) {
  const features = [];
  
  // Social accounts
  if (typeof tier.socialSets === 'number') {
    features.push(`Up to ${tier.socialSets} Social Account${tier.socialSets > 1 ? 's' : ''}`);
  } else {
    features.push(`${tier.socialSets} Social Accounts`);
  }
  
  // AI Credits
  if (typeof tier.aiCredits === 'number') {
    features.push(`${tier.aiCredits} AI Content Credits/month`);
  } else {
    features.push(`${tier.aiCredits} AI Content Credits`);
  }
  
  // AI Edits
  if (typeof tier.aiEdits === 'number') {
    features.push(`${tier.aiEdits} AI Image Edits/month`);
  } else {
    features.push(`${tier.aiEdits} AI Image Edits`);
  }
  
  // Video Suite
  if (tier.videoSuite === 'none') {
    features.push('Basic Image Analysis');
  } else if (tier.videoSuite === 'basic') {
    features.push('Basic Video Processing Tools');
  } else {
    features.push('Full Video Processing Suite');
  }
  
  // Storage
  if (typeof tier.storageGB === 'number') {
    features.push(`${tier.storageGB}GB Media Storage`);
  } else {
    features.push(`${tier.storageGB} Media Storage`);
  }
  
  // Context Files
  if (typeof tier.contextFiles === 'number') {
    features.push(`Up to ${tier.contextFiles} Context File${tier.contextFiles > 1 ? 's' : ''}`);
  } else {
    features.push(`${tier.contextFiles} Context Files`);
  }
  
  // Analytics
  features.push(`${tier.analytics.charAt(0).toUpperCase() + tier.analytics.slice(1)} Analytics`);
  
  // Support
  const supportMap = {
    community: 'Community Support',
    email: 'Email Support',
    priority: 'Priority Support',
    dedicated: 'Dedicated Account Manager'
  };
  features.push(supportMap[tier.support as keyof typeof supportMap] || tier.support);
  
  // Seats for multi-user tiers
  if (typeof tier.seats === 'number' && tier.seats > 1) {
    features.push(`Up to ${tier.seats} Team Members`);
  } else if (tier.seats === 'unlimited') {
    features.push('Unlimited Team Members');
  }
  
  return features;
}

export default function PricingPage() {
  const hasByok = useByokDetection();
  const { user } = useAuth();
  const { createCheckoutSession, loading, error } = useStripeCheckout();
  const pricingTiers = TIERS.map(tier => convertTierToDisplay(tier, hasByok));

  const handleSubscribe = async (tier: any) => {
    if (!tier.isPaid) return;
    
    if (!user) {
      // Redirect to sign in page
      window.location.href = '/auth/signin?redirect=/pricing';
      return;
    }

    await createCheckoutSession({
      tier: tier.id,
      hasByok: tier.hasByokDiscount,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crowseye-dark via-crowseye-dark-light to-black text-white">
      <section className="py-20 pt-32 md:py-28 md:pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Flexible Pricing for <span className="gradient-text">Every Creator</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the perfect plan to power your social media strategy with Crow&apos;s Eye Marketing Suite.
              {hasByok && <span className="block mt-2 text-green-400">🎉 BYOK discount applied - Save 30%!</span>}
            </p>
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg max-w-md mx-auto">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-8 items-stretch">
            {pricingTiers.map((tier: any) => (
              <div 
                key={tier.name} 
                className={`pricing-card bg-black/30 backdrop-blur-sm rounded-xl shadow-2xl p-8 flex flex-col relative ${tier.mostPopular ? 'border-2 border-primary-500 shadow-primary-500/30' : 'border border-gray-700/50'}`}
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
                    {tier.monthly !== 0 && tier.name !== 'Enterprise' && (
                      <p className="mt-1 text-xs text-purple-300">
                        Save 30% when you bring your own OpenAI / Gemini key
                      </p>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {tier.isPaid ? (
                  <button
                    onClick={() => handleSubscribe(tier)}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 text-center ${
                      tier.mostPopular 
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover-glow' 
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Processing...' : tier.cta}
                  </button>
                ) : (
                  <Link 
                    href={tier.href!} 
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 text-center ${tier.mostPopular ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover-glow' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                  >
                    {tier.cta}
                  </Link>
                )}
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