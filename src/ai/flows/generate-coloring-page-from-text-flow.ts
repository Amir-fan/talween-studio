'use server';
/**
 * @fileOverview Generates a coloring page from a text description and difficulty level.
 */

import {ai} from '@/ai/genkit';
import { generateWithRetryStrict, STRICT_BLACK_WHITE_PROMPT } from '@/lib/image-validation';
import { GenerateColoringPageFromTextInputSchema, GenerateColoringPageFromTextOutputSchema } from '@/app/create/word/types';
import type { GenerateColoringPageFromTextInput, GenerateColoringPageFromTextOutput } from '@/app/create/word/types';

const coloringPagePrompt = ai.definePrompt({
    name: 'coloringPagePrompt',
    input: { schema: GenerateColoringPageFromTextInputSchema },
    output: { schema: GenerateColoringPageFromTextOutputSchema },
    prompt: `Create a black-and-white line art illustration for a children's coloring book based on the following inputs.

Description: {{{description}}}
Difficulty: {{{difficulty}}}

Rules:
- Style: Bold outlines, no colors, no shading, no gray areas.
- For 'Simple' difficulty, keep characters and objects very simple with minimal background detail.
- For 'Detailed' difficulty, you can add more objects and a richer background, but keep lines clean.
- Leave large empty spaces for coloring.
- Child-friendly, fun, and uncluttered design.
`,
    config: {}
});


// Use real AI image generation directly
async function generateColoringPageFromText(description: string, difficulty: string): Promise<string> {
  console.log(`Generating AI image for: ${description} (${difficulty})`);
  
  const url = await generateWithRetryStrict(async () => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-generate-preview-06-06',
      prompt: `${STRICT_BLACK_WHITE_PROMPT}

Create a detailed black and white line art illustration for a children's coloring book.

Subject: ${description}
Difficulty: ${difficulty}

Additional Requirements:
- No text, no words, no letters, no numbers
- Leave large empty spaces for coloring`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    if (!media?.url) {
      throw new Error('AI image generation failed to return a valid URL');
    }
    return media.url;
  });

  console.log('Successfully generated AI image:', url);
  return url;
}

export async function generateColoringPageFromTextFlow(input: GenerateColoringPageFromTextInput): Promise<GenerateColoringPageFromTextOutput> {
  console.log(`Generating coloring page for: ${input.description} (${input.difficulty})`);
  
  // Strict: if the real model fails, bubble the error so the UI can show a proper message
  const coloringPageDataUri = await generateColoringPageFromText(input.description, input.difficulty);
  console.log('Successfully generated coloring page from text using AI:', coloringPageDataUri);
  return { coloringPageDataUri };
}
