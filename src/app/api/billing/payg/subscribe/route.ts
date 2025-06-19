/**
 * PAY-AS-YOU-GO SUBSCRIPTION API ROUTE
 * ===================================
 * 
 * Creates Stripe usage-based subscriptions for PAYG customers
 * Website-only endpoint for Crow's Eye web platform
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, plan_type } = await request.json()

    if (plan_type !== 'payg') {
      return NextResponse.json(
        { error: 'Invalid plan type for PAYG subscription' },
        { status: 400 }
      )
    }

    // TODO: Replace with your actual Stripe setup once meters are created
    // For now, return a mock checkout URL
    const mockCheckoutUrl = `https://checkout.stripe.com/c/pay/cs_test_payg_${Date.now()}#fidkdWxOYHwnPyd1blpxYHZxWjA0SFNSZ2hMQH5VYWxxN1VNVUNHdnZvS2BRaWhqSGRQZUdtT3IwXUF3QkdLdEdIV0lnSzdqSjZJQE5AaGhcclFSRGwzd3J1VEFiN2JqbWtxSGhLYkJNQnFvcT1SaXVjfGRqZndsZycpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl`

    return NextResponse.json({
      success: true,
      checkout_url: mockCheckoutUrl,
      subscription_type: 'payg',
      message: 'PAYG subscription initiated'
    })

  } catch (error) {
    console.error('PAYG subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create PAYG subscription' },
      { status: 500 }
    )
  }
} 