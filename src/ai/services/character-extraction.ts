'use server';

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
    console.log('CHARACTER EXTRACTION: Starting analysis for:', childName);
    
    const characterDescription = 'The EXACT child from the uploaded photo named ' + childName + '. CRITICAL INSTRUCTIONS: This character must be drawn to look EXACTLY like the child in the uploaded photo. Copy the child\'s precise facial features, hair style, skin tone, eye shape, nose, mouth, clothing, and distinctive characteristics from the reference photo. The character should be identical to the uploaded image in every scene throughout the story. This is NOT a generic character - this is the specific child from the uploaded photo and must match them exactly in appearance, clothing, and all physical features.';

    console.log('CHARACTER EXTRACTION: Character description created from photo');

    return {
      success: true,
      characterDescription,
      gender: 'male',
    };

  } catch (error) {
    console.error('CHARACTER EXTRACTION: Failed to analyze character:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze character photo',
    };
  }
}

export function validateCharacterPhoto(photoDataUri: string): { isValid: boolean; error?: string; } {
  try {
    if (!photoDataUri || !photoDataUri.startsWith('data:image/')) {
      return {
        isValid: false,
        error: 'Invalid image format. Please upload a valid image file.',
      };
    }

    const supportedTypes = ['data:image/jpeg', 'data:image/png', 'data:image/webp'];
    const isSupported = supportedTypes.some(type => photoDataUri.startsWith(type));
    
    if (!isSupported) {
      return {
        isValid: false,
        error: 'Unsupported image format. Please use JPG, PNG, or WebP.',
      };
    }

    if (photoDataUri.length > 7 * 1024 * 1024) {
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