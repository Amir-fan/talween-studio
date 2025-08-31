
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { GenerateColoringPageFromTextInput, GenerateColoringPageFromTextOutput } from '@/app/create/word/actions';

const textToImagePrompt = `
You are an illustrator that creates black-and-white line art images for children’s coloring books.
Input: "[Insert scene description here]"
Instructions:
- Create a black-and-white line art illustration only.
- Style: Simple, bold outlines, cartoon-like.
- No colors, no shading, no gray areas.
- Keep the drawing uncluttered with large empty spaces for coloring.
- Avoid small details or complex textures that are difficult for children to color.
- Objects and characters must be easy to recognize and cute, child-friendly.
- The composition should be fun and inviting, suitable for children ages 4–10.
`;

export async function generateColoringPageFromText(
  input: GenerateColoringPageFromTextInput
): Promise<GenerateColoringPageFromTextOutput> {
    
    const finalPrompt = textToImagePrompt.replace('[Insert scene description here]', input.description);

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: finalPrompt,
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
