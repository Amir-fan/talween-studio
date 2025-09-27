
'use server';

import { checkAndDeductCreditsForFeature } from '@/lib/local-credits';
import { generateColoringPageFromTextFlow } from '@/ai/flows/generate-coloring-page-from-text-flow';
import { contentDb } from '@/lib/simple-database';
import type { GenerateColoringPageFromTextInput, GenerateColoringPageFromTextOutput } from './types';


export async function generateImageAction(
  values: GenerateColoringPageFromTextInput
): Promise<{
  success: boolean;
  data?: GenerateColoringPageFromTextOutput;
  error?: string;
}> {
  try {
    console.log('🔍 SERVER ACTION - generateImageAction:');
    console.log('  - values.userId:', values.userId);
    console.log('  - values.description:', values.description);
    
    // Skip server-side credit check for admin users (client already handled credits)
    if (values.userId && values.userId !== 'admin') {
        console.log('🔍 Calling checkAndDeductCreditsForFeature...');
        const creditCheck = await checkAndDeductCreditsForFeature(
          values.userId, 
          'TEXT_TO_COLORING',
          `تحويل فكرة نصية إلى صفحة تلوين: ${values.description}`
        );
        console.log('  - creditCheck result:', creditCheck);
        
        if (!creditCheck.success) {
            console.log('❌ Credit check failed:', creditCheck.error);
            throw new Error(creditCheck.error === 'Not enough credits' ? 'NotEnoughCredits' : 'Failed to process credits.');
        }
        console.log('✅ Credit check passed');
    }

    const result = await generateColoringPageFromTextFlow(values);
    
    // Save coloring page to database
    if (result && values.userId) {
      const saveResult = contentDb.create(
        values.userId,
        `صفحة تلوين: ${values.description}`,
        'coloring',
        result,
        result.imageDataUri
      );

      if (!saveResult.success) {
        console.error('Failed to save coloring page to database:', saveResult.error);
      } else {
        console.log('Coloring page saved to database:', saveResult.content.id);
      }
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Image generation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية إنشاء الصورة. الرجاء المحاولة مرة أخرى.';
    
    if (errorMessage.includes('NotEnoughCredits')) {
        return { success: false, error: 'NotEnoughCredits' };
    }
    return { success: false, error: errorMessage };
  }
}
