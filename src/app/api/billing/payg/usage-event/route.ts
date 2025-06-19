/**
 * PAYG USAGE EVENT REPORTING API ROUTE
 * ===================================
 * 
 * Reports usage events to Stripe for billing
 * Website-only endpoint for Crow's Eye web platform
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { event_name, timestamp, stripe_customer_id, value } = await request.json()

    // Validate required fields
    if (!event_name || !timestamp || !stripe_customer_id) {
      return NextResponse.json(
        { error: 'Missing required fields: event_name, timestamp, stripe_customer_id' },
        { status: 400 }
      )
    }

    // Validate event types
    const validEvents = ['ai_credit_used', 'post_scheduled', 'storage_used']
    if (!validEvents.includes(event_name)) {
      return NextResponse.json(
        { error: `Invalid event type. Must be one of: ${validEvents.join(', ')}` },
        { status: 400 }
      )
    }

    // TODO: Implement actual Stripe Usage API call
    // For now, log the usage event
    console.log('📊 PAYG Usage Event:', {
      event_name,
      timestamp: new Date(timestamp * 1000).toISOString(),
      stripe_customer_id,
      value: value || 1
    })

    // Mock Stripe API response
    const mockStripeResponse = {
      id: `evt_${Date.now()}`,
      object: 'usage_record',
      quantity: value || 1,
      subscription_item: 'si_mock_item',
      timestamp
    }

    return NextResponse.json({
      success: true,
      stripe_response: mockStripeResponse,
      message: 'Usage event recorded successfully'
    })

  } catch (error) {
    console.error('Usage event reporting error:', error)
    return NextResponse.json(
      { error: 'Failed to report usage event' },
      { status: 500 }
    )
  }
} 