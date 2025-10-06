import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' }, { status: 500 });
    }

    // Try different Imagen models
    const models = [
      'imagen-4.0-generate-preview-06-06',
      'imagen-3.0-generate-001',
      'imagen-3.0-generate-002',
      'imagen-2.0-generate-001'
    ];

    const results = [];

    for (const model of models) {
      try {
        const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
        
        const prompt = `Simple black and white line art coloring page for children. Clean outlines, no shading, white background, black lines only.`;
        
        const payload = {
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            safetyFilterLevel: "BLOCK_ONLY_HIGH",
            personGeneration: "ALLOW_ADULT"
          }
        };
        
        console.log(`🧪 Testing ${model}...`);
        
        const response = await fetch(imagenEndpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        results.push({
          model,
          status: response.status,
          success: response.ok,
          hasImageData: !!(result.predictions?.[0]?.bytesBase64Encoded),
          error: result.error?.message || null,
          responseKeys: Object.keys(result)
        });
        
        console.log(`📥 ${model} result:`, {
          status: response.status,
          success: response.ok,
          hasImageData: !!(result.predictions?.[0]?.bytesBase64Encoded)
        });
        
      } catch (error) {
        results.push({
          model,
          status: 'ERROR',
          success: false,
          hasImageData: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
      workingModels: results.filter(r => r.success && r.hasImageData),
      apiKey: apiKey.substring(0, 10) + '...'
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
