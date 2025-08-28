'use server';
import {
    createStoryAndColoringPages,
    CreateStoryAndColoringPagesInput,
    CreateStoryAndColoringPagesOutput,
  } from '@/ai/flows/create-story-and-coloring-pages';
  
  export async function generateStoryAction(
    values: CreateStoryAndColoringPagesInput
  ): Promise<{
    success: boolean;
    data?: CreateStoryAndColoringPagesOutput;
    error?: string;
  }> {
    try {
      const result = await createStoryAndColoringPages(values);
      return { success: true, data: result };
    } catch (error) {
      console.error('Story generation failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'فشلت عملية إنشاء القصة. الرجاء المحاولة مرة أخرى.';
      return { success: false, error: errorMessage };
    }
  }
  