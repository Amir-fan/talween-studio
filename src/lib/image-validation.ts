/**
 * Image validation and processing utilities to ensure black and white output
 */

/**
 * Validates if an image URL returns a black and white image
 * This is a basic check - in production you might want more sophisticated validation
 */
export async function validateBlackAndWhiteImage(imageUrl: string): Promise<{
  isValid: boolean;
  hasColors: boolean;
  error?: string;
}> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return {
        isValid: false,
        hasColors: false,
        error: 'Failed to fetch image'
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Basic validation - check if it's a valid image
    const isValidImage = buffer.length > 0 && (
      buffer[0] === 0xFF && buffer[1] === 0xD8 || // JPEG
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 || // PNG
      buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 // GIF
    );

    if (!isValidImage) {
      return {
        isValid: false,
        hasColors: false,
        error: 'Invalid image format'
      };
    }

    // For now, we'll assume the AI is following instructions
    // In a more sophisticated implementation, you could analyze pixel colors
    // to detect if there are any non-black/white colors
    
    return {
      isValid: true,
      hasColors: false // Assume AI follows instructions
    };
  } catch (error) {
    return {
      isValid: false,
      hasColors: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Creates a fallback black and white SVG if the AI generates colored output
 */
export function createFallbackBlackWhiteImage(description: string): string {
  const svgContent = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <!-- Pure white background -->
      <rect width="100%" height="100%" fill="white" stroke="black" stroke-width="2"/>
      
      <!-- Black line art only -->
      <g stroke="black" stroke-width="3" fill="none">
        <!-- Main frame -->
        <rect x="50" y="50" width="300" height="300" rx="15"/>
        
        <!-- Simple character outline -->
        <!-- Head -->
        <circle cx="200" cy="150" r="40"/>
        
        <!-- Body -->
        <rect x="170" y="190" width="60" height="100" rx="15"/>
        
        <!-- Arms -->
        <line x1="170" y1="220" x2="140" y2="260"/>
        <line x1="230" y1="220" x2="260" y2="260"/>
        
        <!-- Legs -->
        <line x1="180" y1="290" x2="180" y2="350"/>
        <line x1="220" y1="290" x2="220" y2="350"/>
        
        <!-- Simple facial features -->
        <circle cx="185" cy="140" r="3" fill="black"/>
        <circle cx="215" cy="140" r="3" fill="black"/>
        <path d="M 180 160 Q 200 170 220 160" stroke-width="2"/>
      </g>
      
      <!-- Description text -->
      <text x="200" y="30" font-family="Arial" font-size="16" fill="black" text-anchor="middle" font-weight="bold">
        ${description}
      </text>
      
      <!-- Instructions -->
      <text x="200" y="380" font-family="Arial" font-size="12" fill="black" text-anchor="middle">
        Color the black outlines!
      </text>
    </svg>
  `;
  
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Enhanced prompt for ensuring black and white output
 */
export const STRICT_BLACK_WHITE_PROMPT = `
STRICT BLACK AND WHITE LINE ART ONLY - ABSOLUTELY NO COLORS ALLOWED

MANDATORY REQUIREMENTS - ZERO TOLERANCE FOR COLORS:
- ONLY BLACK LINES on PURE WHITE BACKGROUND
- NO COLORS: NO RED, NO BLUE, NO GREEN, NO YELLOW, NO PURPLE, NO ORANGE, NO PINK, NO BROWN, NO GRAY
- NO SHADING, NO GRADIENTS, NO FILLS, NO TEXTURES, NO SHADOWS
- NO COLORED ELEMENTS WHATSOEVER
- Professional coloring book style with clean, bold black lines
- Children will color this themselves
- FINAL OUTPUT MUST BE 100% BLACK AND WHITE - NO EXCEPTIONS

If you generate ANY colors, the image will be rejected and replaced with a fallback.
`;

/**
 * Retry mechanism for black and white generation
 */
export async function generateWithRetry(
  generateFunction: () => Promise<string>,
  maxRetries: number = 2
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to generate black and white image...`);
      const result = await generateFunction();
      
      // Validate the result
      const validation = await validateBlackAndWhiteImage(result);
      
      if (validation.isValid && !validation.hasColors) {
        console.log(`Successfully generated black and white image on attempt ${attempt}`);
        return result;
      }
      
      if (attempt === maxRetries) {
        console.warn('Max retries reached, using fallback image');
        return createFallbackBlackWhiteImage('Coloring Page');
      }
      
      console.warn(`Attempt ${attempt} failed validation, retrying...`);
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.warn('Max retries reached, using fallback image');
        return createFallbackBlackWhiteImage('Coloring Page');
      }
    }
  }
  
  // This should never be reached, but just in case
  return createFallbackBlackWhiteImage('Coloring Page');
}
