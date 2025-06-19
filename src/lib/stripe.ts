import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Check for required environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

// Server-side Stripe instance
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
})

// Client-side publishable key
export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'

// Product price IDs for each plan
export const STRIPE_PRICE_IDS = {
  creator_monthly: process.env.STRIPE_CREATOR_MONTHLY_PRICE_ID || 'price_creator_monthly_placeholder',
  creator_yearly: process.env.STRIPE_CREATOR_YEARLY_PRICE_ID || 'price_creator_yearly_placeholder',
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly_placeholder',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly_placeholder',
} as const

export type PricingPlan = 'creator' | 'growth' | 'pro'
export type BillingInterval = 'monthly' | 'yearly'

export interface CheckoutSessionParams {
  priceId: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  userId?: string
}

export const createCheckoutSession = async (params: CheckoutSessionParams) => {
  // Check if we're using placeholder values
  if (stripeSecretKey === 'sk_test_placeholder') {
    console.warn('Stripe is not configured. Please add your Stripe keys to .env.local')
    throw new Error('Stripe is not properly configured. Please contact support.')
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      client_reference_id: params.userId,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId: params.userId || '',
        },
      },
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

export const createCustomerPortalSession = async (customerId: string, returnUrl: string) => {
  if (stripeSecretKey === 'sk_test_placeholder') {
    throw new Error('Stripe is not properly configured. Please contact support.')
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    throw new Error('Failed to create customer portal session')
  }
}

export const getSubscription = async (subscriptionId: string) => {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return null
  }
}

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    return await stripe.subscriptions.cancel(subscriptionId)
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}

// Client-side Stripe configuration for static sites
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Updated Stripe payment links - Current Active Links
export const STRIPE_PAYMENT_LINKS = {
  creator_monthly: 'https://buy.stripe.com/cNi6oH8ddcO722a5uXeIw07',
  creator_yearly: 'https://buy.stripe.com/7sYcN5799dSbbCK4qTeIw0a',
  growth_monthly: 'https://buy.stripe.com/cNicN59hh5lF6iq5uXeIw08', 
  growth_yearly: 'https://buy.stripe.com/bJe8wP9hhdSb22a9LdeIw0b',
  pro_monthly: 'https://buy.stripe.com/fZucN5gJJbK35emaPheIw09',
  pro_yearly: 'https://buy.stripe.com/eVq00j1OPaFZ5emf5xeIw0c',
}

export { stripePromise }

// SIMPLE USAGE-BASED PRICING WITH $5 MINIMUM BILLING THRESHOLD
// ============================================================
export const USAGE_PRICING_CONFIG = {
  // Usage meters and simple flat pricing
  meters: {
    ai_credits: {
      stripe_meter_id: 'mtr_ai_credits_placeholder', // Replace with your actual Stripe meter ID
      price_per_unit: 0.15, // $0.15 per AI credit
      display_name: 'AI Credits',
      unit: 'credit'
    },
    scheduled_posts: {
      stripe_meter_id: 'mtr_scheduled_posts_placeholder', // Replace with your actual Stripe meter ID
      price_per_unit: 0.25, // $0.25 per scheduled post
      display_name: 'Scheduled Posts',
      unit: 'post'
    },
    storage_gb: {
      stripe_meter_id: 'mtr_storage_gb_placeholder', // Replace with your actual Stripe meter ID
      price_per_unit: 2.99, // $2.99 per GB per month
      display_name: 'Storage',
      unit: 'GB'
    }
  },
  
  // $5 minimum billing threshold - customers aren't charged until they hit $5
  minimum_billing_threshold: 5.00,
  
  // Simple pricing display
  pricing_display: {
    ai_credits: '$0.15 per credit',
    scheduled_posts: '$0.25 per post',
    storage_gb: '$2.99 per GB/month'
  }
}

// Calculate usage cost with $5 minimum billing threshold
export const calculateUsageCost = (usage: {
  ai_credits: number
  scheduled_posts: number
  storage_gb: number
}): { total: number; will_be_charged: boolean; billable_amount: number; breakdown: any } => {
  const aiCreditsCost = usage.ai_credits * USAGE_PRICING_CONFIG.meters.ai_credits.price_per_unit
  const postsCost = usage.scheduled_posts * USAGE_PRICING_CONFIG.meters.scheduled_posts.price_per_unit
  const storageCost = usage.storage_gb * USAGE_PRICING_CONFIG.meters.storage_gb.price_per_unit
  
  const total = aiCreditsCost + postsCost + storageCost
  const threshold = USAGE_PRICING_CONFIG.minimum_billing_threshold
  
  // Customer is only charged if usage exceeds $5 threshold
  const will_be_charged = total >= threshold
  const billable_amount = will_be_charged ? total : 0
  
  return {
    total,
    will_be_charged,
    billable_amount,
    breakdown: {
      ai_credits: {
        usage: usage.ai_credits,
        rate: USAGE_PRICING_CONFIG.meters.ai_credits.price_per_unit,
        cost: aiCreditsCost
      },
      scheduled_posts: {
        usage: usage.scheduled_posts,
        rate: USAGE_PRICING_CONFIG.meters.scheduled_posts.price_per_unit,
        cost: postsCost
      },
      storage_gb: {
        usage: usage.storage_gb,
        rate: USAGE_PRICING_CONFIG.meters.storage_gb.price_per_unit,
        cost: storageCost
      }
    }
  }
}

// Create PAYG subscription with card required and $5 minimum threshold
export const createPAYGSubscription = async (params: {
  customerEmail: string
  userId: string
  successUrl: string
  cancelUrl: string
}) => {
  if (stripeSecretKey === 'sk_test_placeholder') {
    throw new Error('Stripe is not properly configured. Please contact support.')
  }

  try {
    // Create customer first
    const customer = await stripe.customers.create({
      email: params.customerEmail,
      metadata: {
        userId: params.userId,
        plan: 'payg',
        minimum_threshold: USAGE_PRICING_CONFIG.minimum_billing_threshold.toString()
      }
    })

    // Create checkout session to collect payment method
    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      payment_method_types: ['card'],
      customer: customer.id,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
        plan: 'payg'
      }
    })

    return { 
      sessionId: session.id,
      url: session.url,
      customerId: customer.id,
      message: 'Card required - no charges until you reach $5 in usage!'
    }
  } catch (error) {
    console.error('Error creating PAYG setup:', error)
    throw new Error('Failed to create pay-as-you-go account')
  }
}

// Report usage to Stripe meter (simplified)
export const reportUsageToStripe = async (params: {
  customerId: string
  meterType: keyof typeof USAGE_PRICING_CONFIG.meters
  value: number
  timestamp?: number
}) => {
  if (stripeSecretKey === 'sk_test_placeholder') {
    throw new Error('Stripe is not properly configured. Please contact support.')
  }

  try {
    const meterId = USAGE_PRICING_CONFIG.meters[params.meterType].stripe_meter_id
    
    await stripe.billing.meterEvents.create({
      event_name: params.meterType,
      payload: {
        stripe_customer_id: params.customerId,
        value: params.value.toString()
      },
      timestamp: params.timestamp || Math.floor(Date.now() / 1000)
    })
  } catch (error) {
    console.error('Error reporting usage to Stripe:', error)
    throw new Error('Failed to report usage')
  }
}

// Pricing configuration
export const PRICING_CONFIG = {
  payg: {
    type: 'usage-based',
    description: 'Pay-as-you-go with $5 minimum billing threshold',
    minimum_threshold: 5.00,
    rates: USAGE_PRICING_CONFIG.meters,
    pricing_display: USAGE_PRICING_CONFIG.pricing_display
  },
  creator: {
    monthly: {
      price: 15,
      priceId: 'STRIPE_CREATOR_PRICE_ID',
      paymentLink: 'https://buy.stripe.com/cNi6oH8ddcO722a5uXeIw07',
      trialDays: 7,
    },
    yearly: {
      price: 150,
      priceId: 'STRIPE_CREATOR_BYOK_PRICE_ID',
      paymentLink: 'https://buy.stripe.com/7sYcN5799dSbbCK4qTeIw0a',
      trialDays: 7,
    },
  },
  growth: {
    monthly: {
      price: 20,
      priceId: 'STRIPE_GROWTH_PRICE_ID',
      paymentLink: 'https://buy.stripe.com/cNicN59hh5lF6iq5uXeIw08',
      trialDays: 7,
    },
    yearly: {
      price: 200,
      priceId: 'STRIPE_GROWTH_BYOK_PRICE_ID',
      paymentLink: 'https://buy.stripe.com/bJe8wP9hhdSb22a9LdeIw0b',
      trialDays: 7,
    },
  },
  pro: {
    monthly: {
      price: 30,
      priceId: 'STRIPE_PRO_PRICE_ID',
      paymentLink: 'https://buy.stripe.com/fZucN5gJJbK35emaPheIw09',
      trialDays: 7,
    },
    yearly: {
      price: 300,
      priceId: 'STRIPE_PRO_BYOK_PRICE_ID',
      paymentLink: 'https://buy.stripe.com/eVq00j1OPaFZ5emf5xeIw0c',
      trialDays: 7,
    },
  },
} 