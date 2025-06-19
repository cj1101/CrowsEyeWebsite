/**
 * PAYG LOCAL USAGE TRACKING API ROUTE
 * ==================================
 * 
 * Updates local database with usage for faster dashboard display
 * Website-only endpoint for Crow's Eye web platform
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { type, amount, replace, timestamp } = await request.json()

    // Validate required fields
    if (!type || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount' },
        { status: 400 }
      )
    }

    // Validate usage types
    const validTypes = ['ai_credits', 'scheduled_posts', 'storage_gb']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid usage type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // TODO: Update actual database record
    // For now, log the local usage update
    console.log('💾 Local Usage Update:', {
      type,
      amount,
      replace: replace || false,
      timestamp: timestamp || new Date().toISOString(),
      action: replace ? 'SET' : 'INCREMENT'
    })

    // Mock database response
    const mockUsageRecord = {
      id: `usage_${Date.now()}`,
      user_id: 'user_mock_123',
      usage_type: type,
      amount,
      operation: replace ? 'set' : 'increment',
      timestamp: timestamp || new Date().toISOString(),
      billing_period: new Date().toISOString().substring(0, 7) // YYYY-MM format
    }

    return NextResponse.json({
      success: true,
      data: mockUsageRecord,
      message: 'Local usage updated successfully'
    })

  } catch (error) {
    console.error('Local usage tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to update local usage' },
      { status: 500 }
    )
  }
} 