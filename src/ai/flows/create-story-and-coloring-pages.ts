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
  title: z.string().describe('The title of the story.'),
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
  input: {schema: z.object({topic: z.string(), pageNumber: z.number(), totalPages: z.number()})},
  output: {schema: StoryPageSchema},
  prompt: `You are creating page {{pageNumber}} of a {{totalPages}}-page children's story book. Each page will have text and an illustration suitable for a coloring book.

The story is about: {{topic}}.

The entire story must be in Arabic.

Your output for this page must include:
- text: the Arabic text for this specific page of the story.
- imageDataUri: a black-and-white, line-art illustration for the coloring book, returned as a base64 encoded data URI.

Make the illustration simple, cute, and suitable for coloring.
Ensure imageDataUri is a valid data URI with proper MIME type and base64 encoding.

Output in JSON format.
`,
});

const titlePrompt = ai.definePrompt({
    name: 'titlePrompt',
    input: { schema: z.object({ topic: z.string() }) },
    output: { schema: z.object({ title: z.string() }) },
    prompt: `Generate a short, creative story title in Arabic for a children's story about: {{topic}}. The title should be 3-5 words long.`,
});

const createStoryAndColoringPagesFlow = ai.defineFlow(
  {
    name: 'createStoryAndColoringPagesFlow',
    inputSchema: CreateStoryAndColoringPagesInputSchema,
    outputSchema: CreateStoryAndColoringPagesOutputSchema,
  },
  async input => {
    const titleResult = await titlePrompt({ topic: input.topic });
    const title = titleResult.output?.title || 'قصة جميلة';

    const pages = [];
    for (let i = 1; i <= input.numPages; i++) {
      try {
        const {output} = await pagePrompt({
          topic: input.topic,
          pageNumber: i,
          totalPages: input.numPages,
        });
        if (output) {
          pages.push(output);
        }
      } catch (error) {
        console.error(`Failed to generate page ${i}:`, error);
        // Silently skip the page if generation fails
      }
    }
    return {title, pages};
  }
);
