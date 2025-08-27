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
});
export type GenerateColoringPageFromTextInput = z.infer<typeof GenerateColoringPageFromTextInputSchema>;

const GenerateColoringPageFromTextOutputSchema = z.object({
  coloringPageDataUri: z.string().describe('The generated coloring page as a data URI.'),
});
export type GenerateColoringPageFromTextOutput = z.infer<typeof GenerateColoringPageFromTextOutputSchema>;

export async function generateColoringPageFromText(input: GenerateColoringPageFromTextInput): Promise<GenerateColoringPageFromTextOutput> {
  return generateColoringPageFromTextFlow(input);
}

const illustrationPrompt = `You are an illustrator that creates black-and-white line art images for children’s coloring books.

Input: {{{description}}}

Instructions:
- Create a black-and-white line art illustration only.
- Style: Simple, bold outlines, cartoon-like.
- No colors, no shading, no gray areas.
- Keep the drawing uncluttered with large empty spaces for coloring.
- Avoid small details or complex textures that are difficult for children to color.
- Objects and characters must be easy to recognize and cute, child-friendly.
- The composition should be fun and inviting, suitable for children ages 4–10.`;

const generateColoringPageFromTextFlow = ai.defineFlow(
  {
    name: 'generateColoringPageFromTextFlow',
    inputSchema: GenerateColoringPageFromTextInputSchema,
    outputSchema: GenerateColoringPageFromTextOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: illustrationPrompt.replace('{{{description}}}', input.description),
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {coloringPageDataUri: media.url!};
  }
);
