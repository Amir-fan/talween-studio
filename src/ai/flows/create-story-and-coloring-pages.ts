'use server';
/**
 * @fileOverview Generates a story and corresponding coloring pages.
 *
 * - createStoryAndColoringPages - A function that handles the story and coloring page generation.
 * - CreateStoryAndColoringPagesInput - The input type for the createStoryAndColoringPages function.
 * - CreateStoryAndColoringPagesOutput - The return type for the createStoryAndColoringPages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateStoryAndColoringPagesInputSchema = z.object({
  topic: z.string().describe('The topic of the story.'),
  numPages: z.number().describe('The number of pages for the story.').default(3),
});
export type CreateStoryAndColoringPagesInput = z.infer<typeof CreateStoryAndColoringPagesInputSchema>;

const StoryPageSchema = z.object({
  text: z.string().describe('The text content of the page.'),
  imageDataUri: z.string().describe(
    "The image for the coloring page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
  ),
});

const CreateStoryAndColoringPagesOutputSchema = z.object({
  pages: z.array(StoryPageSchema).describe('The generated story pages with text and image data URIs.'),
});
export type CreateStoryAndColoringPagesOutput = z.infer<typeof CreateStoryAndColoringPagesOutputSchema>;

export async function createStoryAndColoringPages(
  input: CreateStoryAndColoringPagesInput
): Promise<CreateStoryAndColoringPagesOutput> {
  return createStoryAndColoringPagesFlow(input);
}

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

const createStoryAndColoringPagesFlow = ai.defineFlow(
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
      pages.push(output!);
    }
    return {pages};
  }
);
