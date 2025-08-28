'use server';
/**
 * @fileOverview A self-contained flow to generate a complete story with text and coloring pages.
 * This file is designed to be a compliant Next.js server action.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StoryPageSchema = z.object({
  text: z.string().describe('The text content of the page.'),
  imageDataUri: z.string().describe(
    "The image for the coloring page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});

export const CreateStoryAndColoringPagesInputSchema = z.object({
  topic: z.string().describe('The topic of the story.'),
  numPages: z.number().describe('The number of pages for the story.').default(3),
});
export type CreateStoryAndColoringPagesInput = z.infer<typeof CreateStoryAndColoringPagesInputSchema>;

export const CreateStoryAndColoringPagesOutputSchema = z.object({
  pages: z.array(StoryPageSchema).describe('The generated story pages with text and image data URIs.'),
});
export type CreateStoryAndColoringPagesOutput = z.infer<typeof CreateStoryAndColoringPagesOutputSchema>;

/**
 * An exported async function that can be called from server components or actions.
 * This is the ONLY function exported, which complies with "use server" rules.
 * @param input The topic and number of pages for the story.
 * @returns A promise that resolves to the generated story pages.
 */
export async function createStoryAndColoringPages(
  input: CreateStoryAndColoringPagesInput
): Promise<CreateStoryAndColoringPagesOutput> {
  
  // Define the prompt internally to this function's scope
  const pagePrompt = ai.definePrompt({
    name: 'pagePrompt',
    input: {schema: z.object({topic: z.string(), pageNumber: z.number()})},
    output: {schema: StoryPageSchema},
    prompt: `You are creating a children's story book. Each page will have text and an illustration suitable for a coloring book.

Create page {{pageNumber}} of a story about {{topic}}.

Your output should include:
- text: the text for this page of the story in Arabic.
- imageDataUri: a base64 encoded data URI for the coloring book illustration. Make the illustration simple, black and white line art, and suitable for coloring.

Ensure imageDataUri is a valid data URI with proper MIME type and base64 encoding.

Output in JSON format:
`,
  });

  // Define the flow internally as well.
  const createStoryAndColoringPagesFlow = ai.defineFlow(
    {
      name: 'createStoryAndColoringPagesFlow',
      inputSchema: CreateStoryAndColoringPagesInputSchema,
      outputSchema: CreateStoryAndColoringPagesOutputSchema,
    },
    async (flowInput) => {
        const pagePromises = [];
        for (let i = 1; i <= flowInput.numPages; i++) {
            pagePromises.push(
                pagePrompt({
                    topic: flowInput.topic,
                    pageNumber: i,
                })
            );
        }

        const results = await Promise.all(pagePromises);
        
        const pages = results.map(result => {
            if (!result.output) {
                throw new Error(`Page generation failed for one of the pages.`);
            }
            return result.output;
        });

        return { pages };
    }
  );

  // Execute the internally defined flow
  return createStoryAndColoringPagesFlow(input);
}
