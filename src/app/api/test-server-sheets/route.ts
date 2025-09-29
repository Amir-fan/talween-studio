import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing server-side Google Sheets API...');
    
    // Test creating a user
    const createResult = await googleSheetsUserDb.create(
      'servertest@example.com',
      'test123',
      'Server Test User'
    );
    
    console.log('📊 Create result:', createResult);
    
    if (createResult.success) {
      // Test finding the user
      const findResult = await googleSheetsUserDb.findByEmail('servertest@example.com');
      console.log('📊 Find result:', findResult);
      
      return NextResponse.json({
        success: true,
        message: 'Server-side Google Sheets test successful',
        createResult,
        findResult
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to create user',
        createResult
      });
    }
  } catch (error) {
    console.error('❌ Server-side Google Sheets test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test server-side Google Sheets',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
