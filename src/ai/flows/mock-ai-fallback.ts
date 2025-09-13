// Mock AI fallback for when Google AI is unavailable
export function createMockColoringPage(description: string): string {
  // Create a proper SVG with the actual description and some basic line art
  const svgContent = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <!-- White background -->
      <rect width="100%" height="100%" fill="white" stroke="black" stroke-width="2"/>
      
      <!-- Title -->
      <text x="200" y="30" font-family="Arial" font-size="16" fill="black" text-anchor="middle" font-weight="bold">
        Coloring Page
      </text>
      
      <!-- Description -->
      <text x="200" y="50" font-family="Arial" font-size="12" fill="black" text-anchor="middle">
        ${description}
      </text>
      
      <!-- Simple line art based on description -->
      <g stroke="black" stroke-width="3" fill="none">
        <!-- Main frame -->
        <rect x="50" y="70" width="300" height="250" rx="15"/>
        
        <!-- Simple character/object outline -->
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
      
      <!-- Instructions -->
      <text x="200" y="380" font-family="Arial" font-size="12" fill="black" text-anchor="middle">
        Color the black outlines!
      </text>
    </svg>
  `;
  
  // Convert to base64 data URI
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Create a mock coloring page from an uploaded image
export function createMockColoringPageFromImage(originalImageDataUri: string): string {
  // Create a clean black and white line art coloring page without overlays
  const svgContent = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <!-- White background -->
      <rect width="100%" height="100%" fill="white"/>
      
      <!-- Clean line art - no overlays, just outlines -->
      <g stroke="black" stroke-width="3" fill="none">
        <!-- Main outline frame -->
        <rect x="50" y="50" width="300" height="300" rx="15"/>
        
        <!-- Simple character outline -->
        <!-- Head -->
        <circle cx="200" cy="120" r="35"/>
        
        <!-- Body -->
        <rect x="170" y="150" width="60" height="100" rx="15"/>
        
        <!-- Arms -->
        <line x1="170" y1="180" x2="140" y2="220"/>
        <line x1="230" y1="180" x2="260" y2="220"/>
        
        <!-- Legs -->
        <line x1="180" y1="250" x2="180" y2="320"/>
        <line x1="220" y1="250" x2="220" y2="320"/>
        
        <!-- Simple facial features -->
        <circle cx="190" cy="110" r="3" fill="black"/>
        <circle cx="210" cy="110" r="3" fill="black"/>
        <path d="M 185 125 Q 200 135 215 125" stroke-width="2"/>
      </g>
      
      <!-- Title -->
      <text x="200" y="30" font-family="Arial" font-size="16" fill="black" text-anchor="middle" font-weight="bold">
        Coloring Page
      </text>
      
      <!-- Instructions -->
      <text x="200" y="370" font-family="Arial" font-size="12" fill="gray" text-anchor="middle">
        Color the outlines!
      </text>
    </svg>
  `;
  
  // Convert to base64 data URI
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Create an enhanced mock that actually processes the uploaded image
export function createEnhancedMockFromImage(originalImageDataUri: string): string {
  // Create a more sophisticated mock that uses the original image
  const svgContent = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Filter to create line art effect -->
        <filter id="lineArt" x="-50%" y="-50%" width="200%" height="200%">
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
          <feGaussianBlur stdDeviation="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
          <feMorphology operator="dilate" radius="1"/>
        </filter>
      </defs>
      
      <!-- White background -->
      <rect width="100%" height="100%" fill="white"/>
      
      <!-- Original image as reference (very faint) -->
      <image href="${originalImageDataUri}" x="50" y="50" width="300" height="300" opacity="0.05" filter="url(#lineArt)"/>
      
      <!-- Enhanced line art overlay -->
      <g stroke="black" stroke-width="2" fill="none">
        <!-- Main frame -->
        <rect x="60" y="60" width="280" height="280" rx="10"/>
        
        <!-- More detailed character based on common shapes -->
        <!-- Head with more detail -->
        <ellipse cx="200" cy="130" rx="45" ry="40"/>
        
        <!-- Body with more detail -->
        <rect x="160" y="160" width="80" height="120" rx="20"/>
        
        <!-- Arms with more detail -->
        <ellipse cx="140" cy="190" rx="20" ry="50"/>
        <ellipse cx="260" cy="190" rx="20" ry="50"/>
        
        <!-- Legs with more detail -->
        <rect x="170" y="280" width="25" height="70" rx="12"/>
        <rect x="205" y="280" width="25" height="70" rx="12"/>
        
        <!-- More detailed facial features -->
        <circle cx="185" cy="120" r="4" fill="black"/>
        <circle cx="215" cy="120" r="4" fill="black"/>
        <path d="M 180 140 Q 200 150 220 140" stroke-width="2"/>
        
        <!-- Additional details -->
        <path d="M 200 160 Q 200 180 200 200" stroke-width="1"/>
        <circle cx="200" cy="200" r="3" fill="black"/>
      </g>
      
      <!-- Title -->
      <text x="200" y="30" font-family="Arial" font-size="16" fill="black" text-anchor="middle" font-weight="bold">
        Enhanced Coloring Page
      </text>
      
      <!-- Instructions -->
      <text x="200" y="370" font-family="Arial" font-size="12" fill="gray" text-anchor="middle">
        Color the outlines!
      </text>
    </svg>
  `;
  
  // Convert to base64 data URI
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Create a mock character reference image
export function createMockCharacterReference(characterName: string): string {
  const svgContent = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white" stroke="black" stroke-width="2"/>
      <text x="50%" y="30%" font-family="Arial" font-size="16" fill="black" text-anchor="middle">
        ${characterName}
      </text>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="black" text-anchor="middle">
        (Character Reference)
      </text>
      <text x="50%" y="70%" font-family="Arial" font-size="12" fill="gray" text-anchor="middle">
        Mock AI Generated
      </text>
    </svg>
  `;
  
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Create a mock scene image
export function createMockSceneImage(sceneDescription: string): string {
  const svgContent = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white" stroke="black" stroke-width="2"/>
      <text x="50%" y="30%" font-family="Arial" font-size="16" fill="black" text-anchor="middle">
        ${sceneDescription}
      </text>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="black" text-anchor="middle">
        (Scene Image)
      </text>
      <text x="50%" y="70%" font-family="Arial" font-size="12" fill="gray" text-anchor="middle">
        Mock AI Generated
      </text>
    </svg>
  `;
  
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export function createMockStory(): any {
  return {
    title: "مغامرة في الغابة",
    pages: [
      {
        pageNumber: 1,
        text: "الفصل الأول: البداية\n\nكان أحمد يسير في الغابة الجميلة عندما رأى أرنباً صغيراً.",
        imageDataUri: createMockColoringPage("أحمد والأرنب في الغابة")
      },
      {
        pageNumber: 2,
        text: "الفصل الثاني: الصداقة\n\nأصبح أحمد والأرنب أصدقاء مقربين.",
        imageDataUri: createMockColoringPage("أحمد والأرنب يلعبان معاً")
      }
    ]
  };
}
