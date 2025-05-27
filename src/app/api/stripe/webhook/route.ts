import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe inside the function to avoid build-time issues
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-04-30.basil',
    });
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    // Dynamic imports to avoid build-time issues
    const { updateUserSubscription } = await import('@/lib/subscription');
    const { getSubscriptionTierFromPriceId } = await import('@/lib/stripe');
    
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;

      case 'customer.subscription.created':
        const createdSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(createdSubscription, updateUserSubscription, getSubscriptionTierFromPriceId);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(updatedSubscription, updateUserSubscription, getSubscriptionTierFromPriceId);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription, updateUserSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice, updateUserSubscription, getSubscriptionTierFromPriceId, stripe);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(failedInvoice, updateUserSubscription, stripe);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout completed:', session.id);
  
  const userId = session.metadata?.userId;
  
  if (!userId) {
    console.error('❌ No user ID in checkout session metadata');
    return;
  }

  // If this is a subscription checkout, the subscription will be handled by subscription.created
  if (session.mode === 'subscription' && session.subscription) {
    console.log('📝 Subscription checkout, will be handled by subscription.created event');
    return;
  }
}

async function handleSubscriptionCreated(
  subscription: Stripe.Subscription, 
  updateUserSubscription: any, 
  getSubscriptionTierFromPriceId: any
) {
  console.log('🆕 Subscription created:', subscription.id);
  await updateSubscriptionFromStripe(subscription, updateUserSubscription, getSubscriptionTierFromPriceId);
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription, 
  updateUserSubscription: any, 
  getSubscriptionTierFromPriceId: any
) {
  console.log('📝 Subscription updated:', subscription.id);
  await updateSubscriptionFromStripe(subscription, updateUserSubscription, getSubscriptionTierFromPriceId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, updateUserSubscription: any) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('❌ No user ID in subscription metadata');
    return;
  }

  // Get current period end from the first subscription item
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end 
    ? new Date(subscription.items.data[0].current_period_end * 1000) 
    : undefined;

  try {
    await updateUserSubscription(userId, {
      tier: 'spark',
      status: 'cancelled',
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });
    console.log('✅ User subscription cancelled in Firebase');
  } catch (error) {
    console.error('❌ Error updating cancelled subscription:', error);
  }
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice, 
  updateUserSubscription: any, 
  getSubscriptionTierFromPriceId: any,
  stripe: Stripe
) {
  console.log('💰 Payment succeeded:', invoice.id);
  
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId && typeof subscriptionId === 'string') {
    // Fetch the subscription to get updated info
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await updateSubscriptionFromStripe(subscription, updateUserSubscription, getSubscriptionTierFromPriceId);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, updateUserSubscription: any, stripe: Stripe) {
  console.log('💸 Payment failed:', invoice.id);
  
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;
    
    if (userId) {
      try {
        await updateUserSubscription(userId, {
          status: 'past_due',
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
        });
        console.log('✅ User subscription marked as past due');
      } catch (error) {
        console.error('❌ Error updating past due subscription:', error);
      }
    }
  }
}

async function updateSubscriptionFromStripe(
  subscription: Stripe.Subscription, 
  updateUserSubscription: any, 
  getSubscriptionTierFromPriceId: any
) {
  const userId = subscription.metadata?.userId;
  const hasByok = subscription.metadata?.hasByok === 'true';
  
  if (!userId) {
    console.error('❌ No user ID in subscription metadata');
    return;
  }

  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    console.error('❌ No price ID found in subscription');
    return;
  }

  // Determine the tier from the price ID
  const tier = getSubscriptionTierFromPriceId(priceId);
  if (!tier) {
    console.error('❌ Could not determine tier from price ID:', priceId);
    return;
  }

  // Map Stripe status to our status
  let status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  switch (subscription.status) {
    case 'active':
      status = 'active';
      break;
    case 'past_due':
      status = 'past_due';
      break;
    case 'canceled':
      status = 'cancelled';
      break;
    case 'trialing':
      status = 'trialing';
      break;
    default:
      status = 'inactive';
  }

  // Get current period end from the first subscription item
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end 
    ? new Date(subscription.items.data[0].current_period_end * 1000) 
    : undefined;

  try {
    await updateUserSubscription(userId, {
      tier,
      status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      hasByok,
    });
    console.log('✅ User subscription updated in Firebase');
  } catch (error) {
    console.error('❌ Error updating subscription in Firebase:', error);
  }
} 