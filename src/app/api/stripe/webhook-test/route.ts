import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🧪 Webhook test endpoint called')
  
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())
    
    console.log('📥 Headers:', {
      'stripe-signature': headers['stripe-signature'],
      'content-type': headers['content-type'],
      'user-agent': headers['user-agent']
    })
    
    console.log('📦 Body length:', body.length)
    console.log('📝 Body preview:', body.substring(0, 200) + '...')
    
    // Check environment variables
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    
    console.log('🔧 Environment check:', {
      webhookSecretConfigured: !!webhookSecret,
      webhookSecretLength: webhookSecret?.length || 0,
      stripeSecretConfigured: !!stripeSecret,
      stripeSecretPrefix: stripeSecret?.substring(0, 7) || 'none'
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook test successful',
      timestamp: new Date().toISOString(),
      bodyLength: body.length,
      hasStripeSignature: !!headers['stripe-signature'],
      environment: {
        webhookSecretConfigured: !!webhookSecret,
        stripeSecretConfigured: !!stripeSecret
      }
    })
    
  } catch (error) {
    console.error('❌ Webhook test error:', error)
    return NextResponse.json({
      error: 'Webhook test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook test endpoint is working',
    timestamp: new Date().toISOString(),
    environment: {
      webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripeSecretConfigured: !!process.env.STRIPE_SECRET_KEY
    }
  })
} 