import { NextRequest, NextResponse } from 'next/server'
import { createPAYGSubscription } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerEmail, userId } = body

    // Validate required fields
    if (!customerEmail || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: customerEmail, userId' },
        { status: 400 }
      )
    }

    // Create PAYG subscription with Stripe
    const result = await createPAYGSubscription({
      customerEmail,
      userId,
      successUrl: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${request.nextUrl.origin}/pricing`
    })

    return NextResponse.json({
      success: true,
      checkout_url: result.url,
      session_id: result.sessionId,
      customer_id: result.customerId,
      subscription_id: result.subscriptionId,
      message: result.message
    })

  } catch (error: any) {
    console.error('PAYG subscription creation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create PAYG subscription',
        details: error.message 
      },
      { status: 500 }
    )
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