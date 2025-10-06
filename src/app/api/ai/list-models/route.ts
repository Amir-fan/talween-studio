import { NextRequest, NextResponse } from 'next/server';
import { discoverAvailableModels } from '@/lib/model-discovery';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('🔍 Discovering available models...');
    const discovery = await discoverAvailableModels(apiKey);
    
    return NextResponse.json({
      success: true,
      data: {
        totalModels: discovery.availableModels.length,
        imageModels: discovery.workingImageModels.length,
        recommendedModel: discovery.recommendedModel?.name || 'None',
        allModels: discovery.availableModels.map(m => ({
          name: m.name,
          displayName: m.displayName,
          version: m.version,
          apiVersion: m.apiVersion,
          supportedMethods: m.supportedMethods
        })),
        imageCapableModels: discovery.workingImageModels.map(m => ({
          name: m.name,
          displayName: m.displayName,
          apiVersion: m.apiVersion
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Model discovery failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to discover models',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}