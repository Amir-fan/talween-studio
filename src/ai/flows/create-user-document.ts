'use server';
/**
 * @fileOverview A server action for creating a user document in Firestore.
 * This is a server-only operation that uses the Firebase Admin SDK.
 *
 * - createUserDocument - Creates a new document in the 'users' collection.
 * - CreateUserInput - The input type for the createUserDocument function.
 */

import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const CreateUserInputSchema = z.object({
  uid: z.string().describe('The user ID from Firebase Authentication.'),
  email: z.string().email().describe("The user's email address."),
  name: z.string().describe("The user's display name."),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

/**
 * Creates a new user document in Firestore.
 * This is a standard server action, not a Genkit flow, to ensure
 * compatibility with Next.js build process.
 * @param input The user data.
 * @returns A promise that resolves to an object with success status and the document path.
 */
export async function createUserDocument(input: CreateUserInput): Promise<{ success: boolean; path: string }> {
  const userRef = dbAdmin.collection('users').doc(input.uid);
  
  await userRef.set({
    uid: input.uid,
    email: input.email,
    name: input.name,
    credits: 50, // Give 50 credits on signup as per requirements
    createdAt: FieldValue.serverTimestamp(),
    lastLogin: FieldValue.serverTimestamp(),
    status: 'active'
  });
  
  return { success: true, path: userRef.path };
}
