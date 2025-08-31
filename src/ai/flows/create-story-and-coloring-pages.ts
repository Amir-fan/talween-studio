
'use server';
/**
 * @fileOverview Generates a story page (text and image) from a topic.
 * This flow is designed to be called iteratively by a server action to build a full story.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateStoryPageInputSchema = z.object({
  topic: z.string().describe('The topic for this specific story page.'),
  pageNumber: z.number().describe('The current page number in the story.'),
});
export type CreateStoryPageInput = z.infer<typeof CreateStoryPageInputSchema>;

const StoryPageSchema = z.object({
  text: z.string().describe('The text content of the page.'),
  imageDataUri: z.string().describe(
    "The image for the coloring page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
  ),
});
export type StoryPageOutput = z.infer<typeof StoryPageSchema>;

const pagePrompt = ai.definePrompt({
  name: 'storyPagePrompt',
  input: {schema: CreateStoryPageInputSchema},
  output: {schema: StoryPageSchema},
  prompt: `You are creating a single page for a children's story book. The page must have text and an illustration suitable for a coloring book.

Create page {{pageNumber}} of a story about: {{topic}}.

Your output must be a JSON object with two fields:
- "text": The text for this single page of the story. Keep it simple and age-appropriate.
- "imageDataUri": A base64 encoded data URI for the coloring book illustration.

Illustration rules:
- The image must be simple, black-and-white line art.
- No colors, no shading, no gray areas.
- Ensure the imageDataUri is a valid data URI string with the proper MIME type and base64 encoding.
`,
});

const createStoryPageFlow = ai.defineFlow(
  {
    name: 'createStoryPageFlow',
    inputSchema: CreateStoryPageInputSchema,
    outputSchema: StoryPageSchema,
  },
  async input => {
    const {output} = await pagePrompt(input);
    if (!output) {
      throw new Error("Failed to generate story page.");
    }
    return output;
  }
);

export async function createStoryAndColoringPage(
  input: CreateStoryPageInput
): Promise<StoryPageOutput> {
  return createStoryPageFlow(input);
}
