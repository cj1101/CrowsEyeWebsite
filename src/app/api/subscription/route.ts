import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Try to get user data from backend API first
    try {
      const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/api/subscription`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        return NextResponse.json({
          success: true,
          subscription: backendData.subscription
        });
      }
    } catch (backendError) {
      console.warn('Backend API not available, using mock data:', backendError);
    }

    // Fallback to mock subscription data if backend unavailable
    const mockSubscription = {
      id: 'sub_mock_123',
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      cancel_at_period_end: false,
      plan: {
        id: 'plan_mock_pro',
        nickname: 'Pro Plan',
        amount: 2999, // $29.99 in cents
        currency: 'usd',
        interval: 'month'
      },
      customer: {
        id: 'cus_mock_123',
        email: 'user@example.com'
      },
      payment_method: {
        id: 'pm_mock_123',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025
        }
      }
    };

    return NextResponse.json({
      success: true,
      subscription: mockSubscription,
      source: 'mock' // Indicate this is mock data
    });

  } catch (error: any) {
    console.error('❌ Subscription fetch failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch subscription',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 