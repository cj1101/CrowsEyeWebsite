import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, returnUrl } = body

    // For demo purposes, we'll create a portal session
    // In production, you would verify the user and get their actual customer ID
    
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${request.nextUrl.origin}/account/subscription`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}

// For demo/testing purposes - create a direct portal link
export async function GET(request: NextRequest) {
  try {
    // This is just for demo - return the Stripe customer portal URL format
    // In production, you'd need to create actual sessions
    const demoPortalUrl = 'https://billing.stripe.com/p/login/test_demo'
    
    return NextResponse.json({ 
      url: demoPortalUrl,
      message: 'Demo portal URL - replace with actual Stripe customer portal in production'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to get portal URL' }, { status: 500 })
  }
} 