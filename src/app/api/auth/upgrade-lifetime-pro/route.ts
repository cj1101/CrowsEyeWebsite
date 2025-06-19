import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { user_id, promo_code, immediate_activation } = await request.json();
    
    // Validate the lifetime tester code
    const lifetimeCode = 'TESTER_CROW_2024_LIFETIME_$7d91f3a8';
    if (promo_code !== lifetimeCode) {
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful response
      return {
        success: true,
        data: {
          user_id,
          subscription_tier: 'pro',
          subscription_status: 'active',
          subscription_type: 'lifetime',
          upgraded_at: new Date().toISOString(),
          promo_code_used: promo_code,
          features: {
            linked_accounts: 10,
            ai_credits: 999999,
            scheduled_posts: -1, // unlimited
            media_storage_gb: 50,
            team_collaboration: true,
            custom_branding: true,
            api_access: true,
            priority_support: true
          }
        }
      };
    };

    const result = await mockApiCall();
    
    console.log('✅ Lifetime Pro upgrade successful:', {
      user_id,
      promo_code,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Lifetime Pro access activated successfully',
      data: result.data
    });

  } catch (error: any) {
    console.error('❌ Lifetime Pro upgrade failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to activate lifetime access',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 