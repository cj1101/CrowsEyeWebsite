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

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ subscription: null });
    }

    const stripe = getStripeClient();
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ subscription: null });
    }

    const subscription = subscriptions.data[0];

    const subscriptionData = {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        plan: {
          id: subscription.items.data[0].price.id,
          nickname: subscription.items.data[0].price.nickname,
          amount: subscription.items.data[0].price.unit_amount,
          currency: subscription.items.data[0].price.currency,
          interval: subscription.items.data[0].price.recurring?.interval,
        },
        customer: {
          id: subscription.customer,
          email: user.email,
        },
      };

    return NextResponse.json({ success: true, data: subscriptionData });
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch subscription status' }, { status: 500 });
  }
}
