'use server';

import { z } from 'zod';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { db } from '@/lib/firebase';
import { setCookie } from '@/lib/cookies';
import type { AuthError } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { createUserDocument } from '@/ai/flows/create-user-document';
import { firebaseConfig } from '@/lib/firebase-config';

// Initialize a new app instance for server-side use or get the existing one.
const serverApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(serverApp);

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

type AuthInput = z.infer<typeof authSchema>;

const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صالح.' }),
});

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
    // This function still needs to be run from the client, so we will keep it in client-actions.
    // This file is now purely for server-side auth actions.
    return { success: false, error: 'Signup must be called from the client.' };
}

export async function signInUser(
  values: Pick<AuthInput, 'email' | 'password'>
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    
    // Set the cookie on the server-side
    await setCookie('auth-token', idToken);

    // Update last login time using the client SDK instance
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
        lastLogin: serverTimestamp()
    });

    return { success: true, userId: user.uid };
  } catch (error) {
    return { success: false, error: getFirebaseAuthErrorMessage(error as AuthError) };
  }
}
