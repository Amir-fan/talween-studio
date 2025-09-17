'use server';

import { checkAndDeductCreditsForFeature } from '@/lib/local-credits';
import {
  generateColoringPageFromImage,
  GenerateColoringPageFromImageInput,
} from '@/ai/flows/generate-coloring-page-from-image';

export async function generateImageFromPhotoAction(
  values: GenerateColoringPageFromImageInput & { userId?: string }
): Promise<{
  success: boolean;
  data?: { coloringPageDataUri: string };
  error?: string;
}> {
  try {
    // Skip server-side credit check for admin users (client already handled credits)
    if (values.userId && values.userId !== 'admin') {
      const creditCheck = await checkAndDeductCreditsForFeature(
        values.userId, 
        'PHOTO_TO_COLORING',
        'تحويل صورة شخصية إلى صفحة تلوين'
      );
      if (!creditCheck.success) {
        throw new Error(creditCheck.error === 'Not enough credits' ? 'NotEnoughCredits' : 'Failed to process credits.');
      }
    }

    const result = await generateColoringPageFromImage(values);
    return { success: true, data: result };
  } catch (error) {
    console.error('Image from photo generation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية إنشاء الصورة. الرجاء المحاولة مرة أخرى.';
    
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
