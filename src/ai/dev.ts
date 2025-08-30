import { config } from 'dotenv';
config();

import '@/ai/flows/generate-story-content.ts';
import '@/ai/flows/generate-coloring-page-from-description.ts';
import '@/ai/flows/generate-coloring-page-from-image.ts';
import '@/ai/flows/generate-coloring-page-from-text.ts';
