import Stripe from 'stripe'

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