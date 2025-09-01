'use server';
/**
 * @fileOverview Generates a coloring page from a text description and difficulty level.
 */

import {ai} from '@/ai/genkit';
import { GenerateColoringPageFromTextInputSchema, GenerateColoringPageFromTextOutputSchema } from '@/app/create/word/types';
import type { GenerateColoringPageFromTextInput, GenerateColoringPageFromTextOutput } from '@/app/create/word/types';

const coloringPagePrompt = ai.definePrompt({
    name: 'coloringPagePrompt',
    input: { schema: GenerateColoringPageFromTextInputSchema },
    output: { schema: GenerateColoringPageFromTextOutputSchema },
    prompt: `Create a black-and-white line art illustration for a children’s coloring book based on the following inputs.

Description: {{{description}}}
Difficulty: {{{difficulty}}}

Rules:
- Style: Bold outlines, no colors, no shading, no gray areas.
- For 'Simple' difficulty, keep characters and objects very simple with minimal background detail.
- For 'Detailed' difficulty, you can add more objects and a richer background, but keep lines clean.
- Leave large empty spaces for coloring.
- Child-friendly, fun, and uncluttered design.
`,
    config: {
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        responseModalities: ['TEXT', 'IMAGE'],
        apiKey: process.env.IMAGE_TO_LINE_KEY,
    }
});


export const generateColoringPageFromTextFlow = ai.defineFlow(
  {
    name: 'generateColoringPageFromTextFlow',
    inputSchema: GenerateColoringPageFromTextInputSchema,
    outputSchema: GenerateColoringPageFromTextOutputSchema,
  },
  async (input) => {
    const { media } = await coloringPagePrompt(input);

    if (!media?.url) {
        throw new Error("Image generation failed to return a valid URL.");
    }
    
    return { coloringPageDataUri: media.url };
  }
);
