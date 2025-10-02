import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Force IPv4 and set timeout for better connectivity
process.env.NODE_OPTIONS = '--dns-result-order=ipv4first --max-old-space-size=4096';

// Additional network configuration
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_API_KEY;

// Use GEMINI_API_KEY as the primary key, fallback to GOOGLE_API_KEY
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.STORY_TEXT_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY, GOOGLE_API_KEY, or STORY_TEXT_KEY environment variable is required for AI features');
}

export const ai = genkit({
  plugins: [googleAI({
    apiKey: apiKey || 'dummy-key', // Use dummy key if not available (fallbacks will handle this)
  })],
  model: 'googleai/gemini-1.5-pro',
});
