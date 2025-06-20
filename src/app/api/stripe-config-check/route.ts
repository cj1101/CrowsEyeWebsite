import { NextResponse } from 'next/server'
import { loadEnvVariables, getEnvVar } from '@/lib/env-loader'

export async function GET() {
  try {
    // Load environment variables manually
    const envVars = loadEnvVariables()
    const processEnvKey = process.env.STRIPE_SECRET_KEY
    const manualKey = getEnvVar('STRIPE_SECRET_KEY')
    const finalKey = processEnvKey || manualKey
    
    const result = {
      PROCESS_ENV_KEY: !!processEnvKey,
      MANUAL_KEY: !!manualKey,
      FINAL_KEY: !!finalKey,
      STRIPE_SECRET_KEY_PREFIX: finalKey?.substring(0, 8) + '...' || 'none',
      STRIPE_SECRET_KEY_TYPE: finalKey?.startsWith('sk_live_') ? 'live' : 
                               finalKey?.startsWith('sk_test_') ? 'test' : 'unknown',
      NODE_ENV: process.env.NODE_ENV,
      SERVER_SIDE_CHECK: true,
      MANUAL_ENV_KEYS_COUNT: Object.keys(envVars).length,
      ALL_STRIPE_ENV_VARS: Object.keys(process.env)
        .filter(key => key.includes('STRIPE'))
        .reduce((acc, key) => {
          acc[key] = !!process.env[key]
          return acc
        }, {} as Record<string, boolean>),
      MANUAL_STRIPE_VARS: Object.keys(envVars)
        .filter(key => key.includes('STRIPE'))
        .reduce((acc, key) => {
          acc[key] = !!envVars[key]
          return acc
        }, {} as Record<string, boolean>)
    }
    
    console.log('🔧 Server-side Stripe config check:', result)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Server-side config check failed:', error)
    return NextResponse.json({ 
      error: 'Config check failed',
      message: (error as Error).message 
    }, { status: 500 })
  }
} 