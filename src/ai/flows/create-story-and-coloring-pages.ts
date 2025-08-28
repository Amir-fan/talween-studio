'use server';
/**
 * @fileOverview Orchestrates the dual-API system to generate a complete story with coloring pages.
 * This server action coordinates the story content generation, image description generation,
 * and final image creation steps.
 */

import {z} from 'genkit';
import {v4 as uuidv4} from 'uuid';
import {generateStoryContent} from './generate-story-content';
import {generateImageDescriptions} from './generate-image-descriptions';
import {generateColoringPageFromDescription} from './generate-coloring-page-from-description';
import { checkAndDeductCredits } from '@/lib/credits';
import { auth } from '@/lib/firebase';

// Final combined output schema for a single page
const FinalStoryPageSchema = z.object({
  page_number: z.any().describe('Page number or cover'),
  text: z.string().describe('The text content of the page.'),
  interaction: z.string().nullable().optional().describe('Interactive question for the page.'),
  imageDataUri: z.string().describe('The generated coloring page image as a data URI.'),
});

// The input schema for the orchestrator, taken from the UI
export const CreateStoryAndColoringPagesInputSchema = z.object({
  childName: z.string().describe("Child's name in Arabic"),
  ageGroup: z.enum(['3-5', '6-8', '9-12']).describe('The age group of the child.'),
  numberOfPages: z.enum(['4', '8', '12', '16']).describe('The number of pages for the story.'),
  setting: z.string().describe("Location or 'auto-select'"),
  lesson: z.string().describe("Moral value or 'auto-select'"),
  artStyle: z.enum(['cartoon', 'semi-realistic', 'simple']).optional().default('cartoon'),
});
export type CreateStoryAndColoringPagesInput = z.infer<typeof CreateStoryAndColoringPagesInputSchema>;

// The final output schema that the UI will receive
export const CreateStoryAndColoringPagesOutputSchema = z.object({
  title: z.string(),
  pages: z.array(FinalStoryPageSchema).describe('The final generated story pages with text and images.'),
});
export type CreateStoryAndColoringPagesOutput = z.infer<typeof CreateStoryAndColoringPagesOutputSchema>;

/**
 * The main exported server action that orchestrates the story generation process.
 * @param input The user's preferences for the story.
 * @returns A promise that resolves to the complete story with images.
 */
export async function createStoryAndColoringPages(
  input: CreateStoryAndColoringPagesInput
): Promise<CreateStoryAndColoringPagesOutput> {

   const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated. Please log in to create a story.');
  }

  // Define credit cost based on page count
  const creditCost = {
    '4': 1,
    '8': 2,
    '12': 3,
    '16': 4,
  }[input.numberOfPages];

  // Check and deduct credits before proceeding
  const creditCheck = await checkAndDeductCredits(userId, creditCost);
  if (!creditCheck.success) {
    // If error is 'Not enough credits', we want to propagate that specific info
    if (creditCheck.error === 'Not enough credits') {
        throw new Error('NotEnoughCredits');
    }
    throw new Error(creditCheck.error || 'Failed to process credits.');
  }

  const storyId = `story_${uuidv4()}`;

  // Step 1: Generate Story Content
  const storyContent = await generateStoryContent({
    child_name: input.childName,
    age_group: input.ageGroup,
    number_of_pages: input.numberOfPages,
    setting: input.setting,
    lesson: input.lesson,
    story_id: storyId,
  });

  // Step 2: Generate Image Descriptions
  const imageDescriptions = await generateImageDescriptions({
    story_id: storyId,
    story_content: storyContent,
    child_age_group: input.ageGroup,
    art_style_preference: input.artStyle,
  });

  // Step 3: Generate an image for each description and combine with page text
  const finalPages = await Promise.all(
    storyContent.pages.map(async (page) => {
      // Find the matching image description
      const description = imageDescriptions.image_descriptions.find(
        (d) => d.page_reference === page.image_reference
      );

      if (!description) {
        // Handle cases where a description might be missing
        console.warn(`No image description found for page_reference: ${page.image_reference}`);
        // Return a page with a placeholder or default image if needed
        return {
          page_number: page.page_number,
          text: page.content,
          interaction: page.interaction,
          imageDataUri: '', // Or a placeholder data URI
        };
      }
      
      // Generate the actual coloring page image from the description
      const imageResult = await generateColoringPageFromDescription({
        description: description.image_prompt,
        childName: input.childName,
      });

      return {
        page_number: page.page_number,
        text: page.content,
        interaction: page.interaction,
        imageDataUri: imageResult.coloringPageDataUri,
      };
    })
  );

  return {
    title: storyContent.story_metadata.title,
    pages: finalPages.filter(p => p.imageDataUri), // Filter out any pages that failed image generation
  };
}
