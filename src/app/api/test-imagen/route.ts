import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' }, { status: 500 });
    }

    const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-preview-06-06:predict?key=${apiKey}`;
    
    const prompt = `Simple black and white line art coloring page for children. Clean outlines, no shading, white background, black lines only.`;
    
    const payload = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        safetyFilterLevel: "BLOCK_ONLY_HIGH",
        personGeneration: "ALLOW_ADULT"
      }
    };
    
    console.log('🧪 Testing Imagen API with simple prompt...');
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(imagenEndpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('📥 Full response:', JSON.stringify(result, null, 2));
    
    return NextResponse.json({
      status: response.status,
      success: response.ok,
      response: result,
      hasImageData: !!(result.predictions?.[0]?.bytesBase64Encoded),
      imageDataLocation: result.predictions?.[0]?.bytesBase64Encoded ? 'predictions[0].bytesBase64Encoded' : 'NOT FOUND'
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
