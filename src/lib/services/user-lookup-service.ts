/**
 * User Lookup Service - Centralized user discovery across all data sources
 * 
 * Handles user lookup with environment-aware fallback strategy:
 * - Production: Google Sheets → Local DB → Admin → Backup
 * - Development: Local DB → Admin → Google Sheets → Backup
 * 
 * Single responsibility: Find users, don't verify passwords or manage sessions.
 */

import { userDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export interface User {
  id: string;
  email: string;
  password: string;
  displayName?: string;
  display_name?: string;
  credits?: number;
  role?: string;
  [key: string]: any;
}

export class UserLookupService {
  /**
   * Find user by email across all data sources
   * Uses environment-aware strategy for optimal performance
   * 
   * @param email - User email address
   * @returns User object or null if not found
   */
  async findUser(email: string): Promise<User | null> {
    const isProduction = process.env.NODE_ENV === 'production';

    console.log(`🔍 [USER LOOKUP] Finding user: ${email} (${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'})`);

    if (isProduction) {
      return this.findUserProduction(email);
    } else {
      return this.findUserDevelopment(email);
    }
  }

  /**
   * Production strategy: Prioritize Google Sheets (persistent, serverless-safe)
   */
  private async findUserProduction(email: string): Promise<User | null> {
    // Layer 1: Google Sheets (primary in production)
    const sheetsUser = await this.findInGoogleSheets(email);
    if (sheetsUser) {
      console.log('🔍 [USER LOOKUP] ✅ Found in Google Sheets');
      return sheetsUser;
    }

    // Layer 2: Local database fallback
    const localUser = this.findInLocalDb(email);
    if (localUser) {
      console.log('🔍 [USER LOOKUP] ✅ Found in local DB');
      return localUser;
    }

    // Layer 3: Admin users
    const adminUser = this.findInAdminUsers(email);
    if (adminUser) {
      console.log('🔍 [USER LOOKUP] ✅ Found in admin users');
      return adminUser;
    }

    console.log('🔍 [USER LOOKUP] ❌ User not found in production sources');
    return null;
  }

  /**
   * Development strategy: Prioritize local DB (faster, better for dev)
   */
  private async findUserDevelopment(email: string): Promise<User | null> {
    // Layer 1: Local database (primary in development)
    const localUser = this.findInLocalDb(email);
    if (localUser) {
      console.log('🔍 [USER LOOKUP] ✅ Found in local DB');
      return localUser;
    }

    // Layer 2: Admin users
    const adminUser = this.findInAdminUsers(email);
    if (adminUser) {
      console.log('🔍 [USER LOOKUP] ✅ Found in admin users');
      return adminUser;
    }

    // Layer 3: Google Sheets fallback
    const sheetsUser = await this.findInGoogleSheets(email);
    if (sheetsUser) {
      console.log('🔍 [USER LOOKUP] ✅ Found in Google Sheets (fallback)');
      // Optionally migrate to local DB for faster future lookups
      this.migrateToLocalDb(sheetsUser);
      return sheetsUser;
    }

    console.log('🔍 [USER LOOKUP] ❌ User not found in development sources');
    return null;
  }

  /**
   * Find user in Google Sheets
   */
  private async findInGoogleSheets(email: string): Promise<User | null> {
    try {
      const result = await googleSheetsUserDb.findByEmail(email);

      if (result.success && result.user) {
        // Normalize user object (Google Sheets might use Arabic keys)
        return {
          id: result.user.id || result.user['المعرف'],
          email: result.user.email || result.user['البريد الإلكتروني'],
          password: result.user.password || result.user['كلمة المرور'],
          displayName: result.user.displayName || result.user['الاسم'],
          credits: result.user.credits || result.user['النقاط'] || 0,
          role: result.user.role || result.user['الدور'],
          ...result.user
        } as User;
      }

      return null;
    } catch (error) {
      console.error('🔍 [USER LOOKUP] Google Sheets error:', error);
      return null;
    }
  }

  /**
   * Find user in local SQLite database
   */
  private findInLocalDb(email: string): User | null {
    try {
      const user = userDb.findByEmail(email);
      return user ? (user as User) : null;
    } catch (error) {
      console.error('🔍 [USER LOOKUP] Local DB error:', error);
      return null;
    }
  }

  /**
   * Find user in admin users list
   */
  private findInAdminUsers(email: string): User | null {
    try {
      const adminUser = userDb.findAdminByEmail(email);
      return adminUser ? (adminUser as User) : null;
    } catch (error) {
      console.error('🔍 [USER LOOKUP] Admin lookup error:', error);
      return null;
    }
  }

  /**
   * Migrate Google Sheets user to local DB for faster future access
   * (Development only optimization)
   */
  private migrateToLocalDb(user: User): void {
    try {
      const existingUser = userDb.findByEmail(user.email);
      if (!existingUser) {
        console.log('🔍 [USER LOOKUP] Migrating user to local DB:', user.email);
        userDb.create(
          user.email,
          user.password || 'temp123',
          user.displayName || user.display_name || 'User'
        );
      }
    } catch (error) {
      // Non-critical - just log and continue
      console.warn('🔍 [USER LOOKUP] Migration failed (non-critical):', error);
    }
  }

  /**
   * Find user by ID (useful for token verification)
   */
  findById(userId: string): User | null {
    try {
      const user = userDb.findById(userId);
      return user ? (user as User) : null;
    } catch (error) {
      console.error('🔍 [USER LOOKUP] findById error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const userLookupService = new UserLookupService();

