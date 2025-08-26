'use server';
/**
 * @fileOverview Generates a coloring page from a scene description.
 *
 * - generateColoringPageFromDescription - A function that generates a coloring page.
 * - GenerateColoringPageFromDescriptionInput - The input type for the function.
 * - GenerateColoringPageFromDescriptionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateColoringPageFromDescriptionInputSchema = z.object({
  description: z.string().describe('The scene description from the story.'),
  childName: z.string().describe("The main character's name to ensure consistency."),
});
export type GenerateColoringPageFromDescriptionInput = z.infer<typeof GenerateColoringPageFromDescriptionInputSchema>;

const GenerateColoringPageFromDescriptionOutputSchema = z.object({
  coloringPageDataUri: z.string().describe('The generated coloring page as a data URI.'),
});
export type GenerateColoringPageFromDescriptionOutput = z.infer<typeof GenerateColoringPageFromDescriptionOutputSchema>;

export async function generateColoringPageFromDescription(input: GenerateColoringPageFromDescriptionInput): Promise<GenerateColoringPageFromDescriptionOutput> {
  return generateColoringPageFromDescriptionFlow(input);
}

const illustrationPrompt = `Create a black-and-white line art illustration for a children’s coloring book.

Input Scene: {{{description}}}

Rules:
- Style: Simple, bold outlines, no shading, no gray areas, no colors.
- Objects and characters should be easy for children to recognize and color.
- Keep it uncluttered with large empty spaces for coloring.
- Maintain consistency of the main character {{{childName}}} across all illustrations.
- Avoid small details that are difficult to color.
- Make it fun, cute, and child-friendly.`;

const generateColoringPageFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateColoringPageFromDescriptionFlow',
    inputSchema: GenerateColoringPageFromDescriptionInputSchema,
    outputSchema: GenerateColoringPageFromDescriptionOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: illustrationPrompt.replace('{{{description}}}', input.description).replace('{{{childName}}}', input.childName),
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {coloringPageDataUri: media.url!};
  }
);
