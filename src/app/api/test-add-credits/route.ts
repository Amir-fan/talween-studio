import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TEST API] Test endpoint called');
    
    return NextResponse.json({
      success: true,
      message: 'Test API is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🧪 [TEST API] Error:', error);
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [TEST API] POST test endpoint called');
    
    const body = await request.json();
    console.log('🧪 [TEST API] Request body:', body);
    
    return NextResponse.json({
      success: true,
      message: 'POST test successful',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🧪 [TEST API] POST Error:', error);
    return NextResponse.json(
      { error: 'POST test failed' },
      { status: 500 }
    );
  }
}
