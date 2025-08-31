
'use server';

import { checkAndDeductCredits } from '@/lib/credits';
import type { StoryAndPagesInput, StoryAndPagesOutput } from './page';
import { generateStoryContent, type StoryContent } from '@/ai/flows/generate-story-content';
import { generateImageFromDescription } from '@/ai/flows/generate-image-from-description';
import { z } from 'zod';
import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function createStoryAndColoringPages(
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
    
    // 1. Generate all story text content and image descriptions first.
    const storyContentResult = await generateStoryContent({
      childName: input.childName,
      age: input.ageGroup,
      place: input.setting,
      moralLesson: input.lesson,
      numPages: pageCount
    });

    if (!storyContentResult || !storyContentResult.pages || storyContentResult.pages.length === 0) {
      throw new Error('Story text generation failed to return any pages.');
    }

    // 2. Generate images for each page description.
    const pagesWithImages = await Promise.all(
      storyContentResult.pages.map(async (pageContent) => {
        const imageResult = await generateImageFromDescription({
          description: pageContent.illustrationDescription,
        });

        if (!imageResult.imageDataUri) {
          // If a single image fails, we still have the text.
          // We can decide to either fail the whole process or return with a placeholder.
          // For now, let's log the error and use a placeholder to not lose the whole story.
          console.error(`Image generation failed for page ${pageContent.pageNumber}.`);
          return {
            ...pageContent,
            imageDataUri: 'https://placehold.co/512x512/eee/ccc?text=Image+Failed', // Placeholder
          };
        }
        
        return {
          ...pageContent,
          imageDataUri: imageResult.imageDataUri,
        };
      })
    );
    
    const finalStory: StoryAndPagesOutput = {
      title: storyContentResult.title,
      pages: pagesWithImages,
    };

    // 3. Persist the final story to Firestore
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
    await Promise.all(finalStory.pages.map(page => {
      return pagesCollectionRef.doc(page.pageNumber.toString()).set({
        text: page.text,
        imageUrl: page.imageDataUri, // Note: storing as imageUrl
        pageNumber: page.pageNumber,
      });
    }));


    return { success: true, data: finalStory };
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
