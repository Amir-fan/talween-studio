
'use server';
/**
 * @fileOverview Generates a single coloring page image from a text description.
 * This flow is part of the dual-API story generation system.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromDescriptionInputSchema = z.object({
  description: z.string().describe('The detailed description of the scene to illustrate.'),
});
export type GenerateImageFromDescriptionInput = z.infer<typeof GenerateImageFromDescriptionInputSchema>;

const GenerateImageFromDescriptionOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated coloring page as a data URI.'),
});
export type GenerateImageFromDescriptionOutput = z.infer<typeof GenerateImageFromDescriptionOutputSchema>;

const imagePrompt = ai.definePrompt(
  {
    name: 'generateImageFromDescriptionPrompt',
    input: {schema: GenerateImageFromDescriptionInputSchema},
    output: {schema: GenerateImageFromDescriptionOutputSchema},
    config: {
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      apiKey: process.env.STORY_IMAGE_KEY,
      responseModalities: ['TEXT', 'IMAGE'],
    },
    prompt: `Create a black-and-white line art illustration for a children’s coloring book. 
Use the following scene description as input:

{{{description}}}

Rules:
- Style: Simple, bold outlines, no shading, no gray areas, no colors.
- Objects and characters must be easy for children to recognize and color.
- Keep uncluttered with large empty spaces for coloring.
- Main Character Consistency:
   - Use the same facial features, hairstyle, and clothing as described in Chapter 1.
   - Ensure the character’s face and proportions are consistent across all illustrations.
- Do not add backgrounds that are too detailed — keep focus on main character and a few simple props.
- Make it fun, cute, and child-friendly.`,
  },
  async (input) => {
    // This is a workaround for prompts that only generate media
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.description,
       config: {
        apiKey: process.env.STORY_IMAGE_KEY,
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return { imageDataUri: media.url! };
  }
);


export async function generateImageFromDescription(
  input: GenerateImageFromDescriptionInput
): Promise<GenerateImageFromDescriptionOutput> {
  const result = await imagePrompt(input);
  return result.output!;
}
