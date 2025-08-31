
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateColoringPageFromTextInputSchema, GenerateColoringPageFromTextOutputSchema } from '@/app/create/word/types';
import type { GenerateColoringPageFromTextInput, GenerateColoringPageFromTextOutput } from '@/app/create/word/types';

export const generateColoringPageFromTextFlow = ai.defineFlow(
    {
        name: 'generateColoringPageFromTextFlow',
        inputSchema: GenerateColoringPageFromTextInputSchema,
        outputSchema: GenerateColoringPageFromTextOutputSchema,
    },
    async (input) => {
        const prompt = `
          You are an expert illustrator that creates black-and-white line art images for children’s coloring books. Your output must be a simple, clean, coloring book style image.
    
          **Scene Description:** "${input.description}"
    
          **Rules:**
          1.  **Style:** Black-and-white line art only.
          2.  **Outlines:** Use simple, bold, and clear outlines.
          3.  **Color:** Absolutely no colors, shading, or gray areas. The background must be white.
          4.  **Simplicity:** Keep the drawing uncluttered with large empty spaces for coloring.
          5.  **Clarity:** Objects and characters must be cute, child-friendly, and easy to recognize.
          6.  **Difficulty Level:** ${input.difficulty}.
              - If 'Simple', use very thick outlines and minimal detail, suitable for toddlers.
              - If 'Detailed', use finer lines and more intricate details, suitable for older children.
          7.  **Composition:** The overall image should be fun and inviting for children.
        `;
    
        const { media } = await ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: prompt,
          config: {
            apiKey: process.env.TEXT_TO_IMAGE_KEY,
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });
    
        if (!media?.url) {
          throw new Error('Image generation failed to return a valid image URL.');
        }
    
        return { coloringPageDataUri: media.url };
    }
);


export async function generateColoringPageFromText(
  input: GenerateColoringPageFromTextInput
): Promise<GenerateColoringPageFromTextOutput> {
  const result = await generateColoringPageFromTextFlow(input);
  return result;
}
