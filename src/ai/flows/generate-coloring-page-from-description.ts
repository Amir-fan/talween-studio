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

const generateColoringPageFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateColoringPageFromDescriptionFlow',
    inputSchema: GenerateColoringPageFromDescriptionInputSchema,
    outputSchema: GenerateColoringPageFromDescriptionOutputSchema,
  },
  async input => {
     // A simplified and direct prompt for better reliability.
    const illustrationPrompt = `black-and-white, line-art, coloring book style. A simple, cute, child-friendly illustration for a children's coloring book. The scene: ${input.description}. The main character is named ${input.childName}. Use thick, clean outlines and no shading or color.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: illustrationPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a valid URL.');
    }

    return {coloringPageDataUri: media.url};
  }
);
