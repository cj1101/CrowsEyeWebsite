import { NextRequest, NextResponse } from 'next/server'
import { reportUsageToStripe, USAGE_PRICING_CONFIG } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_name, timestamp, stripe_customer_id, value = 1 } = body

    // Validate required fields
    if (!event_name || !stripe_customer_id) {
      return NextResponse.json(
        { error: 'Missing required fields: event_name, stripe_customer_id' },
        { status: 400 }
      )
    }

    // Map event names to meter types
    const meterTypeMap: Record<string, keyof typeof USAGE_PRICING_CONFIG.meters> = {
      'ai_credit_used': 'ai_credits',
      'post_scheduled': 'scheduled_posts',
      'storage_used': 'storage_gb'
    }

    const meterType = meterTypeMap[event_name]
    
    if (!meterType) {
      return NextResponse.json(
        { error: `Unknown event type: ${event_name}. Valid types: ${Object.keys(meterTypeMap).join(', ')}` },
        { status: 400 }
      )
    }

    // Report usage to Stripe
    await reportUsageToStripe({
      customerId: stripe_customer_id,
      meterType,
      value: Number(value),
      timestamp: timestamp || Math.floor(Date.now() / 1000)
    })

    // Log the usage event (in production, save to database)
    console.log(`Usage event tracked:`, {
      event_name,
      meter_type: meterType,
      customer_id: stripe_customer_id,
      value,
      timestamp: timestamp || Math.floor(Date.now() / 1000)
    })

    return NextResponse.json({
      success: true,
      message: `Usage event '${event_name}' tracked successfully`,
      meter_type: meterType,
      value: Number(value),
      rate: USAGE_PRICING_CONFIG.meters[meterType].price_per_unit,
      cost: Number(value) * USAGE_PRICING_CONFIG.meters[meterType].price_per_unit
    })

  } catch (error: any) {
    console.error('Usage event tracking error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to track usage event',
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