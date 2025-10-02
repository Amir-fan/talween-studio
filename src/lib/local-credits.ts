/**
 * Credits system using Google Sheets API
 * Replaces local database with Google Sheets as primary database
 */

// Use server-side implementation to avoid client env issues when called from server actions
import { googleSheetsUserDb } from './google-sheets-server';
import { PRICING_CONFIG, type FeatureType } from './pricing';

export async function checkAndDeductCredits(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const result = await googleSheetsUserDb.deductCredits(userId, amount);
    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return { success: false, error: 'Failed to deduct credits.' };
  }
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
  
  try {
    const result = await googleSheetsUserDb.deductCredits(userId, cost);
    return { success: result.success, error: result.error, cost: result.success ? cost : undefined };
  } catch (error) {
    console.error('Error deducting credits for feature:', error);
    return { success: false, error: 'Failed to process credits.' };
  }
}

/**
 * Add credits to user account (for purchases, bonuses, etc.)
 */
export async function addCredits(userId: string, amount: number, description?: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const result = await googleSheetsUserDb.addCredits(userId, amount);
    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('Error adding credits:', error);
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
    const result = await googleSheetsUserDb.findById(userId);
    if (!result.success || !result.user) {
      return { success: false, error: result.error || 'User not found.' };
    }

    const credits = parseInt((result.user as any).credits as any || '0');
    return { success: true, credits };
  } catch (error) {
    console.error('Error getting user credits:', error);
    return { success: false, error: 'Failed to get credits.' };
  }
}
