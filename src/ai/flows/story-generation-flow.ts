/**
 * @fileOverview Defines the Genkit flows for story and image generation.
 * This file contains the core AI logic and does NOT use the 'use server' directive.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StoryPageSchema = z.object({
  text: z.string().describe('The text content of the page.'),
  imageDataUri: z
    .string()
    .describe(
      "The image for the coloring page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});

export const CreateStoryAndColoringPagesInputSchema = z.object({
  topic: z.string().describe('The topic of the story.'),
  numPages: z.number().describe('The number of pages for the story.').default(3),
});

export const CreateStoryAndColoringPagesOutputSchema = z.object({
  pages: z
    .array(StoryPageSchema)
    .describe(
      'The generated story pages with text and image data URIs.'
    ),
});

const pagePrompt = ai.definePrompt({
  name: 'pagePrompt',
  input: {schema: z.object({topic: z.string(), pageNumber: z.number()})},
  output: {schema: StoryPageSchema},
  prompt: `You are creating a children's story book. Each page will have text and an illustration suitable for a coloring book.

Create page {{pageNumber}} of a story about {{topic}}.

Your output should include:
- text: the text for this page of the story
- imageDataUri: a base64 encoded data URI for the coloring book illustration

Make the illustration simple and suitable for coloring.

Ensure imageDataUri is a valid data URI with proper MIME type and base64 encoding.

Output in JSON format:
`,
});

export const createStoryAndColoringPagesFlow = ai.defineFlow(
  {
    name: 'createStoryAndColoringPagesFlow',
    inputSchema: CreateStoryAndColoringPagesInputSchema,
    outputSchema: CreateStoryAndColoringPagesOutputSchema,
  },
  async input => {
    const pages = [];
    for (let i = 1; i <= input.numPages; i++) {
      const {output} = await pagePrompt({
        topic: input.topic,
        pageNumber: i,
      });
      if (output) {
        pages.push(output);
      }
    }
    return {pages};
  }
);


// Flow for generating coloring page from text
const GenerateColoringPageFromTextInputSchema = z.object({
  description: z.string().describe('The description of the coloring page to generate.'),
  difficulty: z.string().describe('The difficulty of the coloring page (e.g., Simple, Detailed).').optional().default('Simple'),
});

const GenerateColoringPageFromTextOutputSchema = z.object({
  coloringPageDataUri: z.string().describe('The generated coloring page as a data URI.'),
});

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
);
