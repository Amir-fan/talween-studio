'use server';
import 'server-only';

import { checkAndDeductCreditsForFeature } from '@/lib/local-credits';
import {
  generateColoringPageFromImage,
  GenerateColoringPageFromImageInput,
} from '@/ai/flows/generate-coloring-page-from-image';
// Avoid eager import of fs-based DB in client bundles; load at call time

export async function generateImageFromPhotoAction(
  values: GenerateColoringPageFromImageInput & { userId?: string; userEmail?: string }
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
        'تحويل صورة شخصية إلى صفحة تلوين',
        values.userEmail
      );
      if (!creditCheck.success) {
        const err = creditCheck.error || '';
        if (err.includes('Insufficient') || err.includes('Not enough')) {
          throw new Error('NotEnoughCredits');
        }
        throw new Error(creditCheck.error || 'Failed to process credits.');
      }
    }

    console.log('🔍 Starting image generation flow...');
    let result: { coloringPageDataUri: string };
    
    try {
      result = await generateColoringPageFromImage(values);
      console.log('✅ Image generation successful');
    } catch (imageError) {
      console.error('❌ Image generation failed (strict):', imageError);
      throw imageError;
    }
    
    // Save image conversion to database (dynamic import to keep server-only)
    if (result && values.userId) {
      try {
        const { contentDb } = await import('@/lib/simple-database');
        const saveResult = contentDb.create(
          values.userId,
          'تحويل صورة إلى صفحة تلوين',
          'image',
          result,
          result.coloringPageDataUri
        );

        if (!saveResult.success) {
          console.error('Failed to save image conversion to database:', saveResult.error);
        } else {
          console.log('Image conversion saved to database:', saveResult.content.id);
        }
      } catch (saveError) {
        console.error('Failed to save to database (non-critical):', saveError);
        // Don't fail the whole operation if saving fails
      }
    }
    
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
