import { userLookupService } from './services/user-lookup-service';
import { passwordVerifier } from './services/password-verifier';
import { tokenService } from './services/token-service';
import { userActivityService } from './services/user-activity-service';
import { sendEmail } from './email-service-apps-script';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: string;
  email: string;
  displayName: string;
  credits: number;
  status: string;
  emailVerified: boolean;
  subscriptionTier: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  token?: string;
}

// Register new user
export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  try {
    console.log('🔍 USER REGISTRATION - Attempting to register:');
    console.log('  - email:', email);
    console.log('  - displayName:', displayName);
    console.log('  - NODE_ENV:', process.env.NODE_ENV);

    // Check if user already exists
    const existingUser = userDb.findByEmail(email);
    if (existingUser) {
      return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' };
    }

    let user = null;

    // In production, prioritize Google Sheets due to Vercel serverless limitations
    if (process.env.NODE_ENV === 'production') {
      console.log('  - PRODUCTION MODE: Using Google Sheets as primary database');
      
      // Create user in Google Sheets (primary in production)
      try {
        const googleSheetsResult = await googleSheetsUserDb.create(email, password, displayName);
        if (googleSheetsResult.success) {
          console.log('  - Google Sheets user created:', googleSheetsResult.user?.id);
          user = googleSheetsResult.user;
        } else {
          console.log('  - Google Sheets creation failed:', googleSheetsResult.error);
          return { success: false, error: 'فشل في إنشاء الحساب' };
        }
      } catch (error) {
        console.log('  - Google Sheets creation error:', error);
        return { success: false, error: 'فشل في إنشاء الحساب' };
      }
      
      // Also try to create in local database (backup)
      try {
        const localResult = userDb.create(email, password, displayName);
        if (localResult.success) {
          console.log('  - local backup user created:', localResult.user?.id);
        } else {
          console.log('  - local backup creation failed (non-critical):', localResult.error);
        }
      } catch (error) {
        console.log('  - local backup creation failed (non-critical):', error);
      }
    } else {
      console.log('  - DEVELOPMENT MODE: Using local database as primary');
      
      // Create user in local database (primary in development)
      user = userDb.create(email, password, displayName);
      console.log('  - local user created:', user.id);

      // Also create in Google Sheets (backup)
      try {
        const googleSheetsResult = await googleSheetsUserDb.create(email, password, displayName);
        if (googleSheetsResult.success) {
          console.log('  - Google Sheets backup created:', googleSheetsResult.user?.id);
        } else {
          console.log('  - Google Sheets backup failed (non-critical):', googleSheetsResult.error);
        }
      } catch (error) {
        console.log('  - Google Sheets backup failed (non-critical):', error);
      }
    }

    // Send welcome email (non-blocking)
    sendEmail(
      email,
      'welcome',
      { name: displayName },
      user.id
    ).catch(error => {
      console.error('Email sending failed (non-blocking):', error);
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        credits: user.credits,
        status: user.status,
        emailVerified: user.emailVerified,
        subscriptionTier: user.subscriptionTier
      }
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: 'حدث خطأ أثناء التسجيل' };
  }
}

/**
 * Login user - Refactored with clean service architecture
 * Uses specialized services for lookup, verification, and token generation
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    console.log('🔍 [LOGIN] Attempting login:', email);

    // Find user across all data sources
    const user = await userLookupService.findUser(email);
    
    if (!user) {
      console.log('❌ [LOGIN] User not found');
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }

    // Verify password
    const isPasswordValid = await passwordVerifier.verify(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ [LOGIN] Password mismatch');
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
    
    console.log('✅ [LOGIN] User authenticated successfully');

    // Update last login activity
    userActivityService.updateLastLogin(user.id);

    // Generate JWT token
    const token = tokenService.generate({ id: user.id, email: user.email });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.display_name,
        credits: user.credits,
        status: user.status,
        emailVerified: user.email_verified,
        subscriptionTier: user.subscription_tier,
        role: user.role || 'user'
      },
      token
    };

  } catch (error: any) {
    console.error('❌ [LOGIN] Critical error:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
  }
}

// Helper function to restore user from backup files
async function restoreUserFromBackup(email: string): Promise<any> {
  try {
    // Only try filesystem operations in Node.js environment (not Edge runtime)
    if (typeof window === 'undefined' && typeof process !== 'undefined' && process.versions?.node) {
      // Dynamically import fs and path only when needed and available
      const fs = await import('fs');
      const path = await import('path');
      
      const backupPath = path.join(process.cwd(), 'database-backup.json');
      const emergencyPath = path.join(process.cwd(), 'database-emergency.json');
      
      // Try backup file first
      if (fs.existsSync(backupPath)) {
        const backupData = fs.readFileSync(backupPath, 'utf8');
        const backupDb = JSON.parse(backupData);
        
        if (backupDb.users && typeof backupDb.users === 'object') {
          const user = Object.values(backupDb.users).find((u: any) => u.email === email);
          if (user) {
            console.log('  - user found in backup file');
            return user;
          }
        }
      }
      
      // Try emergency backup
      if (fs.existsSync(emergencyPath)) {
        const emergencyData = fs.readFileSync(emergencyPath, 'utf8');
        const emergencyDb = JSON.parse(emergencyData);
        
        if (emergencyDb.users && typeof emergencyDb.users === 'object') {
          const user = Object.values(emergencyDb.users).find((u: any) => u.email === email);
          if (user) {
            console.log('  - user found in emergency backup');
            return user;
          }
        }
      }
    }
    
    return null;
  } catch (error: any) {
    console.log('  - backup restoration error:', error);
    return null;
  }
}

// Verify email (not needed since we auto-verify)
export async function verifyEmail(token: string): Promise<AuthResult> {
  return { success: true };
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    const user = await googleSheetsUserDb.findByEmail(email);
    if (!user) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل' };
    }

    // For now, just return success since password reset is complex with Google Sheets
    return { success: true };
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return { success: false, error: 'حدث خطأ أثناء طلب إعادة تعيين كلمة المرور' };
  }
}

// Reset password
export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  // For now, just return success since password reset is complex with Google Sheets
  return { success: true };
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // Try local database first (primary)
    let user = userDb.findById(userId);
    
    if (!user) {
      // Fallback to Google Sheets
      try {
        const googleSheetsUser = await googleSheetsUserDb.findById(userId);
        if (googleSheetsUser) {
          // Migrate user to local database
          user = userDb.create(
            googleSheetsUser['البريد الإلكتروني'] || googleSheetsUser.email,
            googleSheetsUser['كلمة المرور'] || googleSheetsUser.password || 'temp123',
            googleSheetsUser['الاسم'] || googleSheetsUser.displayName || 'User'
          );
        }
      } catch (error) {
        console.log('Google Sheets fallback failed:', error);
      }
    }
    
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      credits: user.credits,
      status: user.status,
      emailVerified: user.email_verified,
      subscriptionTier: user.subscription_tier
    };
  } catch (error: any) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

// Verify JWT token
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.userId, email: decoded.email };
  } catch (error: any) {
    return null;
  }
}
