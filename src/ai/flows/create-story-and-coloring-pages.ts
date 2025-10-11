
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
    input: { schema: StoryAndPagesInputSchema.pick({ childName: true, ageGroup: true, setting: true, lesson: true}) },
    output: { schema: StoryContentSchema },
    prompt: `You are a children's story generator that creates engaging, educational stories in Arabic designed for coloring books.

Instructions:

Required Inputs:
Main character name: {{childName}}
Age: {{ageGroup}}
Place/Setting: {{setting}}
Lesson/Moral: {{lesson}}

Story Rules:
Language: Arabic only.
Story length: Short, divided into 3 chapters maximum.
Each chapter must include: • Chapter Title (2–3 words). • Narrative (90–130 words) suitable for {{ageGroup}} years old. • Illustration Description: a single, concrete scene description for coloring that references the main character by name and the chosen setting.

Story Structure:
- Clear beginning, middle, and end with a complete story arc
- Fun, imaginative, and child-friendly tone with age-appropriate vocabulary
- Each chapter should advance the plot and build toward the lesson
- End of the story should naturally reinforce the lesson/moral through the character's actions
- Use simple, clear sentences that children can understand
- Include dialogue and action to make the story engaging
- Make the story relatable to children's experiences
- CRITICAL: The main character must remain the SAME person throughout all chapters - same name, same appearance, same personality

Character Description:
Provide a detailed "characterDescription" of the main character's appearance (face, hair, clothes) for creating a reference image. Keep it simple and clear.

IMPORTANT GENDER RULES:
- If the character is a BOY: Never add hijab or any head covering, regardless of setting
- If the character is a GIRL and setting is Islamic (mosque, Islamic school): She must wear hijab covering all hair
- If the character is a GIRL and setting is secular (regular school, park, home): Normal clothing without hijab
- The character's gender and appearance must remain CONSISTENT throughout all chapters

Illustration Description Rules (for black-and-white coloring page):
- Describe only one scene per chapter
- Keep it simple, clear, and visually rich: (e.g., "{{childName}} standing in front of {{setting}} holding a small book, with one tree behind")
- No colors, shading, or gray — line art only
- Focus on the main action or moment of that chapter

Output Format:
- Story Title (engaging and relevant)
- Chapters: (Array of Title + Narrative + Illustration Description)
- Character Description
`,
    config: {}
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

Additional Requirements:
- Draw in black lines on white background only
- Professional coloring book style with clean, bold black lines
- Children will color this themselves
- NO TEXT OR LETTERS of any kind (no signs, labels, or writing)
- IMPORTANT: If character is a BOY, never add hijab
- If character is a GIRL and setting is Islamic, draw her with hijab covering all hair`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
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
Character: ${characterName} - THIS IS THE EXACT SAME CHILD FROM THE UPLOADED PHOTO

🚨 ABSOLUTE REQUIREMENT - COPY THE EXACT CHILD FROM REFERENCE PHOTO:
- Draw THE EXACT SAME CHILD from the uploaded photo - do not create a different child
- Copy every single facial feature: eyes, nose, mouth, face shape, eyebrows
- Copy the exact hair style, hair color, hair length, and hair texture
- Copy the exact skin tone, complexion, and facial structure
- Copy the exact clothing, accessories, and any distinctive features
- This child is the HERO of the story - they must be IDENTICAL to the uploaded photo
- Do NOT change their appearance, age, or any physical characteristics
- This is NOT inspiration - this is copying the EXACT same child

Additional Requirements:
- Draw in black lines on white background only
- Professional coloring book style with clean, bold black lines
- Children will color this themselves
- NO TEXT OR LETTERS of any kind (no signs, labels, or writing)
- The child from the uploaded photo IS the main character - draw them exactly`;

  const imageUrl = await generateWithRetryStrict(async () => {
    const generateParams: any = {
      model: 'googleai/imagen-4.0-generate-preview-06-06',
      prompt: basePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    };

    // If we have a character reference image, include it with enhanced parameters
    if (characterReferenceImage) {
      console.log('🎯 [IMAGE GENERATION] Using character reference image for consistency');
      generateParams.config = {
        ...generateParams.config,
        referenceImage: characterReferenceImage,
        referenceImageWeight: 0.95, // Maximum weight to match reference exactly
        referenceImageStyle: 'exact_match', // Ensure exact matching
      };
      
      // Add reference image info to prompt
      generateParams.prompt = `${basePrompt}

🎯 REFERENCE IMAGE INSTRUCTIONS - COPY THE EXACT CHILD:
The provided reference image shows THE EXACT CHILD who is the hero of this story. You MUST:

1. COPY THE EXACT CHILD: Look at the reference image and draw THE EXACT SAME CHILD
2. FACIAL FEATURES: Copy eyes, nose, mouth, face shape, eyebrows, and expressions EXACTLY
3. HAIR: Copy hair style, color, length, texture, and any hair accessories EXACTLY  
4. SKIN TONE: Copy the exact skin color, complexion, and facial structure
5. CLOTHING: Copy the exact clothes, accessories, and any distinctive items
6. BODY PROPORTIONS: Copy height, build, and overall body proportions
7. IDENTICAL APPEARANCE: The child must look IDENTICAL to the reference photo

🚨 CRITICAL: This is NOT a generic child or inspired character - this IS the exact child from the uploaded photo. They are the hero of the story and must appear IDENTICAL in every scene.

DETAILED COPYING REQUIREMENTS:
- Copy the EXACT face shape, bone structure, and proportions from the reference
- Copy the EXACT eye color, shape, size, and eyebrow details
- Copy the EXACT nose shape, size, and proportions
- Copy the EXACT mouth shape, lip size, and smile
- Copy the EXACT hair color, style, length, and texture
- Copy the EXACT skin tone, complexion, and facial features
- Copy the EXACT clothing, colors, patterns, and accessories
- Copy the EXACT body proportions, build, and age appearance
- Copy ANY distinctive features, birthmarks, scars, or unique characteristics
- Copy the EXACT age and maturity level appearance

Do NOT create a different child. Do NOT change their appearance. Draw THE EXACT SAME CHILD from the reference image. The child must be IDENTICAL to the uploaded photo in every detail.`;
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
    
    // 1. Generate story content first (always needed)
    const { output: storyContent } = await storyContentPrompt({
        childName: input.childName,
        ageGroup: input.ageGroup,
        setting: input.setting,
        lesson: input.lesson,
    });

    if (!storyContent || !storyContent.chapters || storyContent.chapters.length === 0 || !storyContent.characterDescription) {
      throw new Error('Story text generation failed to return complete content.');
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
    const numPagesToGenerate = Math.min(parseInt(input.numberOfPages, 10), storyContent.chapters.length);
    const chaptersToProcess = storyContent.chapters.slice(0, numPagesToGenerate);

    const imageUrls = await Promise.all(chaptersToProcess.map(async (chapter, index) => {
      try {
        return await generatePageImage(
          chapter.illustrationDescription,
          input.childName,
          characterDescription,
          characterReferenceImage
        );
      } catch (error) {
        console.error(`Page ${index + 1} image generation failed (strict):`, error);
        throw error;
      }
    }));

    // 4. Combine text and images into pages.
    const pages = chaptersToProcess.map((chapter, index) => ({
      pageNumber: index + 1,
      text: `${chapter.chapterTitle} - ${input.childName} في ${input.setting}\n\n${chapter.narrative}`,
      imageDataUri: imageUrls[index],
    }));

    // Ensure at least one image
    if (pages.every(p => !p.imageDataUri)) {
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
