import { NextRequest, NextResponse } from 'next/server';
import { orderDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 ORDERDB TEST - Starting...');
    
    // Test order creation
    console.log('🔍 ORDERDB TEST - Testing order creation...');
    const orderResult = orderDb.create('test-user-123', 9.99, 'starter', 100);
    console.log('📊 Order created:', orderResult);
    
    return NextResponse.json({
      success: true,
      order: orderResult,
      message: 'OrderDb test completed'
    });
  } catch (error) {
    console.error('❌ OrderDb test error:', error);
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
