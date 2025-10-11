/**
 * Token Service - JWT token generation and verification
 * 
 * Handles all JWT operations for authentication.
 * 
 * Single responsibility: Manage authentication tokens.
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'talween-secret-key-2024';
const TOKEN_EXPIRY = '7d'; // 7 days

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class TokenService {
  /**
   * Generate JWT token for user
   * 
   * @param user - User object with id and email
   * @returns JWT token string
   */
  generate(user: { id: string; email: string }): string {
    try {
      const payload: TokenPayload = {
        userId: user.id,
        email: user.email
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY
      });

      console.log('🎫 [TOKEN SERVICE] ✅ Token generated for:', user.email);
      return token;

    } catch (error) {
      console.error('🎫 [TOKEN SERVICE] ❌ Token generation failed:', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Verify and decode JWT token
   * 
   * @param token - JWT token string
   * @returns Decoded token payload or null if invalid
   */
  verify(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      console.log('🎫 [TOKEN SERVICE] ✅ Token verified for:', decoded.email);
      return decoded;

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log('🎫 [TOKEN SERVICE] ❌ Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.log('🎫 [TOKEN SERVICE] ❌ Invalid token');
      } else {
        console.error('🎫 [TOKEN SERVICE] ❌ Token verification error:', error);
      }
      return null;
    }
  }

  /**
   * Decode token without verification (useful for debugging)
   * 
   * @param token - JWT token string
   * @returns Decoded payload or null
   */
  decode(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch (error) {
      console.error('🎫 [TOKEN SERVICE] ❌ Token decode error:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   * 
   * @param token - JWT token string
   * @returns True if expired
   */
  isExpired(token: string): boolean {
    const decoded = this.decode(token);

    if (!decoded || !decoded.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }
}

// Export singleton instance
export const tokenService = new TokenService();
