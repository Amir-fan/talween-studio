
'use client';

import { z } from 'zod';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, type AuthError } from 'firebase/auth';
import { db, app } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { createUserDocumentAction } from './actions';

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

export async function signUpWithEmail(
  values: AuthInput
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;
    
    // Call the server action to create the user document in Firestore
    const creationResult = await createUserDocumentAction({ 
        uid: user.uid, 
        email: values.email, 
        name: values.name || '' 
    });

    if (!creationResult.success) {
      // If document creation fails, we should ideally handle this,
      // possibly by deleting the auth user or flagging the account.
      // For now, we'll just log and return the error.
      console.error("Failed to create user document:", creationResult.error);
      return { success: false, error: creationResult.error };
    }

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
