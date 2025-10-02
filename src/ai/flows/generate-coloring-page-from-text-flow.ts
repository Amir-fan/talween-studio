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
  
  const { media } = await ai.generate({
    model: 'googleai/imagen-4.0-generate-preview-06-06',
    prompt: `Create a detailed black and white line art illustration for a children's coloring book.

Subject: ${description}
Difficulty: ${difficulty}

Requirements:
- Professional coloring book style with clean, bold black outlines
- NO COLORS - only black lines on white background
- No text, no words, no letters, no numbers
- Suitable for children to color
- Child-friendly design with clear, simple lines
- Leave large empty spaces for coloring`,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  if (!media?.url) {
    throw new Error("AI image generation failed to return a valid URL");
  }
  
  console.log('Successfully generated AI image:', media.url);
  return media.url;
}

export async function generateColoringPageFromTextFlow(input: GenerateColoringPageFromTextInput): Promise<GenerateColoringPageFromTextOutput> {
  console.log(`Generating coloring page for: ${input.description} (${input.difficulty})`);
  
  try {
    // Try real AI image generation first
    const coloringPageDataUri = await generateColoringPageFromText(input.description, input.difficulty);
    console.log('Successfully generated coloring page from text using AI:', coloringPageDataUri);
    return { coloringPageDataUri };
  } catch (error) {
    console.error('AI text-to-image generation failed, using fallback:', error);
    
    // Fallback to mock generation if AI fails
    console.log('Using fallback text-to-image generation...');
    try {
      const { createMockColoringPage } = await import('./mock-ai-fallback');
      const fallbackImageDataUri = createMockColoringPage(input.description);
      console.log('Successfully generated fallback coloring page from text');
      return { coloringPageDataUri: fallbackImageDataUri };
    } catch (fallbackError) {
      console.error('Fallback generation also failed:', fallbackError);
      // Ultimate fallback - return a simple mock
      return { coloringPageDataUri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9ImJsYWNrIj5Db2xvcmluZyBQYWdlPC90ZXh0Pjwvc3ZnPg==' };
    }
  }
}
