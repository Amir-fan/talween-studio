'use server';
/**
 * @fileOverview A flow for creating a user document in Firestore.
 * This is a server-only operation that uses the Firebase Admin SDK.
 *
 * - createUserDocument - Creates a new document in the 'users' collection.
 * - CreateUserInput - The input type for the createUserDocument function.
 */

import { ai } from '@/ai/genkit';
import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'genkit';

const CreateUserInputSchema = z.object({
  uid: z.string().describe('The user ID from Firebase Authentication.'),
  email: z.string().email().describe("The user's email address."),
  name: z.string().describe("The user's display name."),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

// The output can be simple, just confirming success.
const CreateUserOutputSchema = z.object({
  success: z.boolean(),
  path: z.string(),
});
export type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;


export async function createUserDocument(input: CreateUserInput): Promise<CreateUserOutput> {
  return createUserDocumentFlow(input);
}


const createUserDocumentFlow = ai.defineFlow(
  {
    name: 'createUserDocumentFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: CreateUserOutputSchema,
  },
  async (input) => {
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
);
