import { NextRequest, NextResponse } from 'next/server';
import { addUserToSheets } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Google Sheets configuration...');
    
    // Check environment variables
    const config = {
      GOOGLE_APPS_SCRIPT_URL: process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL ? 'SET' : 'NOT SET',
      GOOGLE_SHEETS_API_KEY: process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY ? 'SET' : 'NOT SET',
      GOOGLE_SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID || process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID ? 'SET' : 'NOT SET',
    };
    
    console.log('📊 Environment variables:', config);
    
    // Test user data
    const testUser = {
      id: 'test-' + Date.now(),
      email: 'test@example.com',
      display_name: 'Test User',
      credits: 50,
      status: 'active',
      email_verified: true,
      subscription_tier: 'FREE',
      created_at: Math.floor(Date.now() / 1000),
      total_spent: 0
    };
    
    console.log('🔄 Attempting to add test user to Google Sheets...');
    
    try {
      await addUserToSheets(testUser);
      console.log('✅ Google Sheets test successful');
      return NextResponse.json({ 
        success: true, 
        message: 'Google Sheets test successful',
        config 
      });
    } catch (error) {
      console.error('❌ Google Sheets test failed:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        config 
      });
    }
  } catch (error) {
    console.error('Error testing Google Sheets:', error);
    return NextResponse.json(
      { error: 'Failed to test Google Sheets' },
      { status: 500 }
    );
  }
}
