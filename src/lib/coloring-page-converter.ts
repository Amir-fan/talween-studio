/**
 * Proper coloring page converter that creates clean outlines with fillable areas
 * Converts images to true coloring page style - not just black/white contrast
 */

import sharp from 'sharp';

/**
 * Convert image to proper coloring page style
 */
export async function convertToColoringPage(imageDataUri: string): Promise<string> {
  console.log('🎨 Converting to PROPER coloring page style...');
  
  try {
    const base64Data = imageDataUri.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('📊 Starting coloring page conversion...');
    
    // Step 1: Create clean outlines
    const outlineBuffer = await createCleanOutlines(imageBuffer);
    console.log('✅ Step 1: Clean outlines created');
    
    // Step 2: Create fillable areas
    const coloringBuffer = await createFillableAreas(outlineBuffer);
    console.log('✅ Step 2: Fillable areas created');
    
    // Step 3: Final cleanup for coloring page style
    const finalBuffer = await finalizeColoringPage(coloringBuffer);
    console.log('✅ Step 3: Final coloring page ready');
    
    const resultDataUri = `data:image/png;base64,${finalBuffer.toString('base64')}`;
    
    console.log('🎉 PROPER coloring page conversion completed!');
    return resultDataUri;
    
  } catch (error) {
    console.error('❌ Coloring page conversion failed:', error);
    throw new Error(`Failed to create coloring page: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create clean outlines suitable for coloring
 */
async function createCleanOutlines(imageBuffer: Buffer): Promise<Buffer> {
  console.log('✏️ Creating clean outlines...');
  
  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width!;
    const height = metadata.height!;
    
    // Convert to grayscale and get raw data
    const { data } = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .toBuffer({ resolveWithObject: true });
    
    // Create outline image
    const outlineData = new Uint8ClampedArray(width * height);
    
    // Apply edge detection with focus on creating clean lines
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Use Laplacian edge detection for cleaner lines
        const laplacian = 
          -4 * data[idx] +
          data[idx - 1] + data[idx + 1] + 
          data[idx - width] + data[idx + width];
        
        // Create clean outline - only strong edges become black lines
        outlineData[idx] = Math.abs(laplacian) > 50 ? 0 : 255;
      }
    }
    
    // Handle borders
    for (let i = 0; i < width; i++) {
      outlineData[i] = 255; // Top border
      outlineData[(height - 1) * width + i] = 255; // Bottom border
    }
    for (let i = 0; i < height; i++) {
      outlineData[i * width] = 255; // Left border
      outlineData[i * width + (width - 1)] = 255; // Right border
    }
    
    // Convert back to image
    const result = await sharp(outlineData, {
      raw: {
        width,
        height,
        channels: 1
      }
    })
    .png()
    .toBuffer();
    
    return result;
    
  } catch (error) {
    console.error('❌ Outline creation failed:', error);
    throw error;
  }
}

/**
 * Create fillable areas by removing solid black regions
 */
async function createFillableAreas(outlineBuffer: Buffer): Promise<Buffer> {
  console.log('🎯 Creating fillable areas...');
  
  try {
    // Get image metadata
    const metadata = await sharp(outlineBuffer).metadata();
    const width = metadata.width!;
    const height = metadata.height!;
    
    // Get raw data
    const { data } = await sharp(outlineBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Create fillable areas image
    const fillableData = new Uint8ClampedArray(data.length);
    
    // Copy outline data
    fillableData.set(data);
    
    // Remove large solid black areas (make them white for coloring)
    const processedData = await removeSolidAreas(fillableData, width, height);
    
    // Convert back to image
    const result = await sharp(processedData, {
      raw: {
        width,
        height,
        channels: 1
      }
    })
    .png()
    .toBuffer();
    
    return result;
    
  } catch (error) {
    console.error('❌ Fillable areas creation failed:', error);
    throw error;
  }
}

/**
 * Remove large solid black areas to create fillable spaces
 */
async function removeSolidAreas(data: Uint8ClampedArray, width: number, height: number): Promise<Uint8ClampedArray> {
  console.log('🧹 Removing solid areas to create fillable spaces...');
  
  const result = new Uint8ClampedArray(data);
  
  // Find and remove large black areas (areas larger than 100 pixels)
  const visited = new Array(width * height).fill(false);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      
      if (!visited[idx] && result[idx] === 0) { // Black pixel
        const blackArea = floodFillBlackArea(result, visited, x, y, width, height);
        
        // If area is too large, make it white (fillable)
        if (blackArea.size > 100) {
          for (const pixelIdx of blackArea.pixels) {
            result[pixelIdx] = 255; // Make white
          }
        }
      }
    }
  }
  
  return result;
}

/**
 * Flood fill to find connected black areas
 */
function floodFillBlackArea(
  data: Uint8ClampedArray, 
  visited: boolean[], 
  startX: number, 
  startY: number, 
  width: number, 
  height: number
): { size: number; pixels: number[] } {
  const pixels: number[] = [];
  const stack = [{ x: startX, y: startY }];
  
  while (stack.length > 0) {
    const { x, y } = stack.pop()!;
    const idx = y * width + x;
    
    if (x < 0 || x >= width || y < 0 || y >= height || visited[idx] || data[idx] !== 0) {
      continue;
    }
    
    visited[idx] = true;
    pixels.push(idx);
    
    // Add neighbors
    stack.push({ x: x + 1, y });
    stack.push({ x: x - 1, y });
    stack.push({ x, y: y + 1 });
    stack.push({ x, y: y - 1 });
  }
  
  return { size: pixels.length, pixels };
}

/**
 * Finalize the coloring page with proper styling
 */
async function finalizeColoringPage(imageBuffer: Buffer): Promise<Buffer> {
  console.log('🎨 Finalizing coloring page style...');
  
  try {
    // Apply final processing for coloring page style
    const result = await sharp(imageBuffer)
      .morphology({
        kernel: sharp.kernel.square(1),
        operation: 'dilate' // Slightly thicken lines for better visibility
      })
      .morphology({
        kernel: sharp.kernel.square(2),
        operation: 'erode' // Clean up any noise
      })
      .linear(1.5, 0) // Slight contrast boost
      .png()
      .toBuffer();
    
    return result;
    
  } catch (error) {
    console.error('❌ Finalization failed:', error);
    throw error;
  }
}

/**
 * Alternative approach using different edge detection
 */
export async function convertToColoringPageAlternative(imageDataUri: string): Promise<string> {
  console.log('🔄 Using alternative coloring page conversion...');
  
  try {
    const base64Data = imageDataUri.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Use a different approach with Canny-like edge detection
    const result = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] // Laplacian
      })
      .threshold(80)
      .morphology({
        kernel: sharp.kernel.square(2),
        operation: 'dilate'
      })
      .morphology({
        kernel: sharp.kernel.square(1),
        operation: 'erode'
      })
      .png()
      .toBuffer();
    
    const resultDataUri = `data:image/png;base64,${result.toString('base64')}`;
    
    console.log('✅ Alternative coloring page conversion completed');
    return resultDataUri;
    
  } catch (error) {
    console.error('❌ Alternative conversion failed:', error);
    throw error;
  }
}
