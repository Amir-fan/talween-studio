'use server';
/**
 * @fileOverview Generates a story and corresponding coloring pages.
 * This flow is self-contained and handles both text and image generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for a single page of the story
const StoryPageSchema = z.object({
  text: z.string().describe('The text content of the page in Arabic.'),
  imageDataUri: z.string().describe(
    "The image for the coloring page, as a data URI. Should be a simple black and white line drawing."
  ),
});
export type StoryPage = z.infer<typeof StoryPageSchema>;

// Define the input schema for the main flow
export const CreateStoryAndColoringPagesInputSchema = z.object({
  topic: z.string().describe('The topic of the story.'),
  numPages: z.number().describe('The number of pages for the story.').default(3),
});
export type CreateStoryAndColoringPagesInput = z.infer<typeof CreateStoryAndColoringPagesInputSchema>;

// Define the output schema for the main flow
export const CreateStoryAndColoringPagesOutputSchema = z.object({
  pages: z.array(StoryPageSchema).describe('The generated story pages with text and image data URIs.'),
});
export type CreateStoryAndColoringPagesOutput = z.infer<typeof CreateStoryAndColoringPagesOutputSchema>;


/**
 * An exported function that can be called from server components or actions.
 * @param input The topic and number of pages for the story.
 * @returns A promise that resolves to the generated story pages.
 */
export async function createStoryAndColoringPages(
  input: CreateStoryAndColoringPagesInput
): Promise<CreateStoryAndCrayolaPagesOutput> {
  return createStoryAndColoringPagesFlow(input);
}


// This is the main Genkit flow that orchestrates the story creation.
const createStoryAndColoringPagesFlow = ai.defineFlow(
  {
    name: 'createStoryAndColoringPagesFlow',
    inputSchema: CreateStoryAndColoringPagesInputSchema,
    outputSchema: CreateStoryAndColoringPagesOutputSchema,
  },
  async (input) => {
    // We create a new prompt definition for each page to ensure clean execution.
    const pagePrompt = ai.definePrompt({
      name: 'storyPagePrompt',
      input: { schema: z.object({ topic: z.string(), pageNumber: z.number() }) },
      output: { schema: StoryPageSchema },
      prompt: `You are creating a children's story book. Each page will have text and an illustration suitable for a coloring book.

Create page {{pageNumber}} of a story about {{topic}}.

Your output must be a valid JSON object and include:
- text: the text for this page of the story, written in Arabic.
- imageDataUri: a data URI for the illustration. The illustration must be a simple black and white line drawing suitable for a children's coloring book, with no colors or shading.

Ensure imageDataUri is a valid data URI with proper MIME type and base64 encoding.
`,
    });

    // Generate all pages in parallel for efficiency.
    const pagePromises = Array.from({ length: input.numPages }, (_, i) =>
      pagePrompt({
        topic: input.topic,
        pageNumber: i + 1,
      })
    );

    const results = await Promise.all(pagePromises);
    
    // Extract the output from each result.
    const pages = results.map(result => {
        if (!result.output) {
            throw new Error('A page generation failed to produce output.');
        }
        return result.output;
    });

    return { pages };
  }
);
