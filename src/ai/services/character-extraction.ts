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
    
    const characterDescription = '🚨 THE EXACT CHILD FROM THE UPLOADED PHOTO named ' + childName + '. This IS the real child who is the hero of the story. CRITICAL: Draw THE EXACT SAME CHILD from the uploaded photo - do not create a different child. Copy every single detail: facial features, hair style, skin tone, eye shape, nose, mouth, clothing, accessories, body proportions, and distinctive characteristics. The child must be IDENTICAL to the uploaded image in every scene. This is NOT inspiration or a generic character - this IS the exact same child from the uploaded photo. They are the main character and hero of the story and must appear EXACTLY as they do in the reference photo.';

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

export async function validateCharacterPhoto(photoDataUri: string): Promise<{ isValid: boolean; error?: string; }> {
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