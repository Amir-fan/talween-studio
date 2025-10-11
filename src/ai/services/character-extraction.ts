'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CharacterDescriptionSchema = z.object({
  gender: z.enum(['male', 'female']).describe('The gender of the child in the photo'),
  age: z.number().describe('Approximate age of the child (3-12)'),
  physicalDescription: z.string().describe('Detailed physical description including hair color, eye color, skin tone, and distinctive features'),
  clothingDescription: z.string().describe('Description of clothing and accessories visible in the photo'),
  facialFeatures: z.string().describe('Detailed facial features including face shape, expressions, and unique characteristics'),
  overallAppearance: z.string().describe('Overall appearance and style that would be suitable for a coloring book character'),
});

/**
 * Extracts character description from uploaded child photo
 * This service analyzes the uploaded photo and provides detailed character information
 * for consistent story illustration generation
 */
export async function extractCharacterFromPhoto(
  photoDataUri: string,
  childName: string
): Promise<{
  success: boolean;
  characterDescription?: string;
  gender?: 'male' | 'female';
  error?: string;
}> {
  try {
    console.log('🎭 [CHARACTER EXTRACTION] Starting character analysis for:', childName);
    
    // Create AI prompt for character extraction
    const characterExtractionPrompt = ai.definePrompt({
      name: 'characterExtractionPrompt',
      input: z.object({
        childName: z.string(),
        photoDataUri: z.string(),
      }),
      output: { schema: CharacterDescriptionSchema },
      prompt: `You are an expert at analyzing photos of children and creating detailed character descriptions for storytelling and illustration.

Your task is to analyze the uploaded photo of a child named {{childName}} and provide a comprehensive character description that will be used to create consistent illustrations throughout a children's story.

Guidelines:
1. Carefully examine the photo to determine the child's gender, age, and physical characteristics
2. Focus on features that would be consistent across different poses and scenes
3. Provide detailed descriptions suitable for AI illustration generation
4. Consider how the character would look in a coloring book style
5. Be respectful and focus on positive, age-appropriate descriptions

Photo Analysis:
- Child's name: {{childName}}
- Photo: {{photoDataUri}}

Please analyze the photo and provide:
- Gender identification (male/female)
- Approximate age (3-12 years)
- Physical description (hair, eyes, skin tone, build)
- Clothing and accessories
- Facial features and expressions
- Overall appearance suitable for storytelling

Remember: This description will be used to create consistent character illustrations throughout a children's story, so accuracy and detail are crucial.`
    });

    // Generate character description
    const { output: characterAnalysis } = await characterExtractionPrompt({
      childName,
      photoDataUri,
    });

    if (!characterAnalysis) {
      throw new Error('Character analysis failed to return results');
    }

    // Create comprehensive character description for story generation
    const characterDescription = `A ${characterAnalysis.age}-year-old ${characterAnalysis.gender === 'male' ? 'boy' : 'girl'} named ${childName}. ${characterAnalysis.physicalDescription}. ${characterAnalysis.facialFeatures}. ${characterAnalysis.clothingDescription}. ${characterAnalysis.overallAppearance}. This character should be consistently portrayed throughout the story illustrations in a coloring book style, maintaining the same appearance, clothing, and distinctive features in every scene.`;

    console.log('✅ [CHARACTER EXTRACTION] Character analysis completed:', {
      gender: characterAnalysis.gender,
      age: characterAnalysis.age,
      descriptionLength: characterDescription.length
    });

    return {
      success: true,
      characterDescription,
      gender: characterAnalysis.gender,
    };

  } catch (error) {
    console.error('❌ [CHARACTER EXTRACTION] Failed to analyze character:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze character photo',
    };
  }
}

/**
 * Validates if the uploaded photo is suitable for character extraction
 */
export function validateCharacterPhoto(photoDataUri: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    // Basic validation
    if (!photoDataUri || !photoDataUri.startsWith('data:image/')) {
      return {
        isValid: false,
        error: 'Invalid image format. Please upload a valid image file.',
      };
    }

    // Check if it's a supported image type
    const supportedTypes = ['data:image/jpeg', 'data:image/png', 'data:image/webp'];
    const isSupported = supportedTypes.some(type => photoDataUri.startsWith(type));
    
    if (!isSupported) {
      return {
        isValid: false,
        error: 'Unsupported image format. Please use JPG, PNG, or WebP.',
      };
    }

    // Check file size (basic check - data URI length is roughly 4/3 of original size)
    if (photoDataUri.length > 7 * 1024 * 1024) { // ~5MB original
      return {
        isValid: false,
        error: 'Image file is too large. Please use an image smaller than 5MB.',
      };
    }

    return { isValid: true };

  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate image file.',
    };
  }
}
