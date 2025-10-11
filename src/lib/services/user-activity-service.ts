/**
 * User Activity Service - Track user activities and metadata
 * 
 * Handles user activity tracking like last login, last seen, etc.
 * Updates both local database and Google Sheets.
 * 
 * Single responsibility: Track user activities.
 */

import { userDb } from '@/lib/simple-database';

export class UserActivityService {
  /**
   * Update user's last login timestamp
   * 
   * @param userId - User ID
   * @returns Success status
   */
  updateLastLogin(userId: string): boolean {
    try {
      const timestamp = Math.floor(Date.now() / 1000);

      console.log('📊 [ACTIVITY SERVICE] Updating last login:', { userId, timestamp });

      userDb.updateUser(userId, {
        last_login: timestamp
      });

      console.log('📊 [ACTIVITY SERVICE] ✅ Last login updated');
      return true;

    } catch (error) {
      // Non-critical error - log and continue
      console.warn('📊 [ACTIVITY SERVICE] ⚠️ Last login update failed (non-critical):', error);
      return false;
    }
  }

  /**
   * Update user's last active timestamp
   * 
   * @param userId - User ID
   * @returns Success status
   */
  updateLastActive(userId: string): boolean {
    try {
      const timestamp = Math.floor(Date.now() / 1000);

      userDb.updateUser(userId, {
        updated_at: timestamp
      });

      return true;

    } catch (error) {
      console.warn('📊 [ACTIVITY SERVICE] Last active update failed:', error);
      return false;
    }
  }

  /**
   * Record user login event
   * Could be extended to store login history, IP addresses, etc.
   * 
   * @param userId - User ID
   * @param metadata - Optional metadata (IP, user agent, etc.)
   */
  recordLoginEvent(userId: string, metadata?: Record<string, any>): void {
    try {
      console.log('📊 [ACTIVITY SERVICE] Login event recorded:', {
        userId,
        timestamp: new Date().toISOString(),
        ...metadata
      });

      // Future: Store in login history table
      // For now, just update last_login

      this.updateLastLogin(userId);

    } catch (error) {
      console.warn('📊 [ACTIVITY SERVICE] Login event recording failed:', error);
    }
  }
}

// Export singleton instance
export const userActivityService = new UserActivityService();

