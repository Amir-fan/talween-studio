// Client-side image processing for converting photos to coloring pages
export function convertImageToColoringPage(imageDataUri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to grayscale and create high contrast
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Convert to grayscale
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          
          // Create high contrast (black or white)
          const contrast = gray > 128 ? 255 : 0;
          
          data[i] = contrast;     // Red
          data[i + 1] = contrast; // Green
          data[i + 2] = contrast; // Blue
          // Alpha stays the same
        }
        
        // Apply edge detection to create outlines
        const edgeData = new Uint8ClampedArray(data);
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4;
            
            // Get surrounding pixels
            const top = data[((y - 1) * canvas.width + x) * 4];
            const bottom = data[((y + 1) * canvas.width + x) * 4];
            const left = data[(y * canvas.width + (x - 1)) * 4];
            const right = data[(y * canvas.width + (x + 1)) * 4];
            const center = data[idx];
            
            // Calculate edge strength
            const edgeStrength = Math.abs(center - top) + Math.abs(center - bottom) + 
                               Math.abs(center - left) + Math.abs(center - right);
            
            // If edge is strong enough, make it black, otherwise white
            const edgeValue = edgeStrength > 100 ? 0 : 255;
            
            edgeData[idx] = edgeValue;     // Red
            edgeData[idx + 1] = edgeValue; // Green
            edgeData[idx + 2] = edgeValue; // Blue
          }
        }
        
        // Put the processed data back
        const processedImageData = new ImageData(edgeData, canvas.width, canvas.height);
        ctx.putImageData(processedImageData, 0, 0);
        
        // Convert to data URI
        const processedDataUri = canvas.toDataURL('image/png');
        
        resolve(processedDataUri);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageDataUri;
      
    } catch (error) {
      reject(error);
    }
  });
}
