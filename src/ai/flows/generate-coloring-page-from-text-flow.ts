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
  const isDetailed = /detailed|مفصل/i.test(difficulty || '');
  const strongClassroomGuard = `
Scene Setting (MANDATORY): INDOOR classroom interior only.
Allowed elements: child, simple desk, chair, plain whiteboard/blackboard outline. Optional: one window with pure white fill (no outdoor view).
Forbidden elements (must NOT appear): street, road, sidewalk, crosswalk, car, bus, truck, bike, traffic light, traffic signs, billboards, buildings, city, trees, bushes, park, clouds, sun, mountains, any outdoor scenery.
Background must stay mostly EMPTY WHITE with a few clean classroom hints only.
Any signs must be BLANK SHAPES with no letters.
`;

  const extraGuidance = hasSchoolContext
    ? strongClassroomGuard + (isDetailed ? `
Detail policy: add detail ONLY to the subject (child pose, clothing folds, hair lines) and small classroom props. Do NOT add exterior detail or outdoor context. Leave large white areas for coloring.
NEGATIVE PROMPT (MANDATORY): street, road, sidewalk, crosswalk, vehicle, car, bus, truck, bike, scooter, traffic light, traffic sign, billboard, city, buildings, skyline, park, tree, bush, mountain, cloud, sun.
` : '')
    : `If no specific location is required, use a plain white background. Do NOT add streets, cars, traffic, or outdoor elements unless explicitly requested.`;

  // Build a subject that encodes constraints directly in the content (Arabic + English)
  // Canonical subject to anchor composition firmly indoors (Arabic + English hints)
  const canonicalArabicSubject = `طفل يقف داخل الفصل أمام سبورة بيضاء فارغة، يمسك بعصا تعليمية ويشير إلى السبورة. كاميرا قريبة من الطفل (نصف الجسم)، لا تظهر أي نوافذ أو مناظر خارجية.`;
  const arabicClassroomSubject = `داخل الصف/الفصل من الداخل فقط، بدون أي شوارع أو سيارات أو مباني خارجية أو إشارات مرور أو أشجار أو سماء أو رصيف أو طريق.
خلفية بيضاء وبسيطة مع سبورة بيضاء فارغة أو طاولة فقط.
لا نصوص أو حروف على السبورة أو اللافتات.
الطفل يشرح الدرس داخل الفصل.`;

  const subjectForModel = hasSchoolContext
    ? `${canonicalArabicSubject}\n${description}\n${arabicClassroomSubject}\n(INDOOR classroom only, NO street/cars/vehicles/traffic/outdoor, CLOSE CROP on child + whiteboard)`
    : description;

  const url = await generateWithRetryStrict(async () => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-generate-preview-06-06',
      prompt: `${STRICT_BLACK_WHITE_PROMPT}

Create a detailed black and white line art illustration for a children's coloring book.

Subject: ${subjectForModel}
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
