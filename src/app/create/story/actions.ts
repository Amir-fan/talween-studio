'use server';

import {
  createStoryAndColoringPages as createStoryFlow,
  CreateStoryAndColoringPagesInput,
} from '@/ai/flows/create-story-and-coloring-pages';
import { checkAndDeductCredits } from '@/lib/credits';
import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { StoryAndPagesInput } from './page';

export async function createStoryAndColoringPages(
  input: StoryAndPagesInput
): Promise<{ success: boolean; data?: { title: string, pages: any[] }, error?: string; }> {

  try {
    if (!input.userId) {
      throw new Error('User not authenticated. Please log in to create a story.');
    }

    const pageCount = parseInt(input.numberOfPages, 10);
    const creditCost = Math.ceil(pageCount / 4);

    const creditCheck = await checkAndDeductCredits(input.userId, creditCost);
    if (!creditCheck.success) {
      throw new Error(creditCheck.error === 'Not enough credits' ? 'NotEnoughCredits' : 'Failed to process credits.');
    }
    
    const topic = `A story about a child named ${input.childName}, who is in the age group ${input.ageGroup}, taking place in ${input.setting}, and learning a lesson about ${input.lesson}.`;
    
    const storyResult = await createStoryFlow({ topic, numPages: pageCount });

    if (!storyResult || !storyResult.pages || storyResult.pages.length === 0) {
      throw new Error('Story generation failed to return any pages.');
    }
    
    const storyTitle = `The Adventures of ${input.childName}`;

    // TODO: Persist the story to Firestore
    
    const data = {
      title: storyTitle,
      pages: storyResult.pages,
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
