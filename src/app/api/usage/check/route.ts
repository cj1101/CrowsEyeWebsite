import { NextRequest, NextResponse } from 'next/server';
import { canUseFeature, type TrackableFeature } from '@/lib/usage-tracking';

export async function POST(request: NextRequest) {
  try {
    const { userId, feature, amount = 1, apiKey } = await request.json();

    // Validate required fields
    if (!userId || !feature) {
      return NextResponse.json(
        { error: 'userId and feature are required' },
        { status: 400 }
      );
    }

    // Validate API key (you should implement proper API key validation)
    const validApiKey = process.env.USAGE_TRACKING_API_KEY;
    if (validApiKey && apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Validate feature type
    const validFeatures: TrackableFeature[] = [
      'ai_credits', 'ai_edits', 'social_sets', 'storage_gb', 
      'context_files', 'api_calls', 'post_creation', 'media_upload',
      'analytics_view', 'scheduling', 'video_processing'
    ];

    if (!validFeatures.includes(feature as TrackableFeature)) {
      return NextResponse.json(
        { error: `Invalid feature. Must be one of: ${validFeatures.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if user can use the feature
    const usage = await canUseFeature(userId, feature as TrackableFeature, amount);

    return NextResponse.json({
      canUse: usage.canUse,
      usage: {
        feature: usage.feature,
        used: usage.used,
        limit: usage.limit,
        percentage: usage.percentage,
        resetDate: usage.resetDate
      }
    });

  } catch (error) {
    console.error('❌ Error checking feature usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const feature = searchParams.get('feature');
  const amount = parseInt(searchParams.get('amount') || '1');
  const apiKey = searchParams.get('apiKey');

  if (!userId || !feature) {
    return NextResponse.json(
      { error: 'userId and feature are required as query parameters' },
      { status: 400 }
    );
  }

  // Validate API key
  const validApiKey = process.env.USAGE_TRACKING_API_KEY;
  if (validApiKey && apiKey !== validApiKey) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  try {
    const usage = await canUseFeature(userId, feature as TrackableFeature, amount);
    
    return NextResponse.json({
      canUse: usage.canUse,
      usage: {
        feature: usage.feature,
        used: usage.used,
        limit: usage.limit,
        percentage: usage.percentage,
        resetDate: usage.resetDate
      }
    });
  } catch (error) {
    console.error('❌ Error checking feature usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 