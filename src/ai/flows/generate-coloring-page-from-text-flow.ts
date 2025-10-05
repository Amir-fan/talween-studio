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
  
  // Context-aware guidance to avoid incorrect outdoor street scenes with cars for children
  const hasSchoolContext = /\b(مدرس|مدرسة|صف|فصل|درس|تعليم|لوح|طالب|أطفال|طفل)\b/i.test(description)
    || /\b(child|kid|kids|class|lesson|school|teacher|students|classroom)\b/i.test(description);

  // Stronger guardrails for Detailed mode
  const strongClassroomGuard = `
Scene Setting (MANDATORY): INDOOR classroom interior. Absolutely NO streets, NO cars, NO traffic, NO sidewalks, NO road signs, NO vehicles, NO outdoor scenery. Keep background minimal (simple board or desk) and leave large white areas.`;

  const extraGuidance = hasSchoolContext
    ? strongClassroomGuard
    : `If no specific location is required, use a plain white background. Do NOT add streets, cars, traffic, or outdoor elements unless explicitly requested.`;

  const url = await generateWithRetryStrict(async () => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-generate-preview-06-06',
      prompt: `${STRICT_BLACK_WHITE_PROMPT}

Create a detailed black and white line art illustration for a children's coloring book.

Subject: ${description}
Difficulty: ${difficulty}

Additional Requirements:
- No text, no words, no letters, no numbers
- Leave large empty spaces for coloring
- ${extraGuidance}`,
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
