
'use server';
/**
 * @fileOverview Generates a story and corresponding coloring pages.
 *
 * - createStoryAndColoringPages - A function that handles the story and coloring page generation.
 * - CreateStoryAndColoringPagesInput - The input type for the createStoryAndColoringPages function.
 * - CreateStoryAndColoringPagesOutput - The return type for the createStoryAndColoringPages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// Remove mock fallbacks; enforce strict generation
import { StoryAndPagesInputSchema, StoryAndPagesOutputSchema } from '@/app/create/story/types';
import type { StoryAndPagesOutput, StoryAndPagesInput } from '@/app/create/story/types';
import { generateWithRetryStrict, STRICT_BLACK_WHITE_PROMPT } from '@/lib/image-validation';
import { extractCharacterFromPhoto, validateCharacterPhoto } from '@/ai/services/character-extraction';


const ChapterSchema = z.object({
    chapterTitle: z.string().describe('The title of the chapter.'),
    narrative: z.string().describe('The text content of the chapter.'),
    illustrationDescription: z.string().describe('A simple description of an illustration for this chapter.'),
});

const StoryContentSchema = z.object({
    title: z.string().describe('The title of the entire story.'),
    chapters: z.array(ChapterSchema).describe('An array of chapters, each with text and an illustration description.'),
    characterDescription: z.string().describe("A detailed description of the main character's appearance (face, hair, clothes) for a reference image."),
});


const storyContentPrompt = ai.definePrompt({
    name: 'storyContentPrompt',
    input: { schema: StoryAndPagesInputSchema.pick({ childName: true, ageGroup: true, setting: true, lesson: true, numberOfPages: true}) },
    output: { schema: StoryContentSchema },
    prompt: `You are a children's story generator that creates engaging, educational stories in Arabic designed for coloring books.

Instructions:

Required Inputs:
Main character name: {{childName}}
Age: {{ageGroup}}
Place/Setting: {{setting}}
Lesson/Moral: {{lesson}}
Number of pages requested: {{numberOfPages}}

Story Rules:
Language: Arabic only.
Story length: Create EXACTLY {{numberOfPages}} chapters - one chapter per page requested.
Each chapter must include: • Chapter Title (2–3 words). • Narrative (60–80 words) suitable for {{ageGroup}} years old. • Illustration Description: a simple, concrete scene description for coloring.

Story Structure:
- Simple beginning, middle, and end
- Fun, child-friendly tone with basic vocabulary
- Each chapter should advance the plot toward the lesson
- Use simple, clear sentences
- Include some dialogue and action
- CRITICAL: The main character must remain the SAME person throughout all chapters

Character Description:
Provide a simple "characterDescription" of the main character's appearance (face, hair, clothes). Keep it brief and clear.

GENDER RULES:
- BOY: No hijab or head covering
- GIRL + Islamic setting: Hijab covering hair
- GIRL + secular setting: Normal clothing without hijab

Illustration Description Rules:
- One simple scene per chapter
- Basic line art description: "{{childName}} at {{setting}} doing [action]"
- No colors, shading, or gray — line art only
- Focus on main action

CRITICAL OUTPUT REQUIREMENTS:
You MUST return a valid JSON object with EXACTLY this structure:
{
  "title": "Story Title in Arabic",
  "chapters": [
    {
      "chapterTitle": "Chapter 1 Title",
      "narrative": "Chapter 1 story text in Arabic (60-80 words)",
      "illustrationDescription": "Simple scene description for coloring"
    }
  ],
  "characterDescription": "Character appearance description"
}

IMPORTANT: 
- Return ONLY valid JSON, no other text
- Create EXACTLY {{numberOfPages}} chapters
- Each chapter must have all three fields: chapterTitle, narrative, illustrationDescription
- The story must be complete and educational
`,
    config: {
      temperature: 0.7, // Lower temperature for faster, more consistent generation
      maxOutputTokens: 4000, // Increased limit to ensure complete story generation
    }
});

// Real character reference image generation using AI
async function generateCharacterReferenceImage(description: string, characterName: string): Promise<string> {
  console.log(`Generating AI character image for: ${characterName}`);
  
  const imageUrl = await generateWithRetryStrict(async () => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-generate-preview-06-06',
      prompt: `${STRICT_BLACK_WHITE_PROMPT}

Character: ${characterName}
Description: ${description}

Requirements:
- Black lines on white background only
- Simple coloring book style
- No text or letters
- Child character only`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.8, // Faster generation
        maxOutputTokens: 100, // Limit tokens for speed
      },
    });

    if (!media?.url) {
      throw new Error("AI character image generation failed to return a valid URL");
    }
    
    return media.url;
  });

  console.log('Successfully generated AI character image');
  return imageUrl;
}


// Real page image generation using AI
async function generatePageImage(
  sceneDescription: string, 
  characterName: string, 
  characterDescription: string,
  characterReferenceImage?: string
): Promise<string> {
  console.log(`Generating AI scene image for: ${sceneDescription}`);
  
  const basePrompt = `${STRICT_BLACK_WHITE_PROMPT}

Scene: ${sceneDescription}
Character: ${characterName}

Requirements:
- Black lines on white background only
- Simple coloring book style
- No text or letters
- Child character in the scene`;

  const imageUrl = await generateWithRetryStrict(async () => {
    const generateParams: any = {
      model: 'googleai/imagen-4.0-generate-preview-06-06',
      prompt: basePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    };

    // If we have a character reference image, include it with basic parameters
    if (characterReferenceImage) {
      console.log('🎯 [IMAGE GENERATION] Using character reference image for consistency');
      generateParams.config = {
        ...generateParams.config,
        referenceImage: characterReferenceImage,
        referenceImageWeight: 0.7, // Reduced weight for faster generation
        referenceImageStyle: 'similar', // Faster than exact_match
        temperature: 0.8, // Faster generation
        maxOutputTokens: 100, // Limit tokens for speed
      };
      
      // Simplified reference image prompt for speed
      generateParams.prompt = `${basePrompt}

Reference: Use the provided character image as reference for the child's appearance.`;
    } else {
      generateParams.config = {
        ...generateParams.config,
        temperature: 0.8, // Faster generation
        maxOutputTokens: 100, // Limit tokens for speed
      };
    }

    const { media } = await ai.generate(generateParams);

    if (!media?.url) {
      throw new Error("AI scene image generation failed to return a valid URL");
    }
    
    return media.url;
  });

  console.log('Successfully generated AI scene image');
  return imageUrl;
}


export async function createStoryAndColoringPagesFlow(input: StoryAndPagesInput): Promise<StoryAndPagesOutput> {
  try {
    console.log('📖 [STORY GENERATION] Starting story creation flow');
    console.log('📖 [STORY GENERATION] Using uploaded photo:', input.useUploadedPhoto);
    
    // 1. Handle character description - either from uploaded photo or AI generation
    let characterDescription: string;
    let characterReferenceImage: string;
    
    // 1. Generate story content first (always needed) with retry mechanism
    console.log('📖 [STORY GENERATION] Generating story content...');
    let storyResult: any = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        storyResult = await storyContentPrompt({
            childName: input.childName,
            ageGroup: input.ageGroup,
            setting: input.setting,
            lesson: input.lesson,
            numberOfPages: input.numberOfPages,
        });
        
        // Check if we got a valid response
        if (storyResult.output && storyResult.output.title && storyResult.output.chapters && storyResult.output.characterDescription) {
          console.log(`✅ [STORY GENERATION] Story generated successfully on attempt ${retryCount + 1}`);
          break;
        } else {
          throw new Error('Invalid story response');
        }
      } catch (error) {
        retryCount++;
        console.warn(`⚠️ [STORY GENERATION] Attempt ${retryCount} failed:`, error);
        
        if (retryCount >= maxRetries) {
          console.error('❌ [STORY GENERATION] All retry attempts failed');
          throw new Error(`Story generation failed after ${maxRetries} attempts. Please try again.`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    // At this point, storyResult should be valid due to the retry logic above
    if (!storyResult || !storyResult.output) {
      throw new Error('Story generation failed - no valid result after retries');
    }

    console.log('📖 [STORY GENERATION] Story generation result:', {
      hasOutput: !!storyResult.output,
      outputType: typeof storyResult.output,
      outputKeys: storyResult.output ? Object.keys(storyResult.output) : 'null'
    });

    const storyContent = storyResult.output;

    if (!storyContent) {
      console.error('📖 [STORY GENERATION] ❌ Story generation returned null/undefined');
      throw new Error('Story text generation failed - AI returned null response. Please try again.');
    }

    if (!storyContent.chapters || storyContent.chapters.length === 0) {
      console.error('📖 [STORY GENERATION] ❌ No chapters generated:', storyContent);
      throw new Error('Story text generation failed - no chapters were created. Please try again.');
    }

    if (!storyContent.characterDescription) {
      console.error('📖 [STORY GENERATION] ❌ No character description generated:', storyContent);
      throw new Error('Story text generation failed - no character description was created. Please try again.');
    }

    if (!storyContent.title) {
      console.error('📖 [STORY GENERATION] ❌ No story title generated:', storyContent);
      throw new Error('Story text generation failed - no story title was created. Please try again.');
    }

    console.log('✅ [STORY GENERATION] Story content generated successfully:', {
      title: storyContent.title,
      chaptersCount: storyContent.chapters.length,
      hasCharacterDescription: !!storyContent.characterDescription
    });

    // Validate that we got the correct number of chapters
    const requestedPages = parseInt(input.numberOfPages, 10);
    if (storyContent.chapters.length !== requestedPages) {
      console.warn(`⚠️ AI generated ${storyContent.chapters.length} chapters but ${requestedPages} were requested. Using what was generated.`);
    }

    // 2. Handle character description - either from uploaded photo or AI generation
    if (input.useUploadedPhoto && input.childPhoto) {
      console.log('📖 [STORY GENERATION] Processing uploaded character photo...');
      
      // Validate the uploaded photo
      const validation = await validateCharacterPhoto(input.childPhoto);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid character photo');
      }
      
      // Extract character description from uploaded photo
      const characterExtraction = await extractCharacterFromPhoto(input.childPhoto, input.childName);
      if (!characterExtraction.success || !characterExtraction.characterDescription) {
        throw new Error(characterExtraction.error || 'Failed to extract character from photo');
      }
      
      characterDescription = characterExtraction.characterDescription;
      console.log('✅ [STORY GENERATION] Character extracted from photo');
      
      // Use the uploaded photo as character reference
      characterReferenceImage = input.childPhoto;
      
    } else {
      console.log('📖 [STORY GENERATION] Using AI-generated character description...');
      characterDescription = storyContent.characterDescription;
      
      // Generate the character reference image
      try {
        characterReferenceImage = await generateCharacterReferenceImage(
          characterDescription,
          input.childName
        );
      } catch (error) {
        console.error('Character image generation failed (strict):', error);
        throw error;
      }
    }

    // 3. Generate images for each chapter using the reference image.
    // The AI should have generated exactly the number of chapters requested
    const chaptersToProcess = storyContent.chapters;

    console.log(`🚀 [STORY GENERATION] Starting parallel image generation for ${chaptersToProcess.length} pages...`);
    
    // Generate images in parallel with timeout
    const imagePromises = chaptersToProcess.map(async (chapter: any, index: number) => {
      try {
        // Add timeout for each image generation
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Image generation timeout')), 15000) // 15 second timeout per image
        );
        
        const imagePromise = generatePageImage(
          chapter.illustrationDescription,
          input.childName,
          characterDescription,
          characterReferenceImage
        );
        
        return Promise.race([imagePromise, timeoutPromise]);
      } catch (error) {
        console.error(`Page ${index + 1} image generation failed:`, error);
        throw error;
      }
    });

    const imageUrls = await Promise.all(imagePromises) as string[];
    console.log(`✅ [STORY GENERATION] All ${imageUrls.length} images generated successfully`);

    // 4. Combine text and images into pages.
    const pages = chaptersToProcess.map((chapter: any, index: number) => ({
      pageNumber: index + 1,
      text: `${chapter.chapterTitle} - ${input.childName} في ${input.setting}\n\n${chapter.narrative}`,
      imageDataUri: imageUrls[index],
    }));

    // Ensure at least one image
    if (pages.every((p: any) => !p.imageDataUri)) {
        throw new Error("All image generations failed.");
    }

    return {
      title: storyContent.title,
      pages: pages,
    };
  } catch (error) {
    console.error('Story generation failed (strict):', error);
    throw error;
  }
}
