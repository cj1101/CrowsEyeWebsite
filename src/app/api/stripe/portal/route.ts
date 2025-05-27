import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Dynamic import to avoid build-time issues
    const { createCustomerPortalSession } = await import('@/lib/stripe');
    
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Create customer portal session
    const session = await createCustomerPortalSession(
      customerId,
      `${request.nextUrl.origin}/account`
    );

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
} 