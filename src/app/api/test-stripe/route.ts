import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_CREATOR_PRICE_ID: process.env.STRIPE_CREATOR_PRICE_ID || 'Not set',
      STRIPE_CREATOR_BYOK_PRICE_ID: process.env.STRIPE_CREATOR_BYOK_PRICE_ID || 'Not set',
      STRIPE_GROWTH_PRICE_ID: process.env.STRIPE_GROWTH_PRICE_ID || 'Not set',
      STRIPE_GROWTH_BYOK_PRICE_ID: process.env.STRIPE_GROWTH_BYOK_PRICE_ID || 'Not set',
      STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID || 'Not set',
      STRIPE_PRO_BYOK_PRICE_ID: process.env.STRIPE_PRO_BYOK_PRICE_ID || 'Not set',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    };

    // Test Stripe library import
    let stripeTest = null;
    try {
      const { getStripeProduct } = await import('@/lib/stripe');
      
      // Test getting products
      const creatorProduct = getStripeProduct('creator', false);
      const creatorByokProduct = getStripeProduct('creator', true);
      
      stripeTest = {
        libraryImport: 'Success',
        creatorProduct,
        creatorByokProduct,
      };
    } catch (error) {
      stripeTest = {
        libraryImport: 'Failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envCheck,
      stripeTest,
    });
  } catch (error) {
    console.error('Stripe test error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 