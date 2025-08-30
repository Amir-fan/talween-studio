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
Use the following scene description as input:

{{description}}

Rules:
- Style: Simple, bold outlines, no shading, no gray areas, no colors.
- Objects and characters must be easy for children to recognize and color.
- Keep uncluttered with large empty spaces for coloring.
- Main Character Consistency:
   • Use the same facial features, hairstyle, and clothing as described in Chapter 1.
   • Ensure the character’s face and proportions are consistent across all illustrations.
- Do not add backgrounds that are too detailed — keep focus on main character and a few simple props.
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
      prompt: illustrationPrompt.replace('{{description}}', input.description),
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        apiKey: process.env.STORY_IMAGE_KEY,
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a valid URL.');
    }

    return {coloringPageDataUri: media.url};
  }
);
