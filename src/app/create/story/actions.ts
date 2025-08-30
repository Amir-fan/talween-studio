
'use server';
/**
 * @fileOverview Orchestrates the dual-API system to generate a complete story with coloring pages.
 * This server action coordinates the story content generation, image description generation,
 * and final image creation steps.
 */

import {z} from 'genkit';
import {v4 as uuidv4} from 'uuid';
import {generateStoryContent, StoryContentOutput} from '@/ai/flows/generate-story-content';
import {generateColoringPageFromDescription} from '@/ai/flows/generate-coloring-page-from-description';
import { checkAndDeductCredits } from '@/lib/credits';
import { CreateStoryAndColoringPagesOutputSchema, CreateStoryAndColoringPagesOutput } from './page';

// The input schema for the orchestrator, taken from the UI
export const CreateStoryAndColoringPagesInputSchema = z.object({
  userId: z.string().describe("The authenticated user's ID."),
  childName: z.string().describe("Child's name in Arabic"),
  ageGroup: z.enum(['3-5', '6-8', '9-12']).describe('The age group of the child.'),
  numberOfPages: z.enum(['4', '8', '12', '16']).describe('The number of pages for the story.'),
  setting: z.string().describe("Location or 'auto-select'"),
  lesson: z.string().describe("Moral value or 'auto-select'"),
});
export type CreateStoryAndColoringPagesInput = z.infer<typeof CreateStoryAndColoringPagesInputSchema>;


/**
 * The main exported server action that orchestrates the story generation process.
 * @param input The user's preferences for the story.
 * @returns A promise that resolves to the complete story with images.
 */
export async function createStoryAndColoringPages(
  input: CreateStoryAndColoringPagesInput
): Promise<{ success: boolean; data?: CreateStoryAndColoringPagesOutput; error?: string; }> {

  try {
    if (!input.userId) {
      throw new Error('User not authenticated. Please log in to create a story.');
    }

    const pageCount = parseInt(input.numberOfPages, 10);
    const creditCost = Math.ceil(pageCount / 4); // 1 credit for 4 pages, 2 for 8, etc.

    // Check and deduct credits before proceeding
    const creditCheck = await checkAndDeductCredits(input.userId, creditCost);
    if (!creditCheck.success) {
      if (creditCheck.error === 'Not enough credits') {
          throw new Error('NotEnoughCredits');
      }
      throw new Error(creditCheck.error || 'Failed to process credits.');
    }

    const storyId = `story_${uuidv4()}`;

    // Step 1: Generate Story Content (Text and image descriptions)
    const storyContent: StoryContentOutput = await generateStoryContent({
      child_name: input.childName,
      age_group: input.ageGroup,
      number_of_pages: input.numberOfPages,
      setting: input.setting,
      lesson: input.lesson,
      story_id: storyId,
    });

    // Step 2: Generate an image for each description and combine with page text
    const finalPages = await Promise.all(
      storyContent.pages.map(async (page) => {

        if (!page.illustration_description) {
          console.warn(`No image description found for page_reference: ${page.page_number}`);
          return {
            page_number: page.page_number,
            text: page.content,
            imageDataUri: '', // Or a placeholder data URI
          };
        }
        
        // Generate the actual coloring page image from the description
        const imageResult = await generateColoringPageFromDescription({
          description: page.illustration_description,
          childName: input.childName,
        });

        return {
          page_number: page.page_number,
          text: page.content,
          imageDataUri: imageResult.coloringPageDataUri,
        };
      })
    );

    const data = {
      title: storyContent.story_metadata.title,
      pages: finalPages.filter(p => p.imageDataUri), // Filter out any pages that failed image generation
    };

    return { success: true, data };
  } catch (error) {
    console.error('Story generation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية إنشاء القصة. الرجاء المحاولة مرة أخرى.';
    
    if (errorMessage === 'NotEnoughCredits') {
        return { success: false, error: 'NotEnoughCredits' };
    }

    return { success: false, error: errorMessage };
  }
}
