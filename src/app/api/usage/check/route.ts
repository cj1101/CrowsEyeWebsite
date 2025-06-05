import { NextRequest, NextResponse } from 'next/server'

interface UsageLimits {
  apiCalls: number
  reportGeneration: number
  dataExport: number
}

interface UsageStatus {
  tier: string
  limits: UsageLimits
  currentUsage: UsageLimits
  remainingUsage: UsageLimits
  percentageUsed: {
    apiCalls: number
    reportGeneration: number
    dataExport: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      )
    }

    // For demo purposes, we'll return sample usage data
    // In a real implementation, you would:
    // 1. Get the user's subscription tier from your database
    // 2. Get their current usage from your database
    // 3. Calculate remaining usage

    const mockUsageStatus: UsageStatus = {
      tier: 'pro', // This would come from your user database
      limits: {
        apiCalls: 200000,
        reportGeneration: 1000,
        dataExport: 200
      },
      currentUsage: {
        apiCalls: 15000,
        reportGeneration: 45,
        dataExport: 8
      },
      remainingUsage: {
        apiCalls: 185000,
        reportGeneration: 955,
        dataExport: 192
      },
      percentageUsed: {
        apiCalls: 7.5,
        reportGeneration: 4.5,
        dataExport: 4.0
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      usage: mockUsageStatus
    })

  } catch (error) {
    console.error('❌ Error checking usage:', error)
    return NextResponse.json(
      { error: 'Failed to check usage limits' },
      { status: 500 }
    )
  }
}

export function getUsageLimitsForTier(tier: string): UsageLimits {
  const limits = {
    spark: { apiCalls: 1000, reportGeneration: 5, dataExport: 1 },
    creator: { apiCalls: 10000, reportGeneration: 50, dataExport: 10 },
    growth: { apiCalls: 50000, reportGeneration: 200, dataExport: 50 },
    pro: { apiCalls: 200000, reportGeneration: 1000, dataExport: 200 },
    enterprise: { apiCalls: -1, reportGeneration: -1, dataExport: -1 } // Unlimited
  }
  
  return limits[tier as keyof typeof limits] || limits.spark
} 