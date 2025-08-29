'use server';

import { ai } from '@/ai/genkit';
import type { GenerateColoringPageFromTextInput, GenerateColoringPageFromTextOutput } from './actions';

export async function generateImageAction(
  values: GenerateColoringPageFromTextInput
): Promise<{
  success: boolean;
  data?: GenerateColoringPageFromTextOutput;
  error?: string;
}> {
  try {
     const prompt = `
      You are an expert illustrator that creates black-and-white line art images for children’s coloring books. Your output must be a simple, clean, coloring book style image.

      **Scene Description:** "${values.description}"

      **Rules:**
      1.  **Style:** Black-and-white line art only.
      2.  **Outlines:** Use simple, bold, and clear outlines.
      3.  **Color:** Absolutely no colors, shading, or gray areas. The background must be white.
      4.  **Simplicity:** Keep the drawing uncluttered with large empty spaces for coloring.
      5.  **Clarity:** Objects and characters must be cute, child-friendly, and easy to recognize.
      6.  **Difficulty Level:** ${values.difficulty}.
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

    const result = { coloringPageDataUri: media.url };
    return { success: true, data: result };
  } catch (error) {
    console.error('Image generation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية إنشاء الصورة. الرجاء المحاولة مرة أخرى.';
    return { success: false, error: errorMessage };
  }
}
