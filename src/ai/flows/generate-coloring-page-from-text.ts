'use server';
/**
 * @fileOverview Server action to generate a coloring page from a text description.
 *
 * - generateColoringPageFromText - The exported server action.
 * - GenerateColoringPageFromTextInput - The input type for the action.
 * - GenerateColoringPageFromTextOutput - The return type for the action.
 */

import { ai } from '@/ai/genkit';
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
        responseModalities: ['TEXT', 'IMAGE'],
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

    if (!media?.url) {
      throw new Error('Image generation failed to return a valid image URL.');
    }

    return { coloringPageDataUri: media.url };
}