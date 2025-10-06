/**
 * Server-side image processing for line art conversion
 * Uses Node.js compatible image processing
 */

import sharp from 'sharp';

export interface LineArtOptions {
  edgeThreshold?: number;
  lineThickness?: number;
  backgroundRemoval?: boolean;
  smoothing?: boolean;
}

/**
 * Convert image to line art using Sharp for server-side processing
 */
export async function convertImageToLineArtServer(
  imageBuffer: Buffer,
  options: LineArtOptions = {}
): Promise<Buffer> {
  console.log('🎨 Converting image to line art using server-side processing...');
  
  const {
    edgeThreshold = 100,
    lineThickness = 2,
    backgroundRemoval = true,
    smoothing = true
  } = options;

  try {
    // First, convert to grayscale
    let processedImage = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .toBuffer();

    // Apply edge detection using convolution
    processedImage = await applyEdgeDetection(processedImage, edgeThreshold);

    // Apply line art effects
    processedImage = await applyLineArtEffects(processedImage, {
      lineThickness,
      backgroundRemoval,
      smoothing
    });

    console.log('✅ Server-side line art conversion completed');
    return processedImage;

  } catch (error) {
    console.error('❌ Server-side image processing failed:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Apply edge detection using Sobel operator
 */
async function applyEdgeDetection(imageBuffer: Buffer, threshold: number): Promise<Buffer> {
  console.log('🔍 Applying edge detection...');
  
  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width!;
    const height = metadata.height!;

    // Get raw image data
    const { data } = await sharp(imageBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Apply Sobel edge detection
    const edgeData = new Uint8ClampedArray(data.length);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Sobel X kernel
        const gx = 
          -data[(y-1) * width + (x-1)] + data[(y-1) * width + (x+1)] +
          -2 * data[y * width + (x-1)] + 2 * data[y * width + (x+1)] +
          -data[(y+1) * width + (x-1)] + data[(y+1) * width + (x+1)];
        
        // Sobel Y kernel
        const gy = 
          -data[(y-1) * width + (x-1)] - 2 * data[(y-1) * width + x] - data[(y-1) * width + (x+1)] +
          data[(y+1) * width + (x-1)] + 2 * data[(y+1) * width + x] + data[(y+1) * width + (x+1)];
        
        // Calculate gradient magnitude
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        // Apply threshold
        edgeData[idx] = magnitude > threshold ? 0 : 255;
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

    return result;

  } catch (error) {
    console.error('❌ Edge detection failed:', error);
    throw error;
  }
}

/**
 * Apply line art effects to the processed image
 */
async function applyLineArtEffects(
  imageBuffer: Buffer, 
  options: LineArtOptions
): Promise<Buffer> {
  console.log('✏️ Applying line art effects...');
  
  try {
    let processed = imageBuffer;

    // Apply threshold to create pure black and white
    processed = await sharp(processed)
      .threshold(128)
      .toBuffer();

    // Apply morphological operations to clean up the lines
    if (options.smoothing) {
      processed = await sharp(processed)
        .morphology({
          kernel: sharp.kernel.square(2),
          operation: 'erode'
        })
        .morphology({
          kernel: sharp.kernel.square(1),
          operation: 'dilate'
        })
        .toBuffer();
    }

    // Adjust line thickness if needed
    if (options.lineThickness > 1) {
      const iterations = Math.min(options.lineThickness - 1, 3);
      for (let i = 0; i < iterations; i++) {
        processed = await sharp(processed)
          .morphology({
            kernel: sharp.kernel.square(3),
            operation: 'dilate'
          })
          .toBuffer();
      }
    }

    console.log('✅ Line art effects applied');
    return processed;

  } catch (error) {
    console.error('❌ Line art effects failed:', error);
    throw error;
  }
}

/**
 * Alternative approach using different image processing techniques
 */
export async function convertWithAlternativeProcessing(
  imageBuffer: Buffer
): Promise<Buffer> {
  console.log('🔄 Using alternative processing approach...');
  
  try {
    // Use a different approach with higher contrast and edge detection
    const processed = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .linear(2, 0) // Increase contrast
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] // Laplacian kernel
      })
      .threshold(100)
      .negate()
      .png()
      .toBuffer();

    console.log('✅ Alternative processing completed');
    return processed;

  } catch (error) {
    console.error('❌ Alternative processing failed:', error);
    throw error;
  }
}
