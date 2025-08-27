'use server';

import { z } from 'zod';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Ensure firebase is initialized
import { setCookie } from '@/lib/cookies';
import { AuthError } from 'firebase/auth';

const auth = getAuth(app);

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type AuthInput = z.infer<typeof authSchema>;

function getFirebaseAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مستخدم بالفعل.';
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صالح.';
    case 'auth/operation-not-allowed':
      return 'تسجيل الدخول بكلمة المرور غير مفعل.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً.';
    case 'auth/user-disabled':
        return 'تم تعطيل هذا الحساب.';
    case 'auth/user-not-found':
        return 'المستخدم غير موجود.';
    case 'auth/wrong-password':
        return 'كلمة المرور غير صحيحة.';
    case 'auth/invalid-credential':
        return 'البيانات المدخلة غير صحيحة.';
    default:
      return 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';
  }
}


export async function signUpUser(
  values: AuthInput
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const idToken = await userCredential.user.getIdToken();
    await setCookie('auth-token', idToken);
    
    return { success: true, userId: userCredential.user.uid };
  } catch (error) {
    return { success: false, error: getFirebaseAuthErrorMessage(error as AuthError) };
  }
}

export async function signInUser(
  values: AuthInput
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    const idToken = await userCredential.user.getIdToken();
    await setCookie('auth-token', idToken);

    return { success: true, userId: userCredential.user.uid };
  } catch (error) {
    return { success: false, error: getFirebaseAuthErrorMessage(error as AuthError) };
  }
}
