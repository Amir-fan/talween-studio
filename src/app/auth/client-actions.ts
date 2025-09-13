
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
    const result = createLocalUser(values.email, values.password, values.name);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, userId: result.user?.uid };
  } catch (error) {
    return { success: false, error: 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.' };
  }
}

export async function signInUser(
  values: Pick<AuthInput, 'email' | 'password'>
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const result = signInLocalUser(values.email, values.password);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, userId: result.user?.uid };
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
