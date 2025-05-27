import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Dynamic import to avoid build-time issues
    const { getStripeProduct, createCheckoutSession } = await import('@/lib/stripe');
    
    const { tier, hasByok, userId, userEmail } = await request.json();

    console.log('Checkout request:', { tier, hasByok, userId, userEmail });

    if (!tier || !userId || !userEmail) {
      console.error('Missing required fields:', { tier, userId, userEmail });
      return NextResponse.json(
        { error: 'Tier, user ID, and email are required' },
        { status: 400 }
      );
    }

    // Get the appropriate Stripe product
    const product = getStripeProduct(tier, hasByok);
    if (!product) {
      console.error('Invalid tier specified:', tier);
      return NextResponse.json(
        { error: `Invalid tier specified: ${tier}` },
        { status: 400 }
      );
    }

    console.log('Using Stripe product:', product);

    // Create checkout session
    const session = await createCheckoutSession(
      product.priceId,
      userId,
      userEmail,
      hasByok,
      `${request.nextUrl.origin}/account?session_id={CHECKOUT_SESSION_ID}&success=true`,
      `${request.nextUrl.origin}/pricing?cancelled=true`
    );

    console.log('Checkout session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    // Ensure we always return JSON, even for errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 