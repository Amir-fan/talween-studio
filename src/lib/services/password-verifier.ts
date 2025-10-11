/**
 * Password Verifier Service - Secure password verification
 * 
 * Handles password hashing and comparison with bcrypt.
 * Includes fallback for legacy plain-text passwords (migration support).
 * 
 * Single responsibility: Verify passwords, nothing else.
 */

import bcrypt from 'bcryptjs';

export class PasswordVerifier {
  /**
   * Verify password against hash
   * 
   * Supports:
   * - bcrypt hashed passwords (modern)
   * - Plain text passwords (legacy, for migration)
   * 
   * @param plainPassword - Password entered by user
   * @param hashedPassword - Hashed password from database
   * @returns True if password matches
   */
  async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      // Primary: Try bcrypt comparison
      const matches = await bcrypt.compare(plainPassword, hashedPassword);

      if (matches) {
        console.log('🔐 [PASSWORD VERIFIER] ✅ Password verified (bcrypt)');
        return true;
      }

      console.log('🔐 [PASSWORD VERIFIER] ❌ Password mismatch (bcrypt)');
      return false;

    } catch (bcryptError) {
      // Fallback: Plain text comparison (for migration from old system)
      console.warn('🔐 [PASSWORD VERIFIER] bcrypt failed, trying plain text fallback');

      const plainTextMatch = plainPassword === hashedPassword;

      if (plainTextMatch) {
        console.log('🔐 [PASSWORD VERIFIER] ✅ Password verified (plain text - SHOULD REHASH)');
      } else {
        console.log('🔐 [PASSWORD VERIFIER] ❌ Password mismatch (plain text)');
      }

      return plainTextMatch;
    }
  }

  /**
   * Hash password using bcrypt
   * 
   * @param plainPassword - Plain text password
   * @param saltRounds - Number of salt rounds (default: 10)
   * @returns Hashed password
   */
  async hash(plainPassword: string, saltRounds: number = 10): Promise<string> {
    try {
      const hashed = await bcrypt.hash(plainPassword, saltRounds);
      console.log('🔐 [PASSWORD VERIFIER] ✅ Password hashed');
      return hashed;
    } catch (error) {
      console.error('🔐 [PASSWORD VERIFIER] ❌ Hashing failed:', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Check if password needs rehashing (e.g., plain text or weak rounds)
   * 
   * @param hashedPassword - Current password hash
   * @returns True if password should be rehashed
   */
  needsRehash(hashedPassword: string): boolean {
    // If password doesn't start with $2a$, $2b$, or $2y$, it's not bcrypt
    const isBcrypt = /^\$2[aby]\$/.test(hashedPassword);

    if (!isBcrypt) {
      console.log('🔐 [PASSWORD VERIFIER] Password needs rehashing (not bcrypt)');
      return true;
    }

    return false;
  }
}

// Export singleton instance
export const passwordVerifier = new PasswordVerifier();
