
'use server';

import { checkAndDeductCredits } from '@/lib/credits';
import { createStoryAndColoringPagesFlow } from '@/ai/flows/create-story-and-coloring-pages';
import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { StoryAndPagesInput, StoryAndPagesOutput } from './types';

export async function generateStoryAction(
  input: StoryAndPagesInput
): Promise<{ success: boolean; data?: StoryAndPagesOutput, error?: string; }> {

  try {
    if (!input.userId) {
      throw new Error('User not authenticated. Please log in to create a story.');
    }

    const pageCount = parseInt(input.numberOfPages, 10);
    // As per spec: 1 point per 4 pages.
    const creditCost = Math.ceil(pageCount / 4);

    const creditCheck = await checkAndDeductCredits(input.userId, creditCost);
    if (!creditCheck.success) {
      throw new Error(creditCheck.error === 'Not enough credits' ? 'NotEnoughCredits' : 'Failed to process credits.');
    }
    
    const finalStory = await createStoryAndColoringPagesFlow(input);

    if (!finalStory || !finalStory.pages || finalStory.pages.length === 0) {
      throw new Error("Story generation flow failed to return complete data.");
    }

    // Persist the final story to Firestore
    const storyId = uuidv4();
    const storyRef = dbAdmin.collection('stories').doc(storyId);
    
    await storyRef.set({
      userId: input.userId,
      title: finalStory.title,
      createdAt: FieldValue.serverTimestamp(),
      childName: input.childName,
      ageGroup: input.ageGroup,
      setting: input.setting,
      lesson: input.lesson,
      thumbnailUrl: finalStory.pages[0]?.imageDataUri || '',
    });

    const pagesCollectionRef = storyRef.collection('pages');
    const pagePromises = finalStory.pages.map(page => {
      return pagesCollectionRef.doc(page.pageNumber.toString()).set({
        text: page.text,
        imageUrl: page.imageDataUri, // Note: storing as imageUrl
        pageNumber: page.pageNumber,
      });
    });
    await Promise.all(pagePromises);


    return { success: true, data: finalStory };
  } catch (error) {
    console.error('Story generation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية إنشاء القصة. الرجاء المحاولة مرة أخرى.';
    
    if (errorMessage.includes('NotEnoughCredits')) {
        return { success: false, error: 'NotEnoughCredits' };
    }

    return { success: false, error: errorMessage };
  }
}
