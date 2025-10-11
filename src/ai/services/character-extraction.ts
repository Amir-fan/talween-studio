'use server';

import { ai } from '@/ai/genkit';

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
    console.log('🎭 CHARACTER EXTRACTION: Starting detailed AI analysis for:', childName);
    
    // Use AI to analyze the uploaded photo and create detailed character description
    const characterAnalysisPrompt = ai.definePrompt({
      name: 'characterAnalysis',
      inputSchema: {
        photoDataUri: { type: 'string', description: 'Base64 encoded photo of the child' },
        childName: { type: 'string', description: 'Name of the child' }
      },
      outputSchema: {
        detailedDescription: { type: 'string', description: 'Extremely detailed physical description of the child' },
        gender: { type: 'string', enum: ['male', 'female'], description: 'Gender of the child' },
        ageEstimate: { type: 'number', description: 'Estimated age of the child' }
      },
      prompt: `You are an expert character analyst. Analyze the uploaded photo of a child named {{childName}} and provide an EXTREMELY DETAILED physical description that will be used to draw this exact child in a story.

CRITICAL REQUIREMENTS:
1. Look at EVERY detail in the photo
2. Describe the child in extreme detail for accurate reproduction
3. Include specific measurements, colors, shapes, and characteristics
4. This description will be used to draw the EXACT same child

Provide a detailed physical description including:
- AGE: Exact estimated age
- GENDER: Male or female
- FACE SHAPE: Specific face shape (round, oval, square, heart, etc.)
- EYES: Exact color, shape (almond, round, hooded), size (large/small/medium), eyebrow details
- NOSE: Size (small/medium/large), shape (button, straight, upturned), width (narrow/medium/wide)
- MOUTH: Lip size (thin/medium/full), smile shape, teeth visibility
- CHEEKS: Fullness (chubby/defined), dimples (present/absent)
- CHIN: Shape (pointed/round/square), size (prominent/subtle)
- SKIN TONE: Exact skin color with undertones (light olive, medium tan, dark brown, etc.)
- COMPLEXION: Clear, freckled, birthmarks, any skin characteristics
- HAIR: Exact color shade, length (short/medium/long), texture (straight/wavy/curly), specific style (bangs, braids, ponytail, etc.), parting (center/side/none)
- BODY BUILD: Slim/average/stocky, height relative to age
- CLOTHING: Exact colors, patterns, style, accessories visible in photo
- DISTINCTIVE FEATURES: Glasses, jewelry, scars, birthmarks, unique characteristics

Be extremely specific about colors, shapes, and proportions. This description will be used to recreate this EXACT child.`
    });

    const { output: analysis } = await characterAnalysisPrompt({
      photoDataUri,
      childName
    });

    if (!analysis || !analysis.detailedDescription) {
      throw new Error('AI character analysis failed to return detailed description');
    }

    // Create the final character description with extreme detail
    const characterDescription = `🚨 THE EXACT CHILD FROM THE UPLOADED PHOTO named ${childName}. This IS the real child who is the hero of the story. CRITICAL: Draw THE EXACT SAME CHILD from the uploaded photo - do not create a different child.

DETAILED PHYSICAL DESCRIPTION - COPY EXACTLY:
${analysis.detailedDescription}

MANDATORY COPYING REQUIREMENTS:
- Copy the EXACT facial structure and bone structure from the reference photo
- Copy the EXACT eye shape, color, size, and expression
- Copy the EXACT nose shape, size, and proportions
- Copy the EXACT mouth shape, lip size, and smile
- Copy the EXACT hair color, style, texture, and length
- Copy the EXACT skin tone, complexion, and facial features
- Copy the EXACT clothing, colors, patterns, and accessories
- Copy the EXACT body proportions, build, and age appearance
- Copy ANY distinctive features, birthmarks, scars, or unique characteristics
- Copy the EXACT age and maturity level appearance

This child must be IDENTICAL to the uploaded image in every scene. They are the main character and hero of the story and must appear EXACTLY as they do in the reference photo. Do NOT change their appearance, age, or any physical characteristics.`;

    console.log('✅ CHARACTER EXTRACTION: Detailed AI analysis completed');

    return {
      success: true,
      characterDescription,
      gender: analysis.gender || 'male',
    };

  } catch (error) {
    console.error('❌ CHARACTER EXTRACTION: Failed to analyze character:', error);
    
    // Fallback to detailed manual description if AI fails
    const fallbackDescription = `🚨 THE EXACT CHILD FROM THE UPLOADED PHOTO named ${childName}. This IS the real child who is the hero of the story. CRITICAL: Draw THE EXACT SAME CHILD from the uploaded photo - do not create a different child.

DETAILED PHYSICAL DESCRIPTION - COPY EXACTLY:
- AGE: Child appears to be approximately 6-12 years old (typical story age range)
- GENDER: ${childName} (gender from context)
- FACE: Look at the uploaded photo and copy the EXACT face shape, proportions, and features
- EYES: Copy the EXACT eye color, shape, size, and eyebrow details from the photo
- NOSE: Copy the EXACT nose shape, size, and proportions from the photo
- MOUTH: Copy the EXACT mouth shape, lip size, and smile from the photo
- SKIN TONE: Copy the EXACT skin color and complexion from the photo
- HAIR: Copy the EXACT hair color, style, length, and texture from the photo
- CLOTHING: Copy the EXACT clothing, colors, and accessories from the photo
- DISTINCTIVE FEATURES: Copy ANY unique characteristics, birthmarks, or features visible in the photo

MANDATORY COPYING REQUIREMENTS:
- Copy EVERY single detail visible in the uploaded photo
- The child must look IDENTICAL to the reference image
- Do NOT change their appearance, age, or any physical characteristics
- This is the EXACT same child from the uploaded photo

This child must be IDENTICAL to the uploaded image in every scene. They are the main character and hero of the story.`;

    return {
      success: true,
      characterDescription: fallbackDescription,
      gender: 'male',
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