import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/google-sheets-orders';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] Testing order creation...');
    
    // Test data
    const testData = {
      userId: 'test-user-123',
      amount: 1,
      packageId: 'TEST',
      credits: 22
    };
    
    console.log('🔍 [DEBUG] Test data:', testData);
    
    // Check environment variables
    const envCheck = {
      GOOGLE_SHEETS_API_KEY: process.env.GOOGLE_SHEETS_API_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY ? 'SET' : 'MISSING',
      GOOGLE_APPS_SCRIPT_URL: process.env.GOOGLE_APPS_SCRIPT_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL: process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL ? 'SET' : 'MISSING'
    };
    
    console.log('🔍 [DEBUG] Environment check:', envCheck);
    
    // Try to create order
    const result = await createOrder(testData);
    
    console.log('🔍 [DEBUG] Order creation result:', result);
    
    return NextResponse.json({
      success: true,
      testData,
      envCheck,
      orderResult: result
    });
    
  } catch (error: any) {
    console.error('🔍 [DEBUG] Order creation test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
