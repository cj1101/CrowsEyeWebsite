import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, we'll return mock data
    // In production, you would verify the user session and get real subscription data
    
    // Mock subscription data - replace with real logic
    const mockSubscription = {
      id: 'sub_mock123',
      status: 'active' as const,
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      cancel_at_period_end: false,
      plan: {
        id: 'price_mock',
        nickname: 'Creator Plan',
        amount: 1900, // $19.00 in cents
        currency: 'usd',
        interval: 'month',
      },
      customer: {
        id: 'cus_mock123',
        email: 'user@example.com',
      },
    }

    // Return mock data for now
    return NextResponse.json({ subscription: mockSubscription })

    // TODO: Implement real subscription fetching when user authentication is set up
    // This code is commented out until we have proper user session handling
    /*
    try {
      // Get user email from session/auth
      const userEmail = 'user@example.com' // This should come from authenticated session
      
      // Search for customer by email
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      })

      if (customers.data.length === 0) {
        return NextResponse.json({ subscription: null })
      }

      const customer = customers.data[0]

      // Get the customer's subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 1,
      })

      if (subscriptions.data.length === 0) {
        return NextResponse.json({ subscription: null })
      }

      const subscription = subscriptions.data[0]
      const price = subscription.items.data[0]?.price

      const subscriptionData = {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        plan: {
          id: price?.id || '',
          nickname: price?.nickname || 'Unknown Plan',
          amount: price?.unit_amount || 0,
          currency: price?.currency || 'usd',
          interval: price?.recurring?.interval || 'month',
        },
        customer: {
          id: customer.id,
          email: customer.email || userEmail,
        },
      }

      return NextResponse.json({ subscription: subscriptionData })
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
    }
    */
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 