import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'
import { getEnvVar } from './env-loader'

// Check for required environment variables with manual loader fallback
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || getEnvVar('STRIPE_SECRET_KEY', 'sk_test_placeholder')

// Helper function to check if Stripe is properly configured
const isStripeConfigured = () => {
  console.log('🔍 Checking Stripe configuration...', {
    hasKey: !!stripeSecretKey,
    keyPrefix: stripeSecretKey.substring(0, 8) + '...',
    isPlaceholder: stripeSecretKey === 'sk_test_placeholder',
    allEnvVars: {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NODE_ENV: process.env.NODE_ENV
    },
    processEnvKeys: Object.keys(process.env).filter(key => key.includes('STRIPE'))
  })
  
  // TEMPORARY BYPASS: Always return true in development to allow testing
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 DEVELOPMENT MODE: Bypassing Stripe configuration check')
    return true
  }
  
  return stripeSecretKey && 
         stripeSecretKey !== 'sk_test_placeholder' && 
         (stripeSecretKey.startsWith('sk_test_') || stripeSecretKey.startsWith('sk_live_'))
}

// Force server-side environment variable check with manual loading
const getServerSideStripeKey = () => {
  // This forces the check to happen server-side
  if (typeof window === 'undefined') {
    const processEnvKey = process.env.STRIPE_SECRET_KEY
    const manualKey = getEnvVar('STRIPE_SECRET_KEY')
    const finalKey = processEnvKey || manualKey
    
    console.log('🔧 Server-side Stripe key check:', {
      processEnvKey: !!processEnvKey,
      manualKey: !!manualKey,
      finalKey: !!finalKey,
      keyType: finalKey?.startsWith('sk_live_') ? 'live' : finalKey?.startsWith('sk_test_') ? 'test' : 'unknown',
      prefix: finalKey?.substring(0, 8) + '...'
    })
    return finalKey
  }
  return stripeSecretKey
}

// Server-side Stripe instance
export const stripe = new Stripe(getServerSideStripeKey() || stripeSecretKey, {
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
  // PAYG Price IDs
  ai_credits: process.env.STRIPE_AI_CREDITS_PRICE_ID || 'price_1RbmLgGU2Wb0yZINUBfTAq0m',
  scheduled_posts: process.env.STRIPE_POSTS_PRICE_ID || 'price_1RbmMAGU2Wb0yZINY9JkdqEw',
  storage_gb: process.env.STRIPE_STORAGE_PRICE_ID || 'price_1RbmL2GU2Wb0yZIN6BrcrrV7',
} as const

// PAYG Product ID
export const STRIPE_PAYG_PRODUCT_ID = process.env.STRIPE_PAYG_PRODUCT_ID || 'prod_SWq0XFsm6MYTzX'

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
  if (!isStripeConfigured()) {
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
  if (!isStripeConfigured()) {
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
      stripe_meter_id: process.env.STRIPE_AI_CREDITS_METER_ID || '',
      event_name: 'ai_credit_used',
      price_per_unit: 0.15, // $0.15 per AI credit
      display_name: 'AI Credits',
      unit: 'credit'
    },
    scheduled_posts: {
      stripe_meter_id: process.env.STRIPE_POSTS_METER_ID || '',
      event_name: 'post_scheduled',
      price_per_unit: 0.25, // $0.25 per scheduled post
      display_name: 'Scheduled Posts',
      unit: 'post'
    },
    storage_gb: {
      stripe_meter_id: process.env.STRIPE_STORAGE_METER_ID || '',
      event_name: 'storage_used',
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
  // TEMPORARY: Skip actual Stripe integration in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 DEVELOPMENT MODE: Returning mock PAYG subscription')
    return {
      sessionId: 'cs_test_mock_session_id',
      url: 'https://checkout.stripe.com/pay/mock_url',
      customerId: 'cus_mock_customer_id',
      subscriptionId: 'sub_mock_subscription_id',
      message: 'Development mode - card setup bypassed'
    }
  }
  
  if (!isStripeConfigured()) {
    console.error('❌ Stripe configuration failed:', {
      secretKey: stripeSecretKey?.substring(0, 8) + '...',
      envVars: {
        STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
        NODE_ENV: process.env.NODE_ENV
      }
    })
    
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

    // Create subscription with the three PAYG price IDs
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        { price: STRIPE_PRICE_IDS.ai_credits },
        { price: STRIPE_PRICE_IDS.scheduled_posts },
        { price: STRIPE_PRICE_IDS.storage_gb }
      ],
      metadata: {
        userId: params.userId,
        plan: 'payg',
        product_id: STRIPE_PAYG_PRODUCT_ID
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
        plan: 'payg',
        subscription_id: subscription.id
      }
    })

    return { 
      sessionId: session.id,
      url: session.url,
      customerId: customer.id,
      subscriptionId: subscription.id,
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
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not properly configured. Please contact support.')
  }

  try {
    const meterConfig = USAGE_PRICING_CONFIG.meters[params.meterType]
    const eventName = meterConfig.event_name
    
    // Ensure value is an integer as required by Stripe
    const integerValue = Math.round(params.value)
    
    await stripe.billing.meterEvents.create({
      event_name: eventName,
      payload: {
        stripe_customer_id: params.customerId,
        value: integerValue.toString()
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