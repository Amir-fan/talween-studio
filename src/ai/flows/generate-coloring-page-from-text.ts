'use server';
/**
 * @fileOverview Server action to generate a coloring page from a text description.
 *
 * - generateColoringPageFromText - The exported server action.
 * - GenerateColoringPageFromTextInput - The input type for the action.
 * - GenerateColoringPageFromTextOutput - The return type for the action.
 */

import { generateColoringPageFromTextFlow } from '@/ai/flows/story-generation-flow';
import { z } from 'genkit';

export const GenerateColoringPageFromTextInputSchema = z.object({
  description: z.string().describe('The description of the coloring page to generate.'),
  difficulty: z.string().describe('The difficulty of the coloring page (e.g., Simple, Detailed).').optional().default('Simple'),
});
export type GenerateColoringPageFromTextInput = z.infer<typeof GenerateColoringPageFromTextInputSchema>;

export const GenerateColoringPageFromTextOutputSchema = z.object({
  coloringPageDataUri: z.string().describe('The generated coloring page as a data URI.'),
});
export type GenerateColoringPageFromTextOutput = z.infer<typeof GenerateColoringPageFromTextOutputSchema>;

export async function generateColoringPageFromText(input: GenerateColoringPageFromTextInput): Promise<GenerateColoringPageFromTextOutput> {
  return generateColoringPageFromTextFlow(input);
}
