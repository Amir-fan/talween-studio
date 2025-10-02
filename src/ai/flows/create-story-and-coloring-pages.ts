
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
import {createMockCharacterReference, createMockSceneImage, createMockStory, createMockColoringPage} from './mock-ai-fallback';
import { StoryAndPagesInputSchema, StoryAndPagesOutputSchema } from '@/app/create/story/types';
import type { StoryAndPagesOutput, StoryAndPagesInput } from '@/app/create/story/types';
import { generateWithRetry, STRICT_BLACK_WHITE_PROMPT } from '@/lib/image-validation';


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
Each chapter must include: • Chapter Title (2–3 words). • Narrative (60–100 words) suitable for {{ageGroup}} years old. • Illustration Description: a single, simple scene description for coloring.

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

Illustration Description Rules:
- Describe only one scene per chapter
- Keep it simple and clear: (e.g., "{{childName}} standing in front of the school with his backpack")
- No colors mentioned — line art only
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
  
  const imageUrl = await generateWithRetry(async () => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-generate-preview-06-06',
      prompt: `${STRICT_BLACK_WHITE_PROMPT}

Character: ${characterName}
Description: ${description}

Additional Requirements:
- Draw in black lines on white background only
- Professional coloring book style with clean, bold black lines
- Children will color this themselves
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
async function generatePageImage(sceneDescription: string, characterName: string, characterDescription: string): Promise<string> {
  console.log(`Generating AI scene image for: ${sceneDescription}`);
  
  const imageUrl = await generateWithRetry(async () => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-generate-preview-06-06',
      prompt: `${STRICT_BLACK_WHITE_PROMPT}

Scene: ${sceneDescription}
Character: ${characterName} (${characterDescription})

Additional Requirements:
- Draw in black lines on white background only
- Professional coloring book style with clean, bold black lines
- Children will color this themselves
- IMPORTANT: If character is a BOY, never add hijab
- If character is a GIRL and setting is Islamic, draw her with hijab covering all hair
- Keep the SAME character appearance throughout all scenes`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

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
    // 1. Generate all story text content and character description first.
    const { output: storyContent } = await storyContentPrompt({
        childName: input.childName,
        ageGroup: input.ageGroup,
        setting: input.setting,
        lesson: input.lesson,
    });

    if (!storyContent || !storyContent.chapters || storyContent.chapters.length === 0 || !storyContent.characterDescription) {
      throw new Error('Story text generation failed to return complete content.');
    }
    
    // 2. Generate the character reference image.
    let characterReferenceImage: string;
    try {
      characterReferenceImage = await generateCharacterReferenceImage(
        storyContent.characterDescription,
        input.childName
      );
    } catch (error) {
      console.error('Character image generation failed, using fallback:', error);
      const { createMockColoringPage } = await import('./mock-ai-fallback');
      characterReferenceImage = createMockColoringPage(`Character: ${input.childName} - ${storyContent.characterDescription}`);
    }

    // 3. Generate images for each chapter using the reference image.
    const numPagesToGenerate = Math.min(parseInt(input.numberOfPages, 10), storyContent.chapters.length);
    const chaptersToProcess = storyContent.chapters.slice(0, numPagesToGenerate);

    const imageUrls = await Promise.all(chaptersToProcess.map(async (chapter, index) => {
      try {
        return await generatePageImage(
          chapter.illustrationDescription,
          input.childName,
          storyContent.characterDescription
        );
      } catch (error) {
        console.error(`Page ${index + 1} image generation failed, using fallback:`, error);
        const { createMockColoringPage } = await import('./mock-ai-fallback');
        return createMockColoringPage(`Scene: ${chapter.illustrationDescription}`);
      }
    }));

    // 4. Combine text and images into pages.
    const pages = chaptersToProcess.map((chapter, index) => ({
      pageNumber: index + 1,
      text: `${chapter.chapterTitle}\n\n${chapter.narrative}`,
      imageDataUri: imageUrls[index],
    }));

    // Check if we have at least some images generated (fallbacks should ensure we always have images)
    if (pages.every(p => !p.imageDataUri)) {
        throw new Error("All image generations failed, including fallbacks.");
    }

    return {
      title: storyContent.title,
      pages: pages,
    };
  } catch (error) {
    console.error('Story generation failed:', error);
    
    // Provide a fallback story instead of throwing error
    console.log('Using fallback story generation...');
    const fallbackStory = {
      title: `قصة ${input.childName}`,
      pages: Array.from({ length: Math.min(parseInt(input.numberOfPages, 10), 3) }, (_, i) => ({
        pageNumber: i + 1,
        text: `صفحة ${i + 1}: مغامرة ${input.childName} في ${input.setting}`,
        imageDataUri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9ImJsYWNrIj5Db2xvcmluZyBQYWdlPC90ZXh0Pjwvc3ZnPg=='
      }))
    };
    
    console.log('Successfully generated fallback story');
    return fallbackStory;
  }
}
