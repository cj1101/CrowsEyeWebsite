import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Dynamic import to avoid build-time issues
    const { getStripeProduct, createCheckoutSession } = await import('@/lib/stripe');
    
    const { tier, hasByok, userId, userEmail } = await request.json();

    if (!tier || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Tier, user ID, and email are required' },
        { status: 400 }
      );
    }

    // Get the appropriate Stripe product
    const product = getStripeProduct(tier, hasByok);
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await createCheckoutSession(
      product.priceId,
      userId,
      userEmail,
      hasByok,
      `${request.nextUrl.origin}/account?session_id={CHECKOUT_SESSION_ID}&success=true`,
      `${request.nextUrl.origin}/pricing?cancelled=true`
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 