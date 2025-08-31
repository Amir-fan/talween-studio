
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
import type { StoryAndPagesInput, StoryAndPagesOutput } from '@/app/create/story/types';


const ChapterSchema = z.object({
    chapterTitle: z.string().describe('The title of the chapter.'),
    narrative: z.string().describe('The text content of the chapter.'),
    illustrationDescription: z.string().describe('A simple description of an illustration for this chapter.'),
});

const StoryContentSchema = z.object({
    title: z.string().describe('The title of the entire story.'),
    chapters: z.array(ChapterSchema).describe('An array of chapters, each with text and an illustration description.'),
});


const storyContentPrompt = ai.definePrompt({
    name: 'storyContentPrompt',
    input: { schema: StoryAndPagesInputSchema.pick({ childName: true, ageGroup: true, setting: true, lesson: true}) },
    output: { schema: StoryContentSchema },
    prompt: `You are a children’s story generator that creates short, simple stories in Arabic designed for coloring books.

Instructions:
1. Required Inputs:
   - Main character name: {{childName}}
   - Age: {{ageGroup}}
   - Place/Setting: {{setting}}
   - Lesson/Moral: {{lesson}}

2. Story Rules:
   - Language: Arabic only.
   - Story length: Short, divided into 3 chapters maximum.
   - Each chapter must include:
       • Chapter Title (2–3 words).
       • Narrative (50–80 words) suitable for {{ageGroup}} years old.
       • Illustration Description: a single, simple scene description for coloring.

3. Story Structure:
   - Clear beginning, middle, and end.
   - Fun, imaginative, and child-friendly tone.
   - End of the story should reinforce the lesson/moral.

4. Illustration Description Rules:
   - Describe only one scene per chapter.
   - Keep it simple: (e.g., “علي يقف أمام المدرسة مع حقيبته”).
   - No colors mentioned — line art only.
   - Keep the main character {{childName}} consistent across all chapters (same face, hair, and clothing).

Output Format:
- Story Title
- Chapter 1: Title + Narrative + Illustration Description
- Chapter 2: Title + Narrative + Illustration Description
- Chapter 3: Title + Narrative + Illustration Description
`,
    config: {
        model: 'googleai/gemini-2.0-flash',
        apiKey: process.env.STORY_TEXT_KEY,
    }
});


async function generateImageFromDescription(description: string): Promise<string> {
    const prompt = `Create a black-and-white line art illustration for a children’s coloring book.

Input Scene: ${description}

Rules:
- Style: Bold outlines, no colors, no shading, no gray areas.
- Keep characters and objects simple and easy to recognize.
- Leave large empty spaces for coloring.
- Ensure the main character looks the same across all illustrations (same face, hair, clothes).
- Child-friendly, fun, and uncluttered design.`

    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: prompt,
        config: {
            apiKey: process.env.STORY_IMAGE_KEY,
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media?.url) {
        throw new Error("Image generation failed to return a valid image URL.");
    }
    
    return media.url;
}


export const createStoryAndColoringPagesFlow = ai.defineFlow(
  {
    name: 'createStoryAndColoringPagesFlow',
    inputSchema: StoryAndPagesInputSchema,
    outputSchema: StoryAndPagesOutputSchema,
  },
  async (input) => {
    // 1. Generate all story text content and image descriptions first.
    const { output: storyContent } = await storyContentPrompt({
        childName: input.childName,
        ageGroup: input.ageGroup,
        setting: input.setting,
        lesson: input.lesson,
    });

    if (!storyContent || !storyContent.chapters || storyContent.chapters.length === 0) {
      throw new Error('Story text generation failed to return any chapters.');
    }

    // 2. Generate an image for each chapter's description in parallel.
    const imagePromises = storyContent.chapters.map(chapter => 
        generateImageFromDescription(chapter.illustrationDescription)
    );
    const imageUrls = await Promise.all(imagePromises);

    // 3. Combine text and images into pages.
    const pages = storyContent.chapters.map((chapter, index) => ({
      pageNumber: index + 1,
      text: `${chapter.chapterTitle}\n\n${chapter.narrative}`,
      imageDataUri: imageUrls[index], // The corresponding image URL
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
