'use server';
/**
 * @fileOverview Generates a coloring page from a text description.
 *
 * - generateColoringPageFromText - A function that generates a coloring page from a text description.
 * - GenerateColoringPageFromTextInput - The input type for the generateColoringPageFromText function.
 * - GenerateColoringPageFromTextOutput - The return type for the generateColoringPageFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateColoringPageFromTextInputSchema = z.object({
  description: z.string().describe('The description of the coloring page to generate.'),
  difficulty: z.string().describe('The difficulty of the coloring page (e.g., Simple, Detailed).').optional().default('Simple'),
});
export type GenerateColoringPageFromTextInput = z.infer<typeof GenerateColoringPageFromTextInputSchema>;

const GenerateColoringPageFromTextOutputSchema = z.object({
  coloringPageDataUri: z.string().describe('The generated coloring page as a data URI.'),
});
export type GenerateColoringPageFromTextOutput = z.infer<typeof GenerateColoringPageFromTextOutputSchema>;

export async function generateColoringPageFromText(input: GenerateColoringPageFromTextInput): Promise<GenerateColoringPageFromTextOutput> {
  return generateColoringPageFromTextFlow(input);
}

const illustrationPrompt = ai.definePrompt({
  name: 'generateColoringPageFromTextPrompt',
  input: { schema: GenerateColoringPageFromTextInputSchema },
  output: { schema: GenerateColoringPageFromTextOutputSchema },
  prompt: `You are an illustrator that creates black-and-white line art images for children’s coloring books.

Input: {{{description}}}

Instructions:

- Create a black-and-white line art illustration only.
- Style: Simple, bold outlines, cartoon-like.
- No colors, no shading, no gray areas.
- Keep the drawing uncluttered with large empty spaces for coloring.
- Objects and characters must be easy to recognize and cute, child-friendly.
- The composition should be fun and inviting, suitable for children ages 4–10.
- The requested difficulty is: {{{difficulty}}}
{{#if (eq difficulty "Simple")}}
- Keep it very simple with thick, bold outlines. Avoid small details. Perfect for toddlers.
{{/if}}
{{#if (eq difficulty "Detailed")}}
- Add more intricate details and finer lines suitable for older children who enjoy a challenge.
{{/if}}

{{media url=coloringPageDataUri}}`,
   config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateColoringPageFromTextFlow = ai.defineFlow(
  {
    name: 'generateColoringPageFromTextFlow',
    inputSchema: GenerateColoringPageFromTextInputSchema,
    outputSchema: GenerateColoringPageFromTextOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Difficulty: ${input.difficulty}. Description: ${input.description}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return { coloringPageDataUri: media.url! };
  }
);
