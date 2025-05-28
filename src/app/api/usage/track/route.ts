import { NextRequest, NextResponse } from 'next/server';
import { trackFeatureUsage, type TrackableFeature } from '@/lib/usage-tracking';

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

    // Track the usage
    const result = await trackFeatureUsage(userId, feature as TrackableFeature, amount);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        usage: result.usage
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message,
          usage: result.usage 
        },
        { status: 429 } // Too Many Requests
      );
    }

  } catch (error) {
    console.error('❌ Error tracking usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      message: 'Usage tracking API',
      endpoints: {
        'POST /api/usage/track': 'Track feature usage',
        'GET /api/usage/check': 'Check if user can use a feature'
      }
    }
  );
} 