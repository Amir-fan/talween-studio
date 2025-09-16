import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userDb } from './simple-database';
import { sendEmail } from './email-service-apps-script';
import { addUserToSheets } from './google-sheets';

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
    // Check if user already exists
    const existingUser = userDb.findByEmail(email);
    if (existingUser) {
      return { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' };
    }

    // Create user
    const result = userDb.create(email, password, displayName);
    if (!result.success) {
      return { success: false, error: result.error || 'فشل في إنشاء الحساب' };
    }

    const user = result.user!;

    // User is already auto-verified in database creation

    // Send welcome email (non-blocking)
    sendEmail(
      email,
      'welcomeAfterVerification',
      { name: displayName },
      user.id
    ).catch(error => {
      console.error('Email sending failed (non-blocking):', error);
    });

    // Add to Google Sheets with verified status (non-blocking)
    addUserToSheets({
      id: user.id,
      email: user.email,
      display_name: user.displayName,
      credits: 50,
      status: 'active',
      email_verified: true,
      subscription_tier: 'FREE',
      created_at: Math.floor(Date.now() / 1000),
      total_spent: 0
    }).catch(error => {
      console.error('Error adding user to sheets (non-blocking):', error);
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        credits: 50,
        status: 'active',
        emailVerified: true,
        subscriptionTier: 'FREE'
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'حدث خطأ أثناء التسجيل' };
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    console.log('🔍 LOGIN ATTEMPT:');
    console.log('  - email:', email);
    console.log('  - password length:', password.length);
    
    const user = userDb.findByEmail(email);
    console.log('  - user found:', !!user);
    if (user) {
      console.log('  - user id:', user.id);
      console.log('  - user email:', user.email);
      console.log('  - user status:', user.status);
    }
    
    if (!user) {
      console.log('❌ User not found');
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }

    // Check password
    const isValidPassword = bcrypt.compareSync(password, user.password);
    console.log('  - password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }

    // No email verification required - users are auto-verified on signup

    // Update last login
    userDb.updateUser(user.id, { last_login: Math.floor(Date.now() / 1000) });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        credits: user.credits,
        status: user.status,
        emailVerified: user.email_verified,
        subscriptionTier: user.subscription_tier
      },
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
  }
}

// Verify email
export async function verifyEmail(token: string): Promise<AuthResult> {
  try {
    const result = userDb.verifyEmail(token);
    if (!result.success) {
      return { success: false, error: 'رابط التحقق غير صحيح أو منتهي الصلاحية' };
    }

    const user = result.user!;

    // Send welcome email
    await sendEmail(
      user.email,
      'welcomeAfterVerification',
      { name: user.display_name },
      user.id
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        credits: user.credits,
        status: 'active',
        emailVerified: true,
        subscriptionTier: user.subscription_tier
      }
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: 'حدث خطأ أثناء التحقق من البريد الإلكتروني' };
  }
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    const user = userDb.findByEmail(email);
    if (!user) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل' };
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpires = Date.now() + 3600000; // 1 hour

    // Update user with reset token
    userDb.updateUser(user.id, {
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires
    });

    // Send reset email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'passwordReset',
      { name: user.display_name, resetLink },
      user.id
    );

    return { success: true };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, error: 'حدث خطأ أثناء طلب إعادة تعيين كلمة المرور' };
  }
}

// Reset password
export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  try {
    const user = userDb.findByEmail(''); // You'll need to implement findByResetToken
    if (!user || user.reset_token !== token || user.reset_token_expires < Date.now()) {
      return { success: false, error: 'رابط إعادة التعيين غير صحيح أو منتهي الصلاحية' };
    }

    // Update password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    userDb.updateUser(user.id, {
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null
    });

    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' };
  }
}

// Get user by ID
export function getUserById(userId: string): User | null {
  const user = userDb.findById(userId);
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
}

// Verify JWT token
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    return null;
  }
}
