/**
 * Credit Service - Single Source of Truth for all credit operations
 * 
 * Handles credit addition, deduction, and balance queries across both:
 * - Local SQLite database
 * - Google Sheets database
 * 
 * Includes automatic fallback logic and transaction safety.
 */

import { userDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export interface CreditResult {
  success: boolean;
  newBalance?: number;
  error?: string;
}

export interface CreditTransaction {
  userId: string;
  amount: number;
  reason?: string;
  timestamp: Date;
  type: 'add' | 'deduct';
}

export class CreditService {
  /**
   * Add credits to user account in both databases
   * 
   * @param userId - User ID
   * @param amount - Number of credits to add (must be positive)
   * @param reason - Optional description (e.g., "Package purchase: TEST")
   * @returns Promise with success status and new balance
   */
  async addCredits(
    userId: string,
    amount: number,
    reason?: string
  ): Promise<CreditResult> {
    try {
      console.log('💰 [CREDIT SERVICE] Adding credits:', { userId, amount, reason });

      // Validate inputs
      if (!userId || !userId.trim()) {
        console.error('💰 [CREDIT SERVICE] Invalid userId');
        return { success: false, error: 'Invalid user ID' };
      }

      if (!amount || amount <= 0 || !Number.isFinite(amount)) {
        console.error('💰 [CREDIT SERVICE] Invalid amount:', amount);
        return { success: false, error: 'Invalid credit amount' };
      }

      // Get current user
      const user = userDb.findById(userId);
      if (!user) {
        console.error('💰 [CREDIT SERVICE] User not found:', userId);
        return { success: false, error: 'User not found' };
      }

      const currentBalance = user.credits || 0;
      const newBalance = currentBalance + Math.floor(amount);

      // Update local database
      console.log('💰 [CREDIT SERVICE] Updating local database...');
      userDb.updateCredits(userId, Math.floor(amount));

      // Verify local update
      const updatedUser = userDb.findById(userId);
      const localSuccess = updatedUser && updatedUser.credits === newBalance;

      if (!localSuccess) {
        console.error('💰 [CREDIT SERVICE] Local database update failed');
        return { success: false, error: 'Failed to update local database' };
      }

      console.log('💰 [CREDIT SERVICE] ✅ Local database updated:', {
        oldBalance: currentBalance,
        newBalance: updatedUser.credits,
        added: amount
      });

      // Update Google Sheets with fallback logic
      const sheetsSuccess = await this.updateGoogleSheets(userId, user.email, Math.floor(amount));

      if (sheetsSuccess) {
        console.log('💰 [CREDIT SERVICE] ✅ Google Sheets updated');
      } else {
        console.warn('💰 [CREDIT SERVICE] ⚠️ Google Sheets update failed (non-critical)');
      }

      return {
        success: true,
        newBalance: updatedUser.credits
      };

    } catch (error) {
      console.error('💰 [CREDIT SERVICE] ❌ Unexpected error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Deduct credits from user account
   * 
   * @param userId - User ID
   * @param amount - Number of credits to deduct (must be positive)
   * @param reason - Optional description
   * @returns Promise with success status
   */
  async deductCredits(
    userId: string,
    amount: number,
    reason?: string
  ): Promise<CreditResult> {
    try {
      console.log('💰 [CREDIT SERVICE] Deducting credits:', { userId, amount, reason });

      // Validate inputs
      if (!userId || !userId.trim()) {
        return { success: false, error: 'Invalid user ID' };
      }

      if (!amount || amount <= 0 || !Number.isFinite(amount)) {
        return { success: false, error: 'Invalid credit amount' };
      }

      // Get current user
      const user = userDb.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const currentBalance = user.credits || 0;

      // Check sufficient balance
      if (currentBalance < amount) {
        console.warn('💰 [CREDIT SERVICE] Insufficient balance:', {
          required: amount,
          available: currentBalance
        });
        return {
          success: false,
          error: 'Insufficient credits'
        };
      }

      const newBalance = currentBalance - Math.floor(amount);

      // Deduct from local database
      const deductResult = userDb.deductCredits(userId, Math.floor(amount));

      if (!deductResult.success) {
        console.error('💰 [CREDIT SERVICE] Local deduction failed');
        return { success: false, error: deductResult.error };
      }

      console.log('💰 [CREDIT SERVICE] ✅ Local database updated:', {
        oldBalance: currentBalance,
        newBalance,
        deducted: amount
      });

      // Update Google Sheets (set new balance directly)
      const sheetsSuccess = await this.setGoogleSheetsBalance(userId, user.email, newBalance);

      if (sheetsSuccess) {
        console.log('💰 [CREDIT SERVICE] ✅ Google Sheets updated');
      } else {
        console.warn('💰 [CREDIT SERVICE] ⚠️ Google Sheets update failed (non-critical)');
      }

      return {
        success: true,
        newBalance
      };

    } catch (error) {
      console.error('💰 [CREDIT SERVICE] ❌ Deduction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user's current credit balance
   * 
   * @param userId - User ID
   * @returns Current credit balance (0 if user not found)
   */
  getBalance(userId: string): number {
    try {
      const user = userDb.findById(userId);
      return user?.credits || 0;
    } catch (error) {
      console.error('💰 [CREDIT SERVICE] Error getting balance:', error);
      return 0;
    }
  }

  /**
   * Update Google Sheets with fallback logic
   * Private helper method
   * 
   * Strategy:
   * 1. Try adding credits by user ID
   * 2. If fails, lookup user by email
   * 3. Try adding credits to found user
   * 4. If still fails, update credits directly
   * 
   * @param userId - User ID
   * @param email - User email (for fallback)
   * @param amount - Credits to add
   * @returns Success status
   */
  private async updateGoogleSheets(
    userId: string,
    email: string,
    amount: number
  ): Promise<boolean> {
    try {
      // Strategy 1: Try by ID first
      console.log('💰 [CREDIT SERVICE] Google Sheets: Trying by ID...');
      const byId = await googleSheetsUserDb.addCredits(userId, amount);

      if (byId.success) {
        console.log('💰 [CREDIT SERVICE] Google Sheets: ✅ Updated by ID');
        return true;
      }

      // Strategy 2: Fallback - Find by email and update
      console.log('💰 [CREDIT SERVICE] Google Sheets: ID failed, trying email fallback...');
      const lookup = await googleSheetsUserDb.findByEmail(email);

      if (!lookup.success || !lookup.user?.id) {
        console.warn('💰 [CREDIT SERVICE] Google Sheets: User not found by email');
        return false;
      }

      const targetId = lookup.user.id as string;
      console.log('💰 [CREDIT SERVICE] Google Sheets: Found user by email:', targetId);

      // Try adding credits by the found ID
      const addByEmail = await googleSheetsUserDb.addCredits(targetId, amount);

      if (addByEmail.success) {
        console.log('💰 [CREDIT SERVICE] Google Sheets: ✅ Updated by email lookup');
        return true;
      }

      // Strategy 3: Last resort - Direct update
      console.log('💰 [CREDIT SERVICE] Google Sheets: Trying direct update...');
      const currentCredits = Number(lookup.user.credits || 0);
      const newCredits = currentCredits + amount;

      await googleSheetsUserDb.updateCredits(targetId, newCredits);
      console.log('💰 [CREDIT SERVICE] Google Sheets: ✅ Updated directly');

      return true;

    } catch (error) {
      console.error('💰 [CREDIT SERVICE] Google Sheets: ❌ All strategies failed:', error);
      return false;
    }
  }

  /**
   * Set exact credit balance in Google Sheets
   * Used for deductions where we set the final amount
   * 
   * @param userId - User ID
   * @param email - User email (for fallback)
   * @param newBalance - New credit balance to set
   * @returns Success status
   */
  private async setGoogleSheetsBalance(
    userId: string,
    email: string,
    newBalance: number
  ): Promise<boolean> {
    try {
      // Try by ID first
      const updateById = await googleSheetsUserDb.updateCredits(userId, newBalance);

      if (updateById.success) {
        return true;
      }

      // Fallback: Find by email
      const lookup = await googleSheetsUserDb.findByEmail(email);

      if (lookup.success && lookup.user?.id) {
        const targetId = lookup.user.id as string;
        await googleSheetsUserDb.updateCredits(targetId, newBalance);
        return true;
      }

      return false;

    } catch (error) {
      console.error('💰 [CREDIT SERVICE] Google Sheets balance update failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const creditService = new CreditService();

