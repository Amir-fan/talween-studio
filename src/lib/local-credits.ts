/**
 * Local credits system using localStorage
 * Replaces Firebase credits system
 */

import { deductLocalUserCredits, updateLocalUserCredits } from './local-auth';
import { PRICING_CONFIG, type FeatureType } from './pricing';

export async function checkAndDeductCredits(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  const result = deductLocalUserCredits(userId, amount);
  return result;
}

/**
 * Check and deduct credits for a specific feature
 */
export async function checkAndDeductCreditsForFeature(
  userId: string, 
  feature: FeatureType, 
  description?: string
): Promise<{ success: boolean; error?: string; cost?: number }> {
  
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  const cost = PRICING_CONFIG.FEATURE_COSTS[feature];
  
  // Server-side: Skip credit checking for now, handle on client side
  if (typeof window === 'undefined') {
    return { success: true, cost };
  }
  
  const result = deductLocalUserCredits(userId, cost);
  
  return {
    success: result.success,
    error: result.error,
    cost: result.success ? cost : undefined
  };
}

/**
 * Add credits to user account (for purchases, bonuses, etc.)
 */
export async function addCredits(userId: string, amount: number, description?: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    // Server-side: This will be handled by the payment callback
    // Client-side: Use localStorage
    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('talween_user_data') || '{}');
      if (!userData || userData.uid !== userId) {
        return { success: false, error: 'User not found.' };
      }

      const newCredits = userData.credits + amount;
      updateLocalUserCredits(userId, newCredits);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to add credits.' };
  }
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<{ success: boolean; credits?: number; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const userData = JSON.parse(localStorage.getItem('talween_user_data') || '{}');
    if (!userData || userData.uid !== userId) {
      return { success: false, error: 'User not found.' };
    }

    return { success: true, credits: userData.credits };
  } catch (error) {
    return { success: false, error: 'Failed to get credits.' };
  }
}
