/**
 * PAY-AS-YOU-GO USAGE TRACKING SERVICE - WITH $5 MINIMUM BILLING THRESHOLD
 * ========================================================================
 * 
 * Handles usage metering and Stripe integration for PAYG customers
 * Simple pricing: $0.15/credit, $0.25/post, $2.99/GB with $5 minimum billing threshold
 */

import { CrowsEyeAPI } from './api'
import { 
  USAGE_PRICING_CONFIG, 
  calculateUsageCost,
  reportUsageToStripe,
  createPAYGSubscription 
} from '@/lib/stripe'

export interface UsageEvent {
  event_name: string
  timestamp: number
  stripe_customer_id: string
  value?: number
}

export interface PAYGUsage {
  ai_credits: number
  scheduled_posts: number
  storage_gb: number
  total_cost: number
  will_be_charged: boolean
  billable_amount: number
  billing_period: {
    start: string
    end: string
  }
  cost_breakdown: {
    ai_credits: number
    scheduled_posts: number
    storage_gb: number
  }
  threshold_status: {
    minimum_threshold: number
    current_usage: number
    reached_threshold: boolean
    remaining_until_charged: number
  }
}

export class PAYGUsageService {
  private api: CrowsEyeAPI
  private stripeCustomerId: string | null = null

  constructor() {
    this.api = new CrowsEyeAPI()
  }

  /**
   * Initialize PAYG service with user's Stripe customer ID
   */
  async initialize(userId: string): Promise<void> {
    try {
      const response = await this.makeAPICall('get', `/api/v1/users/${userId}/stripe-customer`)
      this.stripeCustomerId = response.data.stripe_customer_id
    } catch (error) {
      console.error('Failed to initialize PAYG service:', error)
      throw new Error('Unable to initialize billing service')
    }
  }

  /**
   * Make API call using CrowsEyeAPI methods
   */
  private async makeAPICall(method: 'get' | 'post', url: string, data?: any): Promise<any> {
    const instance = this.api as any
    return instance.api[method](url, data)
  }

  /**
   * Track AI credit usage
   */
  async trackAICredit(amount: number = 1): Promise<void> {
    if (!this.stripeCustomerId) {
      throw new Error('PAYG service not initialized')
    }

    // Report to Stripe meter
    await reportUsageToStripe({
      customerId: this.stripeCustomerId,
      meterType: 'ai_credits',
      value: amount
    })

    // Update local tracking
    await this.updateLocalUsage('ai_credits', amount)
  }

  /**
   * Track scheduled post usage
   */
  async trackScheduledPost(): Promise<void> {
    if (!this.stripeCustomerId) {
      throw new Error('PAYG service not initialized')
    }

    // Report to Stripe meter
    await reportUsageToStripe({
      customerId: this.stripeCustomerId,
      meterType: 'scheduled_posts',
      value: 1
    })

    // Update local tracking
    await this.updateLocalUsage('scheduled_posts', 1)
  }

  /**
   * Track storage usage
   */
  async trackStorageUsage(totalGB: number): Promise<void> {
    if (!this.stripeCustomerId) {
      throw new Error('PAYG service not initialized')
    }

    // Report to Stripe meter
    await reportUsageToStripe({
      customerId: this.stripeCustomerId,
      meterType: 'storage_gb',
      value: totalGB
    })

    // Update local tracking (replace total, not add)
    await this.updateLocalUsage('storage_gb', totalGB, true)
  }

  /**
   * Get current month's usage with $5 minimum billing threshold calculation
   */
  async getCurrentUsage(): Promise<PAYGUsage> {
    try {
      const response = await this.makeAPICall('get', '/api/v1/billing/payg/usage')
      const usage = response.data

      // Calculate costs with $5 minimum billing threshold
      const costAnalysis = calculateUsageCost({
        ai_credits: usage.ai_credits,
        scheduled_posts: usage.scheduled_posts,
        storage_gb: usage.storage_gb
      })

      const minimumThreshold = USAGE_PRICING_CONFIG.minimum_billing_threshold

      return {
        ...usage,
        total_cost: costAnalysis.total,
        will_be_charged: costAnalysis.will_be_charged,
        billable_amount: costAnalysis.billable_amount,
        cost_breakdown: {
          ai_credits: costAnalysis.breakdown.ai_credits.cost,
          scheduled_posts: costAnalysis.breakdown.scheduled_posts.cost,
          storage_gb: costAnalysis.breakdown.storage_gb.cost
        },
        threshold_status: {
          minimum_threshold: minimumThreshold,
          current_usage: costAnalysis.total,
          reached_threshold: costAnalysis.will_be_charged,
          remaining_until_charged: Math.max(0, minimumThreshold - costAnalysis.total)
        }
      }
    } catch (error) {
      console.error('Failed to get current usage:', error)
      return this.getFallbackUsage()
    }
  }

  /**
   * Get fallback usage data
   */
  private getFallbackUsage(): PAYGUsage {
    const minimumThreshold = USAGE_PRICING_CONFIG.minimum_billing_threshold
    
    return {
      ai_credits: 0,
      scheduled_posts: 0,
      storage_gb: 0,
      total_cost: 0.00,
      will_be_charged: false,
      billable_amount: 0.00,
      billing_period: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
      },
      cost_breakdown: {
        ai_credits: 0,
        scheduled_posts: 0,
        storage_gb: 0
      },
      threshold_status: {
        minimum_threshold: minimumThreshold,
        current_usage: 0,
        reached_threshold: false,
        remaining_until_charged: minimumThreshold
      }
    }
  }

  /**
   * Create PAYG account with card setup and $5 minimum threshold
   */
  async createPAYGAccount(userEmail: string, userId: string): Promise<{ sessionId?: string; url?: string | null; customerId: string; message: string }> {
    try {
      const result = await createPAYGSubscription({
        customerEmail: userEmail,
        userId: userId,
        successUrl: `${window.location.origin}/success?plan=payg`,
        cancelUrl: `${window.location.origin}/pricing`
      })
      
      return result
    } catch (error) {
      console.error('Failed to create PAYG account:', error)
      throw new Error('Unable to create pay-as-you-go account')
    }
  }

  /**
   * Get pricing estimate for projected usage with minimum threshold
   */
  getUsageEstimate(projectedUsage: {
    ai_credits: number
    scheduled_posts: number
    storage_gb: number
  }): { breakdown: any; total: number; will_be_charged: boolean; billable_amount: number } {
    const costAnalysis = calculateUsageCost(projectedUsage)
    
    return {
      breakdown: costAnalysis.breakdown,
      total: costAnalysis.total,
      will_be_charged: costAnalysis.will_be_charged,
      billable_amount: costAnalysis.billable_amount
    }
  }

  /**
   * Check if customer will be charged based on current usage
   */
  willBeCharged(usage: PAYGUsage): boolean {
    return usage.will_be_charged
  }

  /**
   * Get amount remaining until minimum threshold is reached
   */
  getRemainingUntilCharged(usage: PAYGUsage): number {
    return usage.threshold_status.remaining_until_charged
  }

  /**
   * Update local usage tracking
   */
  private async updateLocalUsage(type: string, amount: number, replace: boolean = false): Promise<void> {
    try {
      await this.makeAPICall('post', '/api/v1/billing/payg/usage-local', {
        type,
        amount,
        replace,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to update local usage:', error)
    }
  }
}

// Export singleton instance
export const paygUsageService = new PAYGUsageService()

/**
 * React Hook for Pay-as-you-Go usage tracking
 */
export function usePayAsYouGo() {
  const trackAICredit = async (amount: number = 1) => {
    try {
      await paygUsageService.trackAICredit(amount)
    } catch (error) {
      console.error('Failed to track AI credit usage:', error)
    }
  }

  const trackScheduledPost = async () => {
    try {
      await paygUsageService.trackScheduledPost()
    } catch (error) {
      console.error('Failed to track scheduled post:', error)
    }
  }

  const trackStorage = async (totalGB: number) => {
    try {
      await paygUsageService.trackStorageUsage(totalGB)
    } catch (error) {
      console.error('Failed to track storage usage:', error)
    }
  }

  const getCurrentUsage = async (): Promise<PAYGUsage | null> => {
    try {
      return await paygUsageService.getCurrentUsage()
    } catch (error) {
      console.error('Failed to get current usage:', error)
      return null
    }
  }

  const getUsageEstimate = (projectedUsage: {
    ai_credits: number
    scheduled_posts: number
    storage_gb: number
  }) => {
    return paygUsageService.getUsageEstimate(projectedUsage)
  }

  return {
    trackAICredit,
    trackScheduledPost,
    trackStorage,
    getCurrentUsage,
    getUsageEstimate
  }
} 