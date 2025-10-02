import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 BASIC TEST - Starting...');
    
    return NextResponse.json({
      success: true,
      message: 'Basic test completed - no imports'
    });
  } catch (error) {
    console.error('❌ Basic test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
