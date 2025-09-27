// Production-ready authentication configuration
export const AUTH_CONFIG = {
  // JWT Configuration
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-super-secure-secret-key-change-this-in-production',
    EXPIRES_IN: '7d',
    REFRESH_EXPIRES_IN: '30d',
    ALGORITHM: 'HS256' as const,
  },

  // Password Configuration
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    MAX_LENGTH: 128,
    HASH_ROUNDS: 12, // Higher for better security
  },

  // Rate Limiting
  RATE_LIMIT: {
    LOGIN_ATTEMPTS: 5, // Max login attempts per window
    LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes
    REGISTER_ATTEMPTS: 3, // Max registration attempts per window
    REGISTER_WINDOW: 60 * 60 * 1000, // 1 hour
    RESET_ATTEMPTS: 3, // Max password reset attempts per window
    RESET_WINDOW: 60 * 60 * 1000, // 1 hour
  },

  // Session Configuration
  SESSION: {
    COOKIE_NAME: 'auth-token',
    REFRESH_COOKIE_NAME: 'refresh-token',
    SECURE: process.env.NODE_ENV === 'production',
    HTTP_ONLY: true,
    SAME_SITE: 'lax' as const,
    DOMAIN: process.env.NODE_ENV === 'production' ? '.italween.com' : undefined,
  },

  // Email Verification
  EMAIL_VERIFICATION: {
    REQUIRED: true,
    TOKEN_EXPIRES_IN: 24 * 60 * 60 * 1000, // 24 hours
    MAX_RESEND_ATTEMPTS: 3,
    RESEND_WINDOW: 60 * 60 * 1000, // 1 hour
  },

  // Account Lockout
  ACCOUNT_LOCKOUT: {
    ENABLED: true,
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
    PERMANENT_LOCKOUT_ATTEMPTS: 10,
  },

  // Security Headers
  SECURITY: {
    CSRF_PROTECTION: true,
    XSS_PROTECTION: true,
    CONTENT_SECURITY_POLICY: true,
    HSTS_ENABLED: process.env.NODE_ENV === 'production',
  },
};

// Password validation rules
export const PASSWORD_VALIDATION = {
  minLength: AUTH_CONFIG.PASSWORD.MIN_LENGTH,
  maxLength: AUTH_CONFIG.PASSWORD.MAX_LENGTH,
  requireUppercase: AUTH_CONFIG.PASSWORD.REQUIRE_UPPERCASE,
  requireLowercase: AUTH_CONFIG.PASSWORD.REQUIRE_LOWERCASE,
  requireNumbers: AUTH_CONFIG.PASSWORD.REQUIRE_NUMBERS,
  requireSpecialChars: AUTH_CONFIG.PASSWORD.REQUIRE_SPECIAL_CHARS,
  specialChars: AUTH_CONFIG.PASSWORD.SPECIAL_CHARS,
};

// Validation functions
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < PASSWORD_VALIDATION.minLength) {
    errors.push(`Password must be at least ${PASSWORD_VALIDATION.minLength} characters long`);
  }

  if (password.length > PASSWORD_VALIDATION.maxLength) {
    errors.push(`Password must be no more than ${PASSWORD_VALIDATION.maxLength} characters long`);
  }

  if (PASSWORD_VALIDATION.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_VALIDATION.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_VALIDATION.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_VALIDATION.requireSpecialChars) {
    const specialCharRegex = new RegExp(`[${PASSWORD_VALIDATION.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharRegex.test(password)) {
      errors.push(`Password must contain at least one special character (${PASSWORD_VALIDATION.specialChars})`);
    }
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', 'monkey', '1234567890', 'abc123'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
    errors.push('Password is too common or weak');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};
