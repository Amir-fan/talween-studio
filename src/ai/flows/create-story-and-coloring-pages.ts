'use server';
/**
 * @fileOverview A server action that serves as a wrapper for the story generation AI flow.
 * This file is designed to be a compliant Next.js server action.
 *
 * - createStoryAndColoringPages - An async function that can be called from server components or actions.
 * - CreateStoryAndColoringPagesInput - The input type for the function.
 * - CreateStoryAndColoringPagesOutput - The return type for the function.
 */

import {
  createStoryAndColoringPagesFlow,
  CreateStoryAndColoringPagesInputSchema,
  CreateStoryAndColoringPagesOutputSchema,
} from './story-generation-flow';
import {z} from 'genkit';

export type CreateStoryAndColoringPagesInput = z.infer<typeof CreateStoryAndColoringPagesInputSchema>;
export type CreateStoryAndColoringPagesOutput = z.infer<typeof CreateStoryAndColoringPagesOutputSchema>;

/**
 * An exported async function that can be called from server components or actions.
 * This is the ONLY function exported, which complies with "use server" rules.
 * @param input The topic and number of pages for the story.
 * @returns A promise that resolves to the generated story pages.
 */
export async function createStoryAndColoringPages(
  input: CreateStoryAndColoringPagesInput
): Promise<CreateStoryAndColoringPagesOutput> {
  // Execute the imported flow
  return createStoryAndColoringPagesFlow(input);
}
