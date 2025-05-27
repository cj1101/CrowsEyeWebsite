import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

// Stripe Product IDs - these should match your Stripe dashboard
export const STRIPE_PRODUCTS = {
  creator: {
    priceId: process.env.STRIPE_CREATOR_PRICE_ID!,
    priceIdByok: process.env.STRIPE_CREATOR_BYOK_PRICE_ID!,
    name: 'Creator',
    amount: 1900, // $19.00 in cents
    amountByok: 1330, // $13.30 in cents (30% discount)
  },
  growth: {
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
    priceIdByok: process.env.STRIPE_GROWTH_BYOK_PRICE_ID!,
    name: 'Growth',
    amount: 4900, // $49.00 in cents
    amountByok: 3430, // $34.30 in cents (30% discount)
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    priceIdByok: process.env.STRIPE_PRO_BYOK_PRICE_ID!,
    name: 'Pro Agency',
    amount: 8900, // $89.00 in cents
    amountByok: 6230, // $62.30 in cents (30% discount)
  },
} as const;

export type SubscriptionTier = keyof typeof STRIPE_PRODUCTS;

export interface SubscriptionStatus {
  tier: SubscriptionTier | 'spark' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  hasByok?: boolean;
}

export const getStripeProduct = (tier: string, hasByok: boolean = false) => {
  const product = STRIPE_PRODUCTS[tier as SubscriptionTier];
  if (!product) return null;
  
  return {
    ...product,
    priceId: hasByok ? product.priceIdByok : product.priceId,
    amount: hasByok ? product.amountByok : product.amount,
  };
};

export const createCheckoutSession = async (
  priceId: string,
  userId: string,
  userEmail: string,
  hasByok: boolean = false,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> => {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: userEmail,
    metadata: {
      userId,
      hasByok: hasByok.toString(),
    },
    subscription_data: {
      metadata: {
        userId,
        hasByok: hasByok.toString(),
      },
    },
    allow_promotion_codes: true,
  };

  return await stripe.checkout.sessions.create(sessionParams);
};

export const getCustomerSubscriptions = async (customerId: string): Promise<Stripe.Subscription[]> => {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 10,
  });
  
  return subscriptions.data;
};

export const cancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Stripe.Subscription> => {
  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return await stripe.subscriptions.cancel(subscriptionId);
  }
};

export const reactivateSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
};

export const createCustomerPortalSession = async (
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> => {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
};

export const getSubscriptionTierFromPriceId = (priceId: string): SubscriptionTier | null => {
  for (const [tier, product] of Object.entries(STRIPE_PRODUCTS)) {
    if (product.priceId === priceId || product.priceIdByok === priceId) {
      return tier as SubscriptionTier;
    }
  }
  return null;
};

export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
};

export default stripe; 