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
import { generateColoringPageFromDescription } from './generate-coloring-page-from-description';


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
export type StoryPage = z.infer<typeof StoryPageSchema>;

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

const StoryContentSchema = z.object({
    chapterTitle: z.string().describe('The title of the chapter (2-4 words).'),
    narrative: z.string().describe('The narrative of the chapter (150-200 words).'),
    illustrationDescription: z.string().describe('A description for a coloring book illustration for this chapter.'),
});

const StoryGenerationOutputSchema = z.object({
  storyTitle: z.string().describe('The creative title of the story (3-5 words).'),
  chapters: z.array(StoryContentSchema).describe('An array of story chapters.'),
});

const storyPrompt = ai.definePrompt({
    name: 'storyStructurePrompt',
    input: {schema: z.object({topic: z.string(), numPages: z.number()})},
    output: {schema: StoryGenerationOutputSchema},
    prompt: `You are a children’s story generator. Create a wholesome story in Arabic.

Follow these rules:
1.  **Language:** The entire output (story title, chapter titles, narrative) MUST be in Arabic. The ONLY exception is 'illustrationDescription', which must be in English.
2.  **Story Elements:** The story should be about: {{{topic}}}.
3.  **Structure:**
    *   Generate a creative story title (3-5 words).
    *   Divide the story into exactly {{numPages}} chapters.
    *   Each chapter must have:
        *   chapterTitle: 2–4 words in Arabic.
        *   narrative: 100-150 words in simple, age-appropriate Arabic.
        *   illustrationDescription: A simple, clear description in English for a coloring book illustration (e.g., "A happy boy holding a red balloon in a sunny park").

Output in a valid JSON format.
`,
});

const createStoryAndColoringPagesFlow = ai.defineFlow(
  {
    name: 'createStoryAndColoringPagesFlow',
    inputSchema: CreateStoryAndColoringPagesInputSchema,
    outputSchema: CreateStoryAndColoringPagesOutputSchema,
  },
  async (input): Promise<CreateStoryAndColoringPagesOutput> => {
    // Step 1: Generate the story text content (titles, narratives, illustration descriptions)
    const { output: storyContent } = await storyPrompt(input);

    if (!storyContent?.chapters?.length) {
        throw new Error("Failed to generate story content.");
    }
    
    // Extract the main character's name from the topic for image consistency.
    // This is a simple heuristic and might need refinement.
    const childName = input.topic.split(' ').find(word => word.length > 2) || 'child';

    // Step 2: Generate images for each chapter in parallel
    const imagePromises = storyContent.chapters.map(chapter => 
        generateColoringPageFromDescription({
            description: chapter.illustrationDescription,
            childName: childName,
        })
    );
    
    const imageResults = await Promise.all(imagePromises);
    
    // Step 3: Combine text and images
    const pages: StoryPage[] = storyContent.chapters.map((chapter, index) => {
        const imageResult = imageResults[index];
        return {
            text: chapter.narrative,
            // Fallback to a placeholder if image generation failed for a page
            imageDataUri: imageResult?.coloringPageDataUri || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        };
    });

    return {
        title: storyContent.storyTitle,
        pages: pages,
    };
  }
);
