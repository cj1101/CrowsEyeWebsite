import { UserProfile } from '@/contexts/AuthContext'; // Assuming UserProfile is exported from AuthContext
import { apiService } from './api'; // Assuming you have a central apiService

export interface UsageCost {
  credits: number;
  dollars: number;
}

// Define costs for various actions
export const USAGE_COSTS = {
  IMAGE_GENERATION: { credits: 5, dollars: 0.05 },
  VIDEO_GENERATION: { credits: 100, dollars: 1.00 },
  CAPTION_GENERATION: { credits: 1, dollars: 0.01 },
  ADVANCED_PROCESSING: { credits: 10, dollars: 0.10 },
};

class UsageService {
  /**
   * Checks if a user can perform an action and handles the cost.
   * This is the central point for all paid API calls.
   * @param userProfile The user's profile object.
   * @param cost The cost of the action from USAGE_COSTS.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async handleUsage(userProfile: UserProfile | null, cost: UsageCost): Promise<{ success: boolean; error?: string }> {
    if (!userProfile) {
      return { success: false, error: 'You must be logged in to perform this action.' };
    }

    const { plan, credits = 0 } = userProfile;

    // Block free users from any paid action
    if (!plan || plan === 'free') {
      return { success: false, error: 'This feature requires a paid plan. Please upgrade to continue.' };
    }

    // Handle Pay-as-you-go users
    if (plan === 'payg') {
      try {
        // This backend endpoint should add the cost to the user's running Stripe subscription total.
        await apiService.post('/api/billing/record-usage', {
          userId: userProfile.uid,
          costInDollars: cost.dollars,
          description: `Usage charge for ${Object.keys(USAGE_COSTS).find(key => USAGE_COSTS[key as keyof typeof USAGE_COSTS].credits === cost.credits)}`,
        });
        return { success: true };
      } catch (error: any) {
        console.error('Failed to record PAYG usage:', error);
        return { success: false, error: error.response?.data?.error || 'Failed to record usage for your plan.' };
      }
    }

    // Handle credit-based plan users
    if (['creator', 'growth', 'pro'].includes(plan)) {
      if (credits < cost.credits) {
        return { success: false, error: `Insufficient AI credits. This action costs ${cost.credits} credits, but you only have ${credits}.` };
      }
      try {
        // This backend endpoint should deduct credits from the user's account in the database.
        await apiService.post('/api/users/deduct-credits', {
          userId: userProfile.uid,
          creditsToDeduct: cost.credits,
        });
        return { success: true };
      } catch (error: any) {
        console.error('Failed to deduct credits:', error);
        return { success: false, error: error.response?.data?.error || 'Failed to update your credit balance.' };
      }
    }

    // Fallback for any other plan types
    return { success: false, error: 'Your current plan does not support this action.' };
  }
}

export const usageService = new UsageService();
