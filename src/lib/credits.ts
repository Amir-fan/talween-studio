'use server';

import { dbAdmin } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function checkAndDeductCredits(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  const userRef = dbAdmin.collection('users').doc(userId);

  try {
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return { success: false, error: 'User not found.' };
    }

    const userData = userDoc.data();
    if (!userData) {
      return { success: false, error: 'User data not found.' };
    }

    const currentCredits = userData.credits || 0;

    if (currentCredits < amount) {
      return { success: false, error: 'Not enough credits' };
    }

    // Deduct credits
    await userRef.update({
      credits: FieldValue.increment(-amount),
    });

    // Log the transaction
    const transactionRef = userRef.collection('transactions').doc();
    await transactionRef.set({
      amount: -amount,
      date: FieldValue.serverTimestamp(),
      type: 'deduction',
      description: 'AI Generation'
    });

    return { success: true };
  } catch (error) {
    console.error('Error deducting credits:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while deducting credits.';
    return { success: false, error: errorMessage };
  }
}
