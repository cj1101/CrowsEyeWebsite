import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { UserService } from '@/lib/firestore';
import Stripe from 'stripe';
import { loadEnvVariables } from '@/lib/env-loader';

const getStripeClient = () => {
  const env = loadEnvVariables();
  let stripeSecretKey = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.warn('⚠️ STRIPE_SECRET_KEY not found – using placeholder for build time');
    stripeSecretKey = 'sk_test_placeholder';
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-05-28.basil',
  });
};

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    const user = await UserService.getUser(uid);
    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: 'User not found or no Stripe customer ID' }, { status: 404 });
    }

    const stripe = getStripeClient();
    const { return_url } = await request.json();

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: return_url || `${request.nextUrl.origin}/account/subscription`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({ error: error.message || 'Failed to create portal session' }, { status: 500 });
  }
}
