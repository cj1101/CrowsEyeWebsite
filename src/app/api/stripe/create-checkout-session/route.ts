import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, STRIPE_PRICE_IDS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  console.log('Stripe checkout API called')
  
  try {
    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey || stripeSecretKey === 'sk_test_placeholder') {
      console.log('Stripe not configured - missing secret key')
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 400 }
      )
    }

    const { plan, interval, userId, userEmail } = await request.json()
    console.log('Received request:', { plan, interval, userId: userId ? 'provided' : 'missing' })

    if (!plan || !interval) {
      return NextResponse.json(
        { error: 'Plan and interval are required' },
        { status: 400 }
      )
    }

    // Get the appropriate price ID
    const priceKey = `${plan}_${interval}` as keyof typeof STRIPE_PRICE_IDS
    const priceId = STRIPE_PRICE_IDS[priceKey]

    console.log('Price lookup:', { priceKey, priceId })

    if (!priceId || priceId.includes('placeholder')) {
      return NextResponse.json(
        { error: 'Stripe is not fully configured. Please contact support.' },
        { status: 400 }
      )
    }

    // Create the checkout session
    const { sessionId, url } = await createCheckoutSession({
      priceId,
      successUrl: `${request.nextUrl.origin}/account/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${request.nextUrl.origin}/pricing?canceled=true`,
      customerEmail: userEmail,
      userId,
    })

    console.log('Checkout session created successfully')
    return NextResponse.json({ sessionId, url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    // Return a proper JSON error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    )
  }
} 