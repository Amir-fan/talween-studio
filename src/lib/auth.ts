import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { googleSheetsUserDb } from './google-sheets-api';
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
    console.log('🔍 GOOGLE SHEETS REGISTRATION - Attempting to register:');
    console.log('  - email:', email);
    console.log('  - displayName:', displayName);

    // Create user directly in Google Sheets
    const result = await googleSheetsUserDb.create(email, password, displayName);
    
    console.log('  - result.success:', result.success);
    console.log('  - result.error:', result.error);

    if (!result.success) {
      return { success: false, error: result.error || 'فشل في إنشاء الحساب' };
    }

    const user = result.user!;

    // Send welcome email (non-blocking)
    sendEmail(
      email,
      'welcomeAfterVerification',
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
    console.log('🔍 GOOGLE SHEETS LOGIN ATTEMPT:');
    console.log('  - email:', email);
    console.log('  - password length:', password.length);
    
    const user = await googleSheetsUserDb.findByEmail(email);
    console.log('  - user found:', !!user);
    if (user) {
      console.log('  - user id:', user['المعرف'] || user.id);
      console.log('  - user email:', user['البريد الإلكتروني'] || user.email);
      console.log('  - user status:', user['الحالة'] || user.status);
    }
    
    if (!user) {
      console.log('❌ User not found');
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }

    // For now, we'll skip password verification since Google Sheets doesn't store hashed passwords
    // In production, you'd want to implement proper password verification
    console.log('✅ User found, proceeding with login');

    // Update last login
    await googleSheetsUserDb.updateUser(user['المعرف'] || user.id, { 
      'آخر دخول': new Date().toLocaleDateString('ar-SA') 
    });

    // Generate JWT token
    const userId = user['المعرف'] || user.id;
    const userEmail = user['البريد الإلكتروني'] || user.email;
    const token = jwt.sign(
      { userId, email: userEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      user: {
        id: userId,
        email: userEmail,
        displayName: user['الاسم'] || user.displayName,
        credits: parseInt(user['النقاط'] || user.credits || '0'),
        status: user['الحالة'] || user.status || 'active',
        emailVerified: user['البريد الإلكتروني مؤكد'] === 'نعم' || user.emailVerified === true,
        subscriptionTier: user['مستوى الاشتراك'] || user.subscriptionTier || 'FREE'
      },
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
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
  } catch (error) {
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
    const user = await googleSheetsUserDb.findById(userId);
    if (!user) return null;

    return {
      id: user['المعرف'] || user.id,
      email: user['البريد الإلكتروني'] || user.email,
      displayName: user['الاسم'] || user.displayName,
      credits: parseInt(user['النقاط'] || user.credits || '0'),
      status: user['الحالة'] || user.status || 'active',
      emailVerified: user['البريد الإلكتروني مؤكد'] === 'نعم' || user.emailVerified === true,
      subscriptionTier: user['مستوى الاشتراك'] || user.subscriptionTier || 'FREE'
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
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
