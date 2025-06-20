import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { authenticateToken } from '../middleware/auth'
import { env } from '../config/environment'
import { logger } from '../config/logger'

const router = Router()
const prisma = new PrismaClient()

if (!env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured – billing routes disabled')
}

// Initialise Stripe only if key exists
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
}) : (null as unknown as Stripe)

/**
 * POST /billing/create-portal-session
 * Creates a Stripe Billing Portal session so the user can manage their subscription and payment methods.
 * Assumes the authenticated request includes JWT and that the User model stores `stripeCustomerId`.
 */
router.post('/create-portal-session', authenticateToken as any, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Billing system not configured' })
  }

  try {
    const userId = (req as any).user.id as string

    // Retrieve user to get Stripe customer Id
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'Stripe customer not found for this user' })
    }

    const returnUrl = env.CORS_ORIGINS.split(',')[0] || 'https://crowseye.netlify.app'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${returnUrl}/account`,
    })

    res.json({ url: portalSession.url })
  } catch (error) {
    console.error('❌ Failed to create Stripe portal session:', error)
    res.status(500).json({ error: 'Failed to create customer portal session.' })
  }
})

/**
 * POST /billing/update-payg-customer
 * Updates user's Stripe customer ID after PAYG setup completion
 */
router.post('/update-payg-customer', authenticateToken as any, async (req, res) => {
  try {
    const userId = (req as any).user.id as string
    const { stripeCustomerId, subscriptionId } = req.body

    if (!stripeCustomerId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Stripe customer ID is required' 
      })
    }

    // Update user with Stripe customer information
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId,
        subscriptionStatus: 'active',
        plan: 'PAYG'
      }
    })

    logger.info(`Updated PAYG customer for user ${userId}: ${stripeCustomerId}`)

    res.json({
      success: true,
      data: {
        stripeCustomerId: updatedUser.stripeCustomerId,
        subscriptionStatus: updatedUser.subscriptionStatus,
        plan: updatedUser.plan
      }
    })

  } catch (error) {
    logger.error('❌ Failed to update PAYG customer:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update customer information' 
    })
  }
})

/**
 * GET /billing/subscription-status
 * Get current user's subscription status and billing information
 */
router.get('/subscription-status', authenticateToken as any, async (req, res) => {
  try {
    const userId = (req as any).user.id as string

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        email: true,
        plan: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        subscriptionExpires: true
      }
    })

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      })
    }

    // If user has Stripe customer ID, get additional billing info
    let billingInfo = null
    if (user.stripeCustomerId && stripe) {
      try {
        const customer = await stripe.customers.retrieve(user.stripeCustomerId)
        const subscriptions = await stripe.subscriptions.list({ 
          customer: user.stripeCustomerId,
          status: 'active'
        })

        billingInfo = {
          customerId: user.stripeCustomerId,
          hasPaymentMethod: customer.default_source !== null || 
                           (customer as any).invoice_settings?.default_payment_method !== null,
          activeSubscriptions: subscriptions.data.length
        }
      } catch (error) {
        logger.warn(`Failed to fetch Stripe info for customer ${user.stripeCustomerId}:`, error)
      }
    }

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        plan: user.plan.toLowerCase(),
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpires: user.subscriptionExpires,
        stripeCustomerId: user.stripeCustomerId,
        billing: billingInfo
      }
    })

  } catch (error) {
    logger.error('❌ Failed to get subscription status:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get subscription status' 
    })
  }
})

/**
 * POST /billing/sync-subscription
 * Sync user's subscription data with Stripe to fix any data mismatches
 */
router.post('/sync-subscription', authenticateToken as any, async (req, res) => {
  try {
    const userId = (req as any).user.id as string
    const { email } = (req as any).user

    console.log(`🔄 Syncing subscription for user ${userId} (${email})`)

    // Get current user data
    const user = await prisma.user.findUnique({ 
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      })
    }

    let updatedData: any = {}

    if (stripe) {
      try {
        // Check if user exists in Stripe by email
        const customers = await stripe.customers.list({
          email: email,
          limit: 1
        })

        if (customers.data.length > 0) {
          const customer = customers.data[0]
          console.log(`✅ Found Stripe customer: ${customer.id}`)
          
          // Get active subscriptions
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active'
          })

          // Update user with Stripe data
          updatedData.stripeCustomerId = customer.id
          
          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0]
            updatedData.subscriptionStatus = 'active'
            
            // Determine plan based on subscription metadata or product
            const plan = subscription.metadata?.plan?.toUpperCase() || 'PAYG'
            if (['FREE', 'CREATOR', 'GROWTH', 'PRO', 'PAYG'].includes(plan)) {
              updatedData.plan = plan
            }
            
            console.log(`✅ Active subscription found, plan: ${plan}`)
          } else {
            // Has customer but no active subscription - likely PAYG setup
            updatedData.plan = 'PAYG'
            updatedData.subscriptionStatus = 'active'
            console.log(`✅ Stripe customer exists, setting as PAYG`)
          }
        } else {
          console.log(`❌ No Stripe customer found for ${email}`)
        }
      } catch (stripeError) {
        logger.warn(`Failed to sync with Stripe for user ${userId}:`, stripeError)
      }
    }

    // Update user in database if we found new data
    if (Object.keys(updatedData).length > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updatedData
      })

      logger.info(`Updated user ${userId} subscription data:`, updatedData)

      res.json({
        success: true,
        data: {
          userId: updatedUser.id,
          email: updatedUser.email,
          plan: updatedUser.plan.toLowerCase(),
          subscriptionStatus: updatedUser.subscriptionStatus,
          stripeCustomerId: updatedUser.stripeCustomerId,
          updated: updatedData
        }
      })
    } else {
      res.json({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          plan: user.plan.toLowerCase(),
          subscriptionStatus: user.subscriptionStatus,
          stripeCustomerId: user.stripeCustomerId,
          updated: {}
        },
        message: 'No updates needed'
      })
    }

  } catch (error) {
    logger.error('❌ Failed to sync subscription:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync subscription data' 
    })
  }
})

export default router
