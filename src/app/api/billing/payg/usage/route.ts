import { NextRequest, NextResponse } from 'next/server'
import { calculateUsageCost } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Mock usage data for demonstration
    const mockUsage = {
      ai_credits: 25,
      scheduled_posts: 12,
      storage_gb: 2.5
    }

    const costCalculation = calculateUsageCost(mockUsage)

    return NextResponse.json({
      success: true,
      data: {
        ...mockUsage,
        total_cost: costCalculation.total,
        will_be_charged: costCalculation.will_be_charged,
        billable_amount: costCalculation.billable_amount,
        breakdown: costCalculation.breakdown
      }
    })

  } catch (error: any) {
    console.error('Usage API error:', error)
    
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