/**
 * PAYG USAGE RETRIEVAL API ROUTE
 * ==============================
 * 
 * Gets current month usage data for PAYG customers
 * Website-only endpoint for Crow's Eye web platform
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // TODO: Replace with actual database query for user's usage
    // For now, return mock usage data
    const mockUsageData = {
      ai_credits: Math.floor(Math.random() * 25), // 0-25 credits used
      scheduled_posts: Math.floor(Math.random() * 10), // 0-10 posts scheduled
      storage_gb: parseFloat((Math.random() * 2).toFixed(2)), // 0-2 GB used
      current_month_cost: 0, // Will be calculated
      billing_period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      }
    }

    // Calculate current month cost
    const aiCreditsCost = mockUsageData.ai_credits * 0.15
    const postsCost = mockUsageData.scheduled_posts * 0.25
    const storageCost = mockUsageData.storage_gb * 2.99
    const subtotal = aiCreditsCost + postsCost + storageCost
    
    // Apply minimum charge of $5
    mockUsageData.current_month_cost = Math.max(subtotal, 5.00)

    return NextResponse.json({
      success: true,
      data: mockUsageData,
      message: 'Usage data retrieved successfully'
    })

  } catch (error) {
    console.error('Usage retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve usage data' },
      { status: 500 }
    )
  }
} 