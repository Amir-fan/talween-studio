
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
import { StoryAndPagesInputSchema, StoryAndPagesOutputSchema } from '@/app/create/story/types';
import type { StoryAndPagesOutput, StoryAndPagesInput } from '@/app/create/story/types';


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
    prompt: `You are a children’s story generator that creates short, simple stories in Arabic designed for coloring books.

Instructions:

Required Inputs:

Main character name: {{childName}}
Age: {{ageGroup}}
Place/Setting: {{setting}}
Lesson/Moral: {{lesson}}

Story Rules:

Language: Arabic only.
Story length: Short, divided into 3 chapters maximum.
Each chapter must include: • Chapter Title (2–3 words). • Narrative (50–80 words) suitable for {{ageGroup}} years old. • Illustration Description: a single, simple scene description for coloring.

Story Structure:

Clear beginning, middle, and end.
Fun, imaginative, and child-friendly tone.
End of the story should reinforce the lesson/moral.
**Character Description**: At the end, provide a single, detailed "characterDescription" of the main character's appearance (face, hair, clothes). This will be used to create a reference image.

Illustration Description Rules:

Describe only one scene per chapter.
Keep it simple: (e.g., “Ali standing in front of the school with his backpack”).
No colors mentioned — line art only.

Output Format:
- Story Title
- Chapters: (Array of Title + Narrative + Illustration Description)
- Character Description
`,
    config: {
        model: 'googleai/gemini-2.0-flash',
        apiKey: process.env.STORY_TEXT_KEY,
    }
});

async function generateCharacterReferenceImage(
    description: string,
    characterName: string
): Promise<string> {
    const prompt = `Create a black-and-white line art character sheet for a children’s coloring book.
Character Name: ${characterName}
Description: ${description}

Rules:
- Style: Simple, bold outlines. No colors, no shading, no gray areas.
- Background: Plain white background.
- Pose: Standing, facing forward, neutral expression.
- The output should be a fun, cute, and child-friendly character design.`;

    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt,
        config: {
            apiKey: process.env.STORY_IMAGE_KEY,
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media?.url) {
        throw new Error("Character reference image generation failed.");
    }
    return media.url;
}


async function generatePageImage(
    sceneDescription: string,
    characterName: string,
    referenceImageUrl: string
): Promise<string> {
    const prompt = `Take the character from the reference image and place them in the following scene: "${sceneDescription}".

Rules:
- Match the character's face, hair, and clothing exactly to the reference image.
- The new illustration must be black-and-white line art for a coloring book.
- Style: Bold outlines, no colors, no shading, no gray areas.
- Keep the background simple and easy to color.
- Child-friendly, fun, and uncluttered design.`;

    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
            { media: { url: referenceImageUrl } },
            { text: prompt },
        ],
        config: {
            apiKey: process.env.STORY_IMAGE_KEY,
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media?.url) {
        throw new Error(`Image generation failed for scene: ${sceneDescription}`);
    }
    return media.url;
}


export const createStoryAndColoringPagesFlow = ai.defineFlow(
  {
    name: 'createStoryAndColoringPagesFlow',
    inputSchema: StoryAndPagesInputSchema,
    outputSchema: StoryAndPagesOutputSchema,
  },
  async (input): Promise<StoryAndPagesOutput> => {
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
    const characterReferenceImage = await generateCharacterReferenceImage(
      storyContent.characterDescription,
      input.childName
    );

    // 3. Generate images for each chapter using the reference image.
    const numPagesToGenerate = Math.min(parseInt(input.numberOfPages, 10), storyContent.chapters.length);
    const chaptersToProcess = storyContent.chapters.slice(0, numPagesToGenerate);

    const pageImagePromises = chaptersToProcess.map(chapter => 
        generatePageImage(
            chapter.illustrationDescription,
            input.childName,
            characterReferenceImage
        )
    );

    const imageUrls = await Promise.all(pageImagePromises);


    // 4. Combine text and images into pages.
    const pages = chaptersToProcess.map((chapter, index) => ({
      pageNumber: index + 1,
      text: `${chapter.chapterTitle}\n\n${chapter.narrative}`,
      imageDataUri: imageUrls[index],
    }));

    if (pages.some(p => !p.imageDataUri)) {
        throw new Error("One or more image generations failed.");
    }

    return {
      title: storyContent.title,
      pages: pages,
    };
  }
);
