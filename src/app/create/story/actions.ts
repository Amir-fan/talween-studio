
'use server';
import 'server-only';

import { checkAndDeductCreditsForFeature } from '@/lib/local-credits';
import { createStoryAndColoringPagesFlow } from '@/ai/flows/create-story-and-coloring-pages';
// Load contentDb dynamically within the action to avoid bundling server-only modules in client context
import { v4 as uuidv4 } from 'uuid';
import type { StoryAndPagesInput, StoryAndPagesOutput } from './types';

export async function generateStoryAction(
  input: StoryAndPagesInput
): Promise<{ success: boolean; data?: StoryAndPagesOutput, error?: string; }> {

  try {
    if (!input.userId) {
      throw new Error('User not authenticated. Please log in to create a story.');
    }

    // Skip server-side credit check for admin users (client already handled credits)
    if (input.userId !== 'admin') {
      const creditCheck = await checkAndDeductCreditsForFeature(
        input.userId, 
        'STORY_WITH_CHILD_NAME',
        `قصة باسم ${input.childName} (${input.numberOfPages} صفحات)`,
        input.userEmail
      );
      if (!creditCheck.success) {
        const err = creditCheck.error || '';
        if (err.includes('Insufficient') || err.includes('Not enough')) {
          throw new Error('NotEnoughCredits');
        }
        throw new Error(creditCheck.error || 'Failed to process credits.');
      }
    }
    
    console.log('🔍 Starting story generation flow...');
    let finalStory: StoryAndPagesOutput;
    
    finalStory = await createStoryAndColoringPagesFlow(input);
    console.log('✅ Story generation successful');

    if (!finalStory || !finalStory.pages || finalStory.pages.length === 0) {
      throw new Error("Story generation flow failed to return complete data.");
    }

    // Save story to database (dynamic import keeps this server-only)
    const { contentDb } = await import('@/lib/simple-database');
    const saveResult = contentDb.create(
      input.userId,
      finalStory.title,
      'story',
      finalStory,
      finalStory.pages?.[0]?.imageDataUri // Use first page as thumbnail
    );

    if (!saveResult.success) {
      console.error('Failed to save story to database:', saveResult.error);
      // Still return the story even if saving fails
    } else {
      console.log('Story saved to database:', saveResult.content.id);
    }

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
