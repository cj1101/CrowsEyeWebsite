/**
 * PAYG USAGE RETRIEVAL API ROUTE
 * ==============================
 * 
 * Gets current month usage data for PAYG customers
 * Website-only endpoint for Crow's Eye web platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe, USAGE_PRICING_CONFIG } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { customerId, meterType, value, userId } = await request.json()

    if (!customerId || !meterType || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, meterType, value' }, 
        { status: 400 }
      )
    }

    // Validate meter type
    if (!(meterType in USAGE_PRICING_CONFIG.meters)) {
      return NextResponse.json(
        { error: `Invalid meter type: ${meterType}. Valid types: ${Object.keys(USAGE_PRICING_CONFIG.meters).join(', ')}` }, 
        { status: 400 }
      )
    }

    // Report usage to Stripe meter
    await stripe.billing.meterEvents.create({
      event_name: meterType,
      payload: {
        stripe_customer_id: customerId,
        value: value.toString()
      },
      timestamp: Math.floor(Date.now() / 1000)
    })

    // Calculate current usage cost for response
    const meterConfig = USAGE_PRICING_CONFIG.meters[meterType as keyof typeof USAGE_PRICING_CONFIG.meters]
    const cost = value * meterConfig.price_per_unit

    return NextResponse.json({ 
      success: true,
      meterType,
      value,
      unitCost: meterConfig.price_per_unit,
      totalCost: cost,
      message: `Tracked ${value} ${meterConfig.unit}(s) for ${meterConfig.display_name}`
    })
  } catch (error) {
    console.error('Usage reporting error:', error)
    return NextResponse.json(
      { error: 'Failed to report usage', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const customerId = url.searchParams.get('customerId')
    const userId = url.searchParams.get('userId')

    if (!customerId && !userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: customerId or userId' }, 
        { status: 400 }
      )
    }

    // For now, return a basic usage structure
    // In a real implementation, you'd query your database for stored usage data
    const currentMonth = new Date()
    const usage = {
      ai_credits: 0,
      scheduled_posts: 0,
      storage_gb: 0,
      billing_period: {
        start: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString(),
        end: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString()
      },
      estimated_cost: 0,
      minimum_threshold: USAGE_PRICING_CONFIG.minimum_billing_threshold,
      will_be_charged: false
    }

    return NextResponse.json(usage)
  } catch (error) {
    console.error('Usage retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to get usage', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
} 