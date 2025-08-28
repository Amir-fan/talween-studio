'use server';
/**
 * @fileOverview Orchestrates the generation of a story with coloring pages.
 * This flow coordinates calls to generate story content and then generate images.
 *
 * - createStoryAndColoringPages - The main orchestration function.
 * - CreateStoryAndColoringPagesInput - The input type for the orchestration function.
 * - CreateStoryAndColoringPagesOutput - The return type for the orchestration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateStoryContent, StoryContentOutput } from './generate-story-content';
import { generateImageDescriptions, ImageDescriptionOutput } from './generate-image-descriptions';
import { generateColoringPageFromDescription } from './generate-coloring-page-from-description';
import { checkAndDeductCredits } from '@/lib/credits';

const CreateStoryAndColoringPagesInputSchema = z.object({
  childName: z.string().describe("Child's name in Arabic"),
  ageGroup: z.enum(['3-5', '6-8', '9-12']).describe('The age group of the child.'),
  numPages: z.enum(['4', '8', '12', '16']).describe('The number of pages for the story.'),
  setting: z.string().describe('The location or setting of the story.'),
  lesson: z.string().describe('The moral value or lesson to be taught.'),
  userId: z.string().describe('The ID of the user requesting the story.'),
});
export type CreateStoryAndColoringPagesInput = z.infer<typeof CreateStoryAndColoringPagesInputSchema>;

const FinalStoryPageSchema = z.object({
  page_number: z.any(),
  content: z.string(),
  interaction: z.string().nullable().optional(),
  imageDataUri: z.string().describe("The image for the coloring page, as a data URI."),
});
export type FinalStoryPage = z.infer<typeof FinalStoryPageSchema>;

const CreateStoryAndColoringPagesOutputSchema = z.object({
  title: z.string().describe('The title of the story.'),
  pages: z.array(FinalStoryPageSchema).describe('The generated story pages with text and image data URIs.'),
});
export type CreateStoryAndColoringPagesOutput = z.infer<typeof CreateStoryAndColoringPagesOutputSchema>;


export async function createStoryAndColoringPages(
  input: CreateStoryAndColoringPagesInput
): Promise<CreateStoryAndColoringPagesOutput> {
  return createStoryAndColoringPagesFlow(input);
}


function calculateCost(numPagesStr: '4' | '8' | '12' | '16'): number {
    const numPages = parseInt(numPagesStr, 10);
    // 4 pages = 5 points, 8 pages = 10 points, 12 pages = 15 points, 16 pages = 20 points
    return Math.ceil(numPages * 1.25);
}

const createStoryAndColoringPagesFlow = ai.defineFlow(
  {
    name: 'createStoryAndColoringPagesFlow',
    inputSchema: CreateStoryAndColoringPagesInputSchema,
    outputSchema: CreateStoryAndColoringPagesOutputSchema,
  },
  async (input): Promise<CreateStoryAndColoringPagesOutput> => {
    // Step 0: Check and deduct credits
    const cost = calculateCost(input.numPages);
    const creditCheck = await checkAndDeductCredits(input.userId, cost);
    if (!creditCheck.success) {
        throw new Error(creditCheck.error || 'Failed to deduct credits.');
    }

    const storyId = `story_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Step 1: Generate Story Content
    const storyContent: StoryContentOutput = await generateStoryContent({
        child_name: input.childName,
        age_group: input.ageGroup,
        number_of_pages: input.numPages,
        setting: input.setting,
        lesson: input.lesson,
        story_id: storyId,
    });
    
    // Step 2: Generate Image Descriptions
    const imageDescriptions: ImageDescriptionOutput = await generateImageDescriptions({
        story_id: storyId,
        story_content: storyContent,
        child_age_group: input.ageGroup,
        art_style_preference: 'cartoon',
    });

    // Step 3: Generate Images in parallel from descriptions
    const imageGenerationPromises = imageDescriptions.image_descriptions.map(desc =>
        generateColoringPageFromDescription({
            description: desc.image_prompt,
            childName: input.childName,
        }).catch(err => {
            console.error(`Failed to generate image for page ${desc.page_reference}:`, err);
            return { coloringPageDataUri: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' }; // Return a placeholder on error
        })
    );

    const generatedImages = await Promise.all(imageGenerationPromises);
    
    // Step 4: Combine story content with generated images
    const finalPages: FinalStoryPage[] = storyContent.pages.map((page) => {
        // Find the corresponding image description first to ensure we match correctly
        const imageDesc = imageDescriptions.image_descriptions.find(d => d.page_reference === page.image_reference);
        const imageIndex = imageDesc ? imageDescriptions.image_descriptions.indexOf(imageDesc) : -1;
        const correspondingImage = imageIndex !== -1 ? generatedImages[imageIndex] : null;

        return {
            page_number: page.page_number,
            content: page.content,
            interaction: page.interaction,
            imageDataUri: correspondingImage?.coloringPageDataUri || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Placeholder on failure
        };
    });

    return {
        title: storyContent.story_metadata.title,
        pages: finalPages,
    };
  }
);
