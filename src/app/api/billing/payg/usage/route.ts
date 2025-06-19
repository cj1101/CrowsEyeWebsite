import { NextRequest, NextResponse } from 'next/server'
import { calculateUsageCost, USAGE_PRICING_CONFIG } from '@/lib/stripe'

// Mock usage data - in production, this would come from your database
const mockUsageData = {
  ai_credits: 0,
  scheduled_posts: 0,
  storage_gb: 0,
  billing_period: {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
  }
}

export async function GET(request: NextRequest) {
  try {
    // In production, you'd fetch this from your database based on user ID
    // For now, we'll return mock data with proper cost calculations
    
    const usage = {
      ai_credits: mockUsageData.ai_credits,
      scheduled_posts: mockUsageData.scheduled_posts,
      storage_gb: mockUsageData.storage_gb
    }

    // Calculate costs with $5 minimum billing threshold
    const costAnalysis = calculateUsageCost(usage)
    
    const minimumThreshold = USAGE_PRICING_CONFIG.minimum_billing_threshold

    return NextResponse.json({
      success: true,
      data: {
        ...usage,
        total_cost: costAnalysis.total,
        will_be_charged: costAnalysis.will_be_charged,
        billable_amount: costAnalysis.billable_amount,
        billing_period: mockUsageData.billing_period,
        cost_breakdown: {
          ai_credits: costAnalysis.breakdown.ai_credits.cost,
          scheduled_posts: costAnalysis.breakdown.scheduled_posts.cost,
          storage_gb: costAnalysis.breakdown.storage_gb.cost
        },
        threshold_status: {
          minimum_threshold: minimumThreshold,
          current_usage: costAnalysis.total,
          reached_threshold: costAnalysis.will_be_charged,
          remaining_until_charged: Math.max(0, minimumThreshold - costAnalysis.total)
        },
        pricing_info: USAGE_PRICING_CONFIG.pricing_display
      }
    })

  } catch (error: any) {
    console.error('Usage tracking error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve usage data',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 