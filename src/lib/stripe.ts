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

export type PricingPlan = 'creator' | 'pro'
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

// Stripe payment links
export const STRIPE_PAYMENT_LINKS = {
  creator_monthly: 'https://buy.stripe.com/9B65kD655g0j6iqg9BeIw00',
  creator_yearly: 'https://buy.stripe.com/3cI5kDbpp15p5emcXpeIw03',
  growth_monthly: 'https://buy.stripe.com/6oU4gz511bK36iqf5xeIw01', 
  growth_yearly: 'https://buy.stripe.com/5kQ3cvfFF3dx22a8H9eIw04',
  pro_monthly: 'https://buy.stripe.com/bJe9ATeBB7tN6iqf5xeIw02',
  pro_yearly: 'https://buy.stripe.com/dRm00j2ST9BVeOW6z1eIw05',
}

export { stripePromise }

// Pricing configuration
export const PRICING_CONFIG = {
  creator: {
    monthly: {
      price: 19,
      priceId: 'STRIPE_CREATOR_PRICE_ID',
      paymentLink: STRIPE_PAYMENT_LINKS.creator_monthly,
    },
    yearly: {
      price: 190,
      priceId: 'STRIPE_CREATOR_BYOK_PRICE_ID', 
      paymentLink: STRIPE_PAYMENT_LINKS.creator_yearly,
    },
  },
  growth: {
    monthly: {
      price: 35, // Assuming Growth tier pricing
      priceId: 'STRIPE_GROWTH_PRICE_ID',
      paymentLink: STRIPE_PAYMENT_LINKS.growth_monthly,
    },
    yearly: {
      price: 350,
      priceId: 'STRIPE_GROWTH_BYOK_PRICE_ID',
      paymentLink: STRIPE_PAYMENT_LINKS.growth_yearly,
    },
  },
  pro: {
    monthly: {
      price: 49,
      priceId: 'STRIPE_PRO_PRICE_ID',
      paymentLink: STRIPE_PAYMENT_LINKS.pro_monthly,
    },
    yearly: {
      price: 490,
      priceId: 'STRIPE_PRO_BYOK_PRICE_ID',
      paymentLink: STRIPE_PAYMENT_LINKS.pro_yearly,
    },
  },
} 