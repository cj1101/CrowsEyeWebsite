import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, STRIPE_PRICE_IDS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { plan, interval, userId, userEmail } = await request.json()

    if (!plan || !interval) {
      return NextResponse.json(
        { error: 'Plan and interval are required' },
        { status: 400 }
      )
    }

    // Get the appropriate price ID
    const priceKey = `${plan}_${interval}` as keyof typeof STRIPE_PRICE_IDS
    const priceId = STRIPE_PRICE_IDS[priceKey]

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or interval' },
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

    return NextResponse.json({ sessionId, url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 