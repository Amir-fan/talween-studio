import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    console.log('🔍 Testing payment user lookup for:', userId);
    
    // Test the exact same lookup that payment API uses
    const user = await googleSheetsUserDb.findById(userId);
    
    console.log('📊 User lookup result:', user);
    
    return NextResponse.json({
      success: true,
      user: user,
      message: 'User lookup test completed'
    });
  } catch (error) {
    console.error('❌ Payment user test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
