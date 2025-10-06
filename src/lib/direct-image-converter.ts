/**
 * Direct image converter that forces line art conversion
 * Uses multiple techniques to ensure the image is actually converted
 */

import sharp from 'sharp';

/**
 * Convert image to line art with aggressive processing
 */
export async function forceLineArtConversion(imageDataUri: string): Promise<string> {
  console.log('🎨 FORCE converting image to line art...');
  
  try {
    // Extract base64 data
    const base64Data = imageDataUri.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('📊 Original image buffer size:', imageBuffer.length);
    
    // Apply aggressive line art conversion
    const processedBuffer = await applyAggressiveLineArtConversion(imageBuffer);
    
    console.log('📊 Processed image buffer size:', processedBuffer.length);
    
    // Convert back to data URI
    const resultDataUri = `data:image/png;base64,${processedBuffer.toString('base64')}`;
    
    console.log('✅ AGGRESSIVE line art conversion completed');
    return resultDataUri;
    
  } catch (error) {
    console.error('❌ Aggressive conversion failed:', error);
    throw new Error(`Failed to convert image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Apply aggressive line art conversion with multiple techniques
 */
async function applyAggressiveLineArtConversion(imageBuffer: Buffer): Promise<Buffer> {
  console.log('🔥 Applying AGGRESSIVE line art conversion...');
  
  try {
    // Step 1: Convert to grayscale with high contrast
    let processed = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .linear(3, -128) // High contrast
      .png()
      .toBuffer();
    
    console.log('✅ Step 1: Grayscale + high contrast applied');
    
    // Step 2: Apply edge detection with multiple kernels
    processed = await applyMultipleEdgeDetection(processed);
    console.log('✅ Step 2: Multiple edge detection applied');
    
    // Step 3: Convert to pure black and white
    processed = await sharp(processed)
      .threshold(50) // Low threshold for more black lines
      .png()
      .toBuffer();
    
    console.log('✅ Step 3: Threshold applied');
    
    // Step 4: Apply morphological operations to clean up
    processed = await applyMorphologicalCleanup(processed);
    console.log('✅ Step 4: Morphological cleanup applied');
    
    // Step 5: Final contrast adjustment
    processed = await sharp(processed)
      .linear(2, 0)
      .png()
      .toBuffer();
    
    console.log('✅ Step 5: Final contrast applied');
    
    return processed;
    
  } catch (error) {
    console.error('❌ Aggressive conversion failed:', error);
    throw error;
  }
}

/**
 * Apply multiple edge detection techniques
 */
async function applyMultipleEdgeDetection(imageBuffer: Buffer): Promise<Buffer> {
  console.log('🔍 Applying multiple edge detection...');
  
  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width!;
    const height = metadata.height!;
    
    console.log(`📐 Image dimensions: ${width}x${height}`);
    
    // Get raw image data
    const { data } = await sharp(imageBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    console.log(`📊 Raw data length: ${data.length}`);
    
    // Create edge-detected image
    const edgeData = new Uint8ClampedArray(data.length);
    
    // Apply Sobel edge detection with aggressive settings
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Sobel X kernel (more aggressive)
        const gx = 
          -2 * data[(y-1) * width + (x-1)] + 2 * data[(y-1) * width + (x+1)] +
          -4 * data[y * width + (x-1)] + 4 * data[y * width + (x+1)] +
          -2 * data[(y+1) * width + (x-1)] + 2 * data[(y+1) * width + (x+1)];
        
        // Sobel Y kernel (more aggressive)
        const gy = 
          -2 * data[(y-1) * width + (x-1)] - 4 * data[(y-1) * width + x] - 2 * data[(y-1) * width + (x+1)] +
          2 * data[(y+1) * width + (x-1)] + 4 * data[(y+1) * width + x] + 2 * data[(y+1) * width + (x+1)];
        
        // Calculate gradient magnitude
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        // Apply low threshold for more edges
        edgeData[idx] = magnitude > 30 ? 0 : 255;
      }
    }
    
    // Handle borders
    for (let i = 0; i < width; i++) {
      edgeData[i] = 255; // Top border
      edgeData[(height - 1) * width + i] = 255; // Bottom border
    }
    for (let i = 0; i < height; i++) {
      edgeData[i * width] = 255; // Left border
      edgeData[i * width + (width - 1)] = 255; // Right border
    }
    
    console.log(`📊 Edge data created, length: ${edgeData.length}`);
    
    // Convert back to image buffer
    const result = await sharp(edgeData, {
      raw: {
        width,
        height,
        channels: 1
      }
    })
    .png()
    .toBuffer();
    
    console.log(`📊 Result buffer size: ${result.length}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Edge detection failed:', error);
    throw error;
  }
}

/**
 * Apply morphological cleanup operations
 */
async function applyMorphologicalCleanup(imageBuffer: Buffer): Promise<Buffer> {
  console.log('🧹 Applying morphological cleanup...');
  
  try {
    let processed = imageBuffer;
    
    // Erode to thin lines
    processed = await sharp(processed)
      .morphology({
        kernel: sharp.kernel.square(2),
        operation: 'erode'
      })
      .toBuffer();
    
    console.log('✅ Erosion applied');
    
    // Dilate to thicken important lines
    processed = await sharp(processed)
      .morphology({
        kernel: sharp.kernel.square(3),
        operation: 'dilate'
      })
      .toBuffer();
    
    console.log('✅ Dilation applied');
    
    // Final erosion to clean up
    processed = await sharp(processed)
      .morphology({
        kernel: sharp.kernel.square(1),
        operation: 'erode'
      })
      .toBuffer();
    
    console.log('✅ Final erosion applied');
    
    return processed;
    
  } catch (error) {
    console.error('❌ Morphological cleanup failed:', error);
    throw error;
  }
}

/**
 * Simple fallback conversion that definitely changes the image
 */
export async function simpleLineArtFallback(imageDataUri: string): Promise<string> {
  console.log('🔄 Using simple fallback conversion...');
  
  try {
    const base64Data = imageDataUri.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Apply simple but effective conversion
    const processed = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .linear(5, -200) // Very high contrast
      .threshold(100)
      .negate() // Invert colors
      .png()
      .toBuffer();
    
    const resultDataUri = `data:image/png;base64,${processed.toString('base64')}`;
    
    console.log('✅ Simple fallback completed');
    return resultDataUri;
    
  } catch (error) {
    console.error('❌ Simple fallback failed:', error);
    throw error;
  }
}
