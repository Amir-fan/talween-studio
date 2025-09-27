
'use client';

import { z } from 'zod';

import { signInLocalUser, createLocalUser } from '@/lib/local-auth';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

type AuthInput = z.infer<typeof authSchema>;

const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صالح.' }),
});

export async function signUpWithEmail(
  values: AuthInput
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    // Use server API instead of localStorage
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        displayName: values.name
      })
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, userId: data.user?.id };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.' };
  }
}

export async function signInUser(
  values: Pick<AuthInput, 'email' | 'password'>
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    // Use server API instead of localStorage
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: values.email,
        password: values.password
      })
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, userId: data.user?.id };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.' };
  }
}

export async function sendResetPasswordEmail(
  values: z.infer<typeof resetPasswordSchema>
): Promise<{ success: boolean; error?: string }> {
  // Password reset not available in local auth system
  return { success: false, error: 'إعادة تعيين كلمة المرور غير متاحة حالياً.' };
}
