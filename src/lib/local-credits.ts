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
  
  // Server-side: Check credits in database
  if (typeof window === 'undefined') {
    console.log('🔍 SERVER-SIDE CREDIT CHECK:');
    console.log('  - userId:', userId);
    console.log('  - userId type:', typeof userId);
    console.log('  - feature:', feature);
    console.log('  - cost:', cost);
    
    const { userDb } = await import('./simple-database');
    
    // List all users in database for debugging
    console.log('  - All users in database:');
    const allUsers = userDb.getAllUsers();
    allUsers.forEach(u => {
      console.log(`    - ${u.id}: ${u.email} (${u.credits} credits)`);
    });
    
    const user = userDb.findById(userId);
    
    console.log('  - user found:', !!user);
    if (user) {
      console.log('  - user.credits:', user.credits);
      console.log('  - user.id:', user.id);
      console.log('  - user.email:', user.email);
    }
    
    if (!user) {
      console.log('❌ User not found in database by ID');
      console.log('  - Tried to find userId:', userId);
      console.log('  - Available user IDs:', allUsers.map(u => u.id));
      
      // Try to find user by email as fallback (in case of ID mismatch)
      console.log('  - Trying to find user by email...');
      const userByEmail = allUsers.find(u => u.email === userId);
      if (userByEmail) {
        console.log('  - Found user by email:', userByEmail.email);
        console.log('  - Using user ID:', userByEmail.id);
        
        if (userByEmail.credits < cost) {
          console.log('❌ Not enough credits (email fallback):', userByEmail.credits, '<', cost);
          return { success: false, error: 'Not enough credits' };
        }
        
        // Use the found user's ID for credit operations
        const deductResult = userDb.deductCredits(userByEmail.id, cost);
        if (!deductResult.success) {
          console.log('❌ Failed to deduct credits:', deductResult.error);
          return { success: false, error: deductResult.error || 'Failed to deduct credits' };
        }
        console.log('✅ Credits deducted successfully using email fallback');
        return { success: true, cost };
      }
      
      // Try to find user by partial ID match (in case of ID format issues)
      console.log('  - Trying to find user by partial ID match...');
      const userByPartialId = allUsers.find(u => u.id.includes(userId) || userId.includes(u.id));
      if (userByPartialId) {
        console.log('  - Found user by partial ID match:', userByPartialId.email);
        console.log('  - Using user ID:', userByPartialId.id);
        
        if (userByPartialId.credits < cost) {
          console.log('❌ Not enough credits (partial ID fallback):', userByPartialId.credits, '<', cost);
          return { success: false, error: 'Not enough credits' };
        }
        
        // Use the found user's ID for credit operations
        const deductResult = userDb.deductCredits(userByPartialId.id, cost);
        if (!deductResult.success) {
          console.log('❌ Failed to deduct credits:', deductResult.error);
          return { success: false, error: deductResult.error || 'Failed to deduct credits' };
        }
        console.log('✅ Credits deducted successfully using partial ID fallback');
        return { success: true, cost };
      }
      
      return { success: false, error: 'User not found' };
    }
    
    if (user.credits < cost) {
      console.log('❌ Not enough credits:', user.credits, '<', cost);
      return { success: false, error: 'Not enough credits' };
    }
    
    // Deduct credits from database
    console.log('✅ Deducting credits from database');
    const deductResult = userDb.deductCredits(userId, cost);
    console.log('  - deductResult:', deductResult);
    
    if (!deductResult.success) {
      console.log('❌ Failed to deduct credits:', deductResult.error);
      return { success: false, error: deductResult.error || 'Failed to deduct credits' };
    }
    
    console.log('✅ Credits deducted successfully');
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
