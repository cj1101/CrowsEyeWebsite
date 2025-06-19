/**
 * PAY-AS-YOU-GO SUBSCRIPTION API ROUTE
 * ===================================
 * 
 * Creates Stripe usage-based subscriptions for PAYG customers
 * Website-only endpoint for Crow's Eye web platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_IDS, STRIPE_PAYG_PRODUCT_ID } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userId } = await request.json()

    if (!userEmail || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: userEmail and userId' }, 
        { status: 400 }
      )
    }

    // Create customer first
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        userId: userId,
        plan: 'payg',
        minimum_threshold: '5.00'
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
        userId: userId,
        plan: 'payg',
        product_id: STRIPE_PAYG_PRODUCT_ID
      }
    })

    // Create setup session to collect payment method
    const setupSession = await stripe.checkout.sessions.create({
      mode: 'setup',
      payment_method_types: ['card'],
      customer: customer.id,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://crows-eye-website.web.app'}/success?plan=payg&customer_id=${customer.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://crows-eye-website.web.app'}/pricing`,
      metadata: {
        userId: userId,
        plan: 'payg',
        subscription_id: subscription.id
      }
    })

    return NextResponse.json({ 
      success: true,
      sessionId: setupSession.id,
      url: setupSession.url,
      customerId: customer.id,
      subscriptionId: subscription.id,
      message: 'Card required - no charges until you reach $5 in usage!'
    })
  } catch (error) {
    console.error('PAYG subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create PAYG subscription', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
} 