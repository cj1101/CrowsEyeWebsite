import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { user_id, promo_code } = await request.json();
    
    // Validate promotional codes
    const validCodes = ['FOUNDER', 'BETA', 'INFLUENCER', 'PARTNER', 'LAUNCH'];
    if (!validCodes.includes(promo_code?.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid promotional code' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // For now, simulate a successful upgrade
    // TODO: Replace with actual backend API call when ready
    const mockApiCall = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate successful response
      return {
        success: true,
        data: {
          user_id,
          subscription_tier: 'creator',
          subscription_status: 'active',
          subscription_type: 'promotional',
          upgraded_at: new Date().toISOString(),
          promo_code_used: promo_code.toUpperCase(),
          features: {
            linked_accounts: 3,
            ai_credits: 150,
            scheduled_posts: 100,
            media_storage_gb: 5,
            smart_gallery: true,
            basic_analytics: true,
            email_support: true
          }
        }
      };
    };

    const result = await mockApiCall();
    
    console.log('✅ Creator plan upgrade successful:', {
      user_id,
      promo_code: promo_code.toUpperCase(),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Creator plan activated successfully',
      data: result.data
    });

  } catch (error: any) {
    console.error('❌ Creator plan upgrade failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to activate Creator plan',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 