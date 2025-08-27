'use server';

import { z } from 'zod';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { setCookie } from '@/lib/cookies';
import type { AuthError } from 'firebase/auth';
import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Use client auth for auth operations
const auth = getAuth(app);

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

// Helper function to create user document using Admin SDK
async function createUserDocument(uid: string, email: string, name?: string) {
  const userRef = dbAdmin.collection('users').doc(uid);
  await userRef.set({
    uid,
    email,
    name: name || '',
    credits: 50, // Give 50 credits on signup
    createdAt: FieldValue.serverTimestamp(),
    lastLogin: FieldValue.serverTimestamp(),
    status: 'active'
  });
}

export async function signUpUser(
  values: AuthInput
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    await setCookie('auth-token', idToken);
    
    // Call the server-side helper to create the user document
    await createUserDocument(user.uid, values.email, values.name);

    return { success: true, userId: user.uid };
  } catch (error) {
    return { success: false, error: getFirebaseAuthErrorMessage(error as AuthError) };
  }
}

export async function signInUser(
  values: Pick<AuthInput, 'email' | 'password'>
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    await setCookie('auth-token', idToken);

    // Use client db for this client-context write
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
        lastLogin: serverTimestamp()
    });

    return { success: true, userId: user.uid };
  } catch (error) {
    return { success: false, error: getFirebaseAuthErrorMessage(error as AuthError) };
  }
}

export async function sendResetPasswordEmail(
  values: z.infer<typeof resetPasswordSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, values.email);
    return { success: true };
  } catch (error) {
     return { success: false, error: getFirebaseAuthErrorMessage(error as AuthError) };
  }
}
