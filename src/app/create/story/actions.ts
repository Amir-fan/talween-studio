
'use server';

import { checkAndDeductCreditsForFeature } from '@/lib/local-credits';
import { createStoryAndColoringPagesFlow } from '@/ai/flows/create-story-and-coloring-pages';
// Removed Firebase dependencies - using local storage instead
import { v4 as uuidv4 } from 'uuid';
import type { StoryAndPagesInput, StoryAndPagesOutput } from './types';

export async function generateStoryAction(
  input: StoryAndPagesInput
): Promise<{ success: boolean; data?: StoryAndPagesOutput, error?: string; }> {

  try {
    if (!input.userId) {
      throw new Error('User not authenticated. Please log in to create a story.');
    }

    // Check and deduct credits for the feature
    const creditCheck = await checkAndDeductCreditsForFeature(
      input.userId, 
      'STORY_WITH_CHILD_NAME',
      `قصة باسم ${input.childName} (${input.numberOfPages} صفحات)`
    );
    if (!creditCheck.success) {
      throw new Error(creditCheck.error === 'Not enough credits' ? 'NotEnoughCredits' : 'Failed to process credits.');
    }
    
    const finalStory = await createStoryAndColoringPagesFlow(input);

    if (!finalStory || !finalStory.pages || finalStory.pages.length === 0) {
      throw new Error("Story generation flow failed to return complete data.");
    }

    // Story generated successfully - no database persistence needed for local version
    console.log('Story generated successfully:', finalStory.title);


    return { success: true, data: finalStory };
  } catch (error) {
    console.error('Story generation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية إنشاء القصة. الرجاء المحاولة مرة أخرى.';
    
    // The flow should have handled network issues with fallback, but if we still get here, 
    // it means there was a different type of error
    if (errorMessage.includes('Network connectivity issue') || errorMessage.includes('fetch failed')) {
      console.log('Network connectivity issue detected - flow should have handled this with fallback');
      // Don't return error, let the flow handle it with mock fallback
    }
    
    if (errorMessage.includes('NotEnoughCredits')) {
        return { success: false, error: 'NotEnoughCredits' };
    }

    return { success: false, error: errorMessage };
  }
}
