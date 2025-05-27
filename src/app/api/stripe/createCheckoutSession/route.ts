import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-04-30.basil',
    });

    const { priceId, userId, customApiKey } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Determine if user has BYOK (Bring Your Own Key)
    const hasByok = Boolean(customApiKey);

    // Set up discounts array
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (hasByok && process.env.STRIPE_BYOK_COUPON_ID) {
      discounts = [{ coupon: process.env.STRIPE_BYOK_COUPON_ID }]; // BYOK30
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId;
    if (userId) {
      // In a real app, you'd fetch the user's Stripe customer ID from your database
      // For now, we'll create a new customer or use a test customer ID
      const customer = await stripe.customers.create({
        metadata: {
          userId: userId,
          hasByok: hasByok.toString()
        }
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId || '',
        hasByok: hasByok.toString()
      }
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 