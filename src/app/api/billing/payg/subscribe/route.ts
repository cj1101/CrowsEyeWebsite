import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { loadEnvVariables } from '@/lib/env-loader'

// Load environment variables
const env = loadEnvVariables()
const stripeSecretKey = env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not configured')
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-04-30.basil',
})

// Your actual Stripe product IDs from the configuration
const STRIPE_PAYG_PRODUCT_ID = 'prod_SWq0XFsm6MYTzX'
const STRIPE_AI_CREDITS_PRICE_ID = 'price_1RbmLgGU2Wb0yZINUBfTAq0m'
const STRIPE_POSTS_PRICE_ID = 'price_1RbmMAGU2Wb0yZINY9JkdqEw'
const STRIPE_STORAGE_PRICE_ID = 'price_1RbmL2GU2Wb0yZIN6BrcrrV7'

export async function POST(request: NextRequest) {
  try {
    const { customerEmail, userId, successUrl, cancelUrl } = await request.json()

    console.log('🚀 Creating PAYG subscription for:', {
      customerEmail,
      userId,
      successUrl,
      cancelUrl
    })

    // Step 1: Create or retrieve customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      console.log('✅ Found existing customer:', customer.id)
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          userId: userId,
          plan: 'payg',
          minimum_threshold: '5.00'
        }
      })
      console.log('✅ Created new customer:', customer.id)
    }

    // Step 2: Create Stripe Checkout Session for PAYG
    // Using 'setup' mode to collect payment method without immediate charge
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'setup',
      payment_method_types: ['card'],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&customer_id=${customer.id}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        plan: 'payg',
        customer_id: customer.id,
        product_id: STRIPE_PAYG_PRODUCT_ID
      },
      // Custom configuration for PAYG
      setup_intent_data: {
        metadata: {
          userId: userId,
          plan: 'payg',
          customer_id: customer.id
        }
      }
    })

    console.log('✅ Created Stripe checkout session:', session.id)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      customerId: customer.id,
      message: 'Add your payment method to start using pay-as-you-go billing. No charges until you reach $5 in usage!'
    })

  } catch (error: any) {
    console.error('❌ PAYG subscription creation failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create PAYG subscription'
    }, { status: 500 })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 