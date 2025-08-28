import { config } from 'dotenv';
config();

import '@/ai/flows/story-generation-flow.ts';
import '@/ai/flows/generate-coloring-page-from-text.ts';
import '@/ai/flows/generate-coloring-page-from-image.ts';
import '@/ai/flows/create-user-document.ts';
import '@/ai/flows/generate-image-descriptions.ts';
import '@/ai/flows/generate-story-content.ts';
