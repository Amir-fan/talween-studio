/**
 * User Storage Service - Handle localStorage operations for user data
 * 
 * Centralized localStorage management for user persistence.
 * No state management, no API calls - just storage operations.
 * 
 * Single responsibility: Persist user data in browser.
 */

const STORAGE_KEY = 'talween_user';

export interface StoredUser {
  id: string;
  uid: string; // For backward compatibility
  email: string;
  displayName?: string;
  credits?: number;
  role?: string;
  [key: string]: any;
}

export class UserStorageService {
  /**
   * Save user to localStorage
   * 
   * @param user - User object to store
   */
  save(user: any): void {
    try {
      // Normalize user object for storage
      const userForStorage: StoredUser = {
        id: user.id,
        uid: user.id, // For backward compatibility
        email: user.email,
        displayName: user.displayName || user.display_name,
        credits: typeof user.credits === 'number' ? user.credits : 50,
        role: user.role,
        ...user // Keep any additional fields
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userForStorage));
      console.log('💾 [USER STORAGE] ✅ User saved to localStorage:', user.email);

    } catch (error) {
      console.error('💾 [USER STORAGE] ❌ Save failed:', error);
      // Non-critical - continue without persistence
    }
  }

  /**
   * Load user from localStorage
   * 
   * @returns Stored user object or null
   */
  load(): StoredUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        console.log('💾 [USER STORAGE] No stored user found');
        return null;
      }

      const user = JSON.parse(stored) as StoredUser;

      // Ensure user has required fields
      if (!user.id && user.uid) {
        user.id = user.uid; // Backward compatibility
      }

      if (!user.id || !user.email) {
        console.warn('💾 [USER STORAGE] Invalid stored user, clearing...');
        this.clear();
        return null;
      }

      console.log('💾 [USER STORAGE] ✅ User loaded from localStorage:', user.email);
      return user;

    } catch (error) {
      console.error('💾 [USER STORAGE] ❌ Load failed:', error);
      // Clear corrupted data
      this.clear();
      return null;
    }
  }

  /**
   * Clear user from localStorage
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('💾 [USER STORAGE] ✅ User cleared from localStorage');
    } catch (error) {
      console.error('💾 [USER STORAGE] ❌ Clear failed:', error);
    }
  }

  /**
   * Update specific user fields in storage
   * 
   * @param updates - Fields to update
   */
  update(updates: Partial<StoredUser>): void {
    try {
      const current = this.load();

      if (!current) {
        console.warn('💾 [USER STORAGE] No user to update');
        return;
      }

      const updated = {
        ...current,
        ...updates
      };

      this.save(updated);
      console.log('💾 [USER STORAGE] ✅ User updated in localStorage');

    } catch (error) {
      console.error('💾 [USER STORAGE] ❌ Update failed:', error);
    }
  }

  /**
   * Check if user is stored
   * 
   * @returns True if user exists in storage
   */
  hasUser(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get stored user ID (without loading full user)
   * 
   * @returns User ID or null
   */
  getUserId(): string | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const user = JSON.parse(stored);
      return user.id || user.uid || null;

    } catch {
      return null;
    }
  }

  /**
   * Update credits in storage
   * Useful for optimistic updates
   * 
   * @param credits - New credit amount
   */
  updateCredits(credits: number): void {
    this.update({ credits });
  }
}

// Export singleton instance
export const userStorageService = new UserStorageService();

