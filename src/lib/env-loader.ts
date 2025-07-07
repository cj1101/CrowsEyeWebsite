interface EnvVars {
  [key: string]: string | undefined
}

let envCache: EnvVars | null = null

export function loadEnvVariables(): EnvVars {
  if (envCache) {
    return envCache
  }

  const envVars: EnvVars = {}
  
  // Only try to read files on the server side
  if (typeof window === 'undefined') {
    try {
      // Dynamic import to avoid bundling fs in the browser
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { readFileSync } = require('fs')
      // eslint-disable-next-line @typescript-eslint/no-require-imports  
      const { join } = require('path')
      
      // Try to read .env.local file directly
      const envPath = join(process.cwd(), '.env.local')
      const envFile = readFileSync(envPath, 'utf8')
      
      // Parse the file line by line
      envFile.split('\n').forEach((line: string) => {
        line = line.trim()
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=')
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim()
            // Remove quotes if present
            const cleanValue = value.replace(/^["']|["']$/g, '')
            envVars[key.trim()] = cleanValue
          }
        }
      })
      
      console.log('✅ Manual env loading successful:', {
        keysFound: Object.keys(envVars).length,
        hasStripeKey: !!envVars.STRIPE_SECRET_KEY,
        stripeKeyPrefix: envVars.STRIPE_SECRET_KEY?.substring(0, 8) + '...'
      })
      
    } catch (error) {
      console.error('❌ Failed to load .env.local manually:', error)
    }
  }
  
  // Merge with process.env (process.env takes precedence)
  const finalEnv = { ...envVars, ...process.env }
  envCache = finalEnv
  
  return finalEnv
}

export function getEnvVar(key: string, fallback: string = ''): string {
  const env = loadEnvVariables()
  return env[key] || fallback
} 