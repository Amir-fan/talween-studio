'use server';
/**
 * @fileOverview A simple flow for interacting with the Gemini AI.
 *
 * - simplePrompt - A function that takes a text prompt and returns a response from Gemini.
 * - SimplePromptInput - The input type for the simplePrompt function.
 * - SimplePromptOutput - The return type for the simplePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplePromptInputSchema = z.object({
  prompt: z.string().describe('The text prompt to send to the AI.'),
});
export type SimplePromptInput = z.infer<typeof SimplePromptInputSchema>;

const SimplePromptOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
});
export type SimplePromptOutput = z.infer<typeof SimplePromptOutputSchema>;

export async function simplePrompt(input: SimplePromptInput): Promise<SimplePromptOutput> {
  return simplePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplePrompt',
  input: {schema: SimplePromptInputSchema},
  output: {schema: SimplePromptOutputSchema},
  prompt: `You are a helpful assistant. Respond to the following prompt:
  
{{{prompt}}}`,
});

const simplePromptFlow = ai.defineFlow(
  {
    name: 'simplePromptFlow',
    inputSchema: SimplePromptInputSchema,
    outputSchema: SimplePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
