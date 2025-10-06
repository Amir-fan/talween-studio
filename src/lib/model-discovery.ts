/**
 * Model discovery utility to find available and working Gemini models
 */

export interface AvailableModel {
  name: string;
  displayName: string;
  version: string;
  supportedMethods: string[];
  apiVersion: 'v1' | 'v1beta';
}

export interface ModelDiscoveryResult {
  availableModels: AvailableModel[];
  recommendedModel: AvailableModel | null;
  workingImageModels: AvailableModel[];
}

/**
 * Discover available Gemini models and their capabilities
 */
export async function discoverAvailableModels(apiKey: string): Promise<ModelDiscoveryResult> {
  console.log('🔍 Discovering available Gemini models...');
  
  const availableModels: AvailableModel[] = [];
  const workingImageModels: AvailableModel[] = [];
  
  // Check both API versions
  const apiVersions = ['v1', 'v1beta'];
  
  for (const version of apiVersions) {
    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
      console.log(`Checking ${version} API...`);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`❌ ${version} API not accessible: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const models = data.models || [];
      
      console.log(`✅ Found ${models.length} models in ${version} API`);
      
      for (const model of models) {
        const modelInfo: AvailableModel = {
          name: model.name || model.baseModel,
          displayName: model.displayName || model.name || 'Unknown',
          version: model.version || 'unknown',
          supportedMethods: model.supportedGenerationMethods || [],
          apiVersion: version as 'v1' | 'v1beta'
        };
        
        availableModels.push(modelInfo);
        
        // Check if this model supports image generation
        if (modelInfo.supportedMethods.includes('generateContent') && 
            (modelInfo.name.includes('gemini') || modelInfo.name.includes('imagen'))) {
          workingImageModels.push(modelInfo);
          console.log(`📸 Found image-capable model: ${modelInfo.name} (${version})`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${version} API:`, error);
    }
  }
  
  // Find the best recommended model
  const recommendedModel = findBestModel(workingImageModels);
  
  console.log(`🎯 Recommended model: ${recommendedModel?.name || 'None found'}`);
  console.log(`📊 Total image-capable models: ${workingImageModels.length}`);
  
  return {
    availableModels,
    recommendedModel,
    workingImageModels
  };
}

/**
 * Find the best model based on preferences
 */
function findBestModel(models: AvailableModel[]): AvailableModel | null {
  if (models.length === 0) return null;
  
  // Preference order: newer models first, then by capability
  const preferences = [
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro-vision'
  ];
  
  // First, try to find a model that matches our preferences
  for (const preference of preferences) {
    const match = models.find(m => m.name.includes(preference));
    if (match) {
      console.log(`🎯 Selected preferred model: ${match.name}`);
      return match;
    }
  }
  
  // Fallback: return the first available model
  const fallback = models[0];
  console.log(`🎯 Using fallback model: ${fallback.name}`);
  return fallback;
}

/**
 * Test if a specific model works for image generation
 */
export async function testModelForImageGeneration(
  model: AvailableModel, 
  apiKey: string, 
  testImageData: string
): Promise<{ success: boolean; error?: string }> {
  console.log(`🧪 Testing model ${model.name} for image generation...`);
  
  try {
    const endpoint = `https://generativelanguage.googleapis.com/${model.apiVersion}/models/${model.name}:generateContent?key=${apiKey}`;
    
    const testPayload = {
      contents: [
        {
          parts: [
            { text: "Convert this image to a simple black and white line art." },
            { 
              inline_data: { 
                mime_type: "image/jpeg", 
                data: testImageData.substring(testImageData.indexOf(',') + 1)
              } 
            }
          ]
        }
      ]
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorText}` 
      };
    }
    
    const result = await response.json();
    
    // Check if we got a valid response with image data
    const hasImageResponse = result.candidates?.[0]?.content?.parts?.some(
      (part: any) => part.inlineData
    );
    
    if (hasImageResponse) {
      console.log(`✅ Model ${model.name} works for image generation`);
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Model responded but did not return image data' 
      };
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get the best working model for image conversion
 */
export async function getBestWorkingImageModel(apiKey: string): Promise<AvailableModel | null> {
  console.log('🔍 Finding best working image model...');
  
  const discovery = await discoverAvailableModels(apiKey);
  
  if (discovery.workingImageModels.length === 0) {
    console.log('❌ No image-capable models found');
    return null;
  }
  
  // Test the recommended model first
  if (discovery.recommendedModel) {
    const testResult = await testModelForImageGeneration(
      discovery.recommendedModel, 
      apiKey,
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A' // Minimal test image
    );
    
    if (testResult.success) {
      return discovery.recommendedModel;
    } else {
      console.log(`❌ Recommended model failed test: ${testResult.error}`);
    }
  }
  
  // Test other models
  for (const model of discovery.workingImageModels) {
    if (model === discovery.recommendedModel) continue; // Already tested
    
    const testResult = await testModelForImageGeneration(model, apiKey, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A');
    
    if (testResult.success) {
      console.log(`✅ Found working model: ${model.name}`);
      return model;
    } else {
      console.log(`❌ Model ${model.name} failed: ${testResult.error}`);
    }
  }
  
  console.log('❌ No working image models found');
  return null;
}
