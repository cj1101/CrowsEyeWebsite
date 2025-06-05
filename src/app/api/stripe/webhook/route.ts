import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  // Check if webhook secret is configured
  if (!endpointSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    console.error('❌ No stripe signature header found')
    return NextResponse.json({ error: 'No stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`❌ Webhook signature verification failed: ${errorMessage}`)
    console.error('Body length:', body.length)
    console.error('Signature:', sig.substring(0, 20) + '...')
    return NextResponse.json({ error: `Webhook signature verification failed: ${errorMessage}` }, { status: 400 })
  }

  console.log(`🎯 Received webhook event: ${event.type}`)

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      
      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break
      
      default:
        console.log(`🤷 Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`❌ Error processing webhook: ${error}`)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🎉 Subscription created:', subscription.id)
  
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (!customer.email) {
    console.error('❌ Customer email not found')
    return
  }

  // For now, just log the subscription creation
  // You can integrate with your user management system here
  console.log(`✅ Subscription created for ${customer.email}: ${subscription.id}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id)
  
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (!customer.email) return

  console.log(`✅ Subscription updated for ${customer.email}: ${subscription.status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id)
  
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (!customer.email) return
  
  console.log(`✅ Subscription cancelled for ${customer.email}`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Invoice payment succeeded:', invoice.id)
  
  const customerId = invoice.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (!customer.email) return

  console.log(`✅ Payment successful for ${customer.email}: $${invoice.amount_paid / 100}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('💸 Invoice payment failed:', invoice.id)
  
  const customerId = invoice.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (!customer.email) return
  
  console.log(`❌ Payment failed for ${customer.email}`)
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('👤 Customer created:', customer.id)
  
  if (!customer.email) return
  
  console.log(`✅ Customer created: ${customer.email}`)
} 