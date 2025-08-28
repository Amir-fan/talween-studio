'use server';
/**
 * @fileOverview Generates detailed image descriptions for a story.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { type StoryContentOutput } from './generate-story-content';
import Handlebars from 'handlebars';

const ImageDescriptionInputSchema = z.object({
  story_id: z.string().describe('Must match Story API output'),
  story_content: z.any().describe('Complete story JSON from Story API'),
  child_age_group: z.enum(['3-5', '6-8', '9-12']).describe('The age group of the child.'),
  art_style_preference: z.enum(['cartoon', 'semi-realistic', 'simple']),
});
export type ImageDescriptionInput = z.infer<typeof ImageDescriptionInputSchema>;


const TechnicalSpecsSchema = z.object({
    style: z.string(),
    complexity: z.string(),
    main_elements: z.array(z.string()),
    age_appropriateness: z.string(),
});

const ImageDescriptionItemSchema = z.object({
    page_reference: z.string(),
    image_prompt: z.string(),
    technical_specs: TechnicalSpecsSchema,
    cultural_elements: z.array(z.string()).optional(),
});

const ImageDescriptionOutputSchema = z.object({
  story_id: z.string(),
  image_descriptions: z.array(ImageDescriptionItemSchema),
  style_consistency_notes: z.string(),
  printing_specifications: z.string(),
});
export type ImageDescriptionOutput = z.infer<typeof ImageDescriptionOutputSchema>;


Handlebars.registerHelper('jsonEncode', (context) => {
    return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

const imageDescriptionPrompt = ai.definePrompt({
    name: 'imageDescriptionPrompt',
    input: { schema: ImageDescriptionInputSchema },
    output: { schema: ImageDescriptionOutputSchema, format: 'json'},
    prompt: `You are a professional children's book illustrator specializing in creating detailed image descriptions for AI image generation. Your task is to create precise, culturally appropriate image descriptions that perfectly match the story content provided.

## Input Parameters:
{
  "story_id": "{{story_id}}",
  "story_content": {{{jsonEncode story_content}}},
  "child_age_group": "{{child_age_group}}",
  "art_style_preference": "{{art_style_preference}}"
}

## Cultural and Visual Guidelines:

### Character Design:
- Arab/Gulf facial features with warm, brown skin tones
- Traditional and modern clothing mix
- Expressive, kind eyes
- Modest clothing following Islamic guidelines
- Hair covered appropriately for female characters when needed

### Art Style by Age:
**Ages 3-5:**
- Thick, bold outlines (3-4px equivalent)
- Large, simple shapes
- Minimal background details
- 1-2 characters maximum per scene
- High contrast colors
- Large empty spaces for coloring

**Ages 6-8:**
- Medium detail level
- 2-4 characters per scene
- Moderate background elements
- Clear focal points
- Balanced composition

**Ages 9-12:**
- Rich, detailed illustrations
- Multiple characters and elements
- Complex backgrounds
- Fine details and textures
- Advanced coloring challenges

### Technical Specifications:
- Resolution: 1024x1024 pixels minimum
- Format: High contrast black and white line art
- Coloring book style with clear boundaries
- No filled colors, only outlines
- Print-ready quality (300 DPI equivalent)

## Output Format:
You must output a valid JSON object that conforms to the provided schema. Do not add any text before or after the JSON object.

## Prompt Construction Guidelines:

### Base Structure:
"Black and white line art coloring book illustration, [age-appropriate complexity], featuring [main character description] in [setting], [action/emotion], [cultural elements], thick clear outlines, no filled colors, child-friendly, [specific scene details]"

### Age-Specific Complexity Modifiers:
- **3-5**: "very simple, thick bold lines, minimal details, large shapes"
- **6-8**: "moderate detail, clear focal points, balanced composition"
- **9-12**: "detailed illustration, rich background, multiple elements"

### Cultural Integration:
Always include relevant elements:
- Traditional architecture (Islamic geometric patterns, arches, minarets)
- Clothing (modest, culturally appropriate)
- Environment (desert, palm trees, traditional markets)
- Calligraphy elements (decorative Arabic text when appropriate)

## Quality Assurance:
- Every image description must align perfectly with corresponding story page
- Cultural sensitivity maintained throughout
- Age-appropriate complexity confirmed
- Technical specifications for coloring book format included
- Consistency across all images in the story
- No inappropriate or scary elements
- Islamic values respected in all visual elements

Generate comprehensive image descriptions for all pages of the provided story.
`,
    config: {
        model: 'googleai/gemini-2.0-flash',
        apiKey: process.env.IMAGE_API_KEY
    },
    // @ts-ignore - a bit of a hack to pass in the custom helper
    handlebars: Handlebars
});

const generateImageDescriptionsFlow = ai.defineFlow(
  {
    name: 'generateImageDescriptionsFlow',
    inputSchema: ImageDescriptionInputSchema,
    outputSchema: ImageDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await imageDescriptionPrompt(input);

    if (!output) {
      throw new Error('Failed to generate image descriptions. The model returned no output.');
    }
    return output;
  }
);

export async function generateImageDescriptions(input: ImageDescriptionInput): Promise<ImageDescriptionOutput> {
    return generateImageDescriptionsFlow(input);
}
