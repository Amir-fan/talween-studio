/**
 * Auth API Service - Handle authentication API calls
 * 
 * Centralized API communication for authentication.
 * No state management, no localStorage - just API calls.
 * 
 * Single responsibility: Make auth API requests.
 */

export interface AuthApiResponse {
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
}

export class AuthApiService {
  private readonly baseUrl: string;

  constructor() {
    // Use relative URLs for API calls (same origin)
    this.baseUrl = '/api/auth';
  }

  /**
   * Sign up new user
   * 
   * @param email - User email
   * @param password - User password
   * @param displayName - Optional display name
   * @returns API response
   */
  async signUp(
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthApiResponse> {
    try {
      console.log('🌐 [AUTH API] Sign up request:', email);

      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('🌐 [AUTH API] ✅ Sign up successful');
        return data;
      }

      console.error('🌐 [AUTH API] ❌ Sign up failed:', data.error);
      return {
        success: false,
        error: data.error || 'Sign up failed'
      };

    } catch (error) {
      console.error('🌐 [AUTH API] ❌ Network error:', error);
      return {
        success: false,
        error: 'Network error - please check your connection'
      };
    }
  }

  /**
   * Sign in existing user
   * 
   * @param email - User email
   * @param password - User password
   * @returns API response
   */
  async signIn(email: string, password: string): Promise<AuthApiResponse> {
    try {
      console.log('🌐 [AUTH API] Sign in request:', email);

      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('🌐 [AUTH API] ✅ Sign in successful');
        return data;
      }

      console.error('🌐 [AUTH API] ❌ Sign in failed:', data.error);
      return {
        success: false,
        error: data.error || 'Sign in failed'
      };

    } catch (error) {
      console.error('🌐 [AUTH API] ❌ Network error:', error);
      return {
        success: false,
        error: 'Network error - please check your connection'
      };
    }
  }

  /**
   * Logout user (server-side cleanup if needed)
   * 
   * @returns API response
   */
  async logout(): Promise<{ success: boolean }> {
    try {
      console.log('🌐 [AUTH API] Logout request');

      // Currently no server-side logout needed (JWT is stateless)
      // This method is here for future expansion (e.g., token blacklisting)

      return { success: true };

    } catch (error) {
      console.error('🌐 [AUTH API] ❌ Logout error:', error);
      return { success: false };
    }
  }

  /**
   * Verify email with token
   * 
   * @param token - Verification token
   * @returns API response
   */
  async verifyEmail(token: string): Promise<AuthApiResponse> {
    try {
      console.log('🌐 [AUTH API] Email verification request');

      const response = await fetch(`${this.baseUrl}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('🌐 [AUTH API] ✅ Email verified');
        return data;
      }

      console.error('🌐 [AUTH API] ❌ Verification failed:', data.error);
      return {
        success: false,
        error: data.error || 'Verification failed'
      };

    } catch (error) {
      console.error('🌐 [AUTH API] ❌ Network error:', error);
      return {
        success: false,
        error: 'Network error'
      };
    }
  }

  /**
   * Request password reset
   * 
   * @param email - User email
   * @returns API response
   */
  async requestPasswordReset(email: string): Promise<AuthApiResponse> {
    try {
      console.log('🌐 [AUTH API] Password reset request:', email);

      const response = await fetch(`${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('🌐 [AUTH API] ✅ Reset email sent');
        return data;
      }

      console.error('🌐 [AUTH API] ❌ Reset failed:', data.error);
      return {
        success: false,
        error: data.error || 'Reset failed'
      };

    } catch (error) {
      console.error('🌐 [AUTH API] ❌ Network error:', error);
      return {
        success: false,
        error: 'Network error'
      };
    }
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();

