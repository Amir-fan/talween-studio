'use server';

import { createUserDocument, CreateUserInput } from "@/ai/flows/create-user-document";

/**
 * Server action to create a user document in Firestore.
 * This function is intended to be called from client-side actions.
 * @param {CreateUserInput} input - The user data.
 * @returns {Promise<{success: boolean; error?: string}>}
 */
export async function createUserDocumentAction(input: CreateUserInput): Promise<{ success: boolean; error?: string }> {
  try {
    // Directly call the server function.
    await createUserDocument(input);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during user document creation.';
    console.error('Create User Document Action Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
