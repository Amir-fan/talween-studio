import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
    const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    
    if (!GOOGLE_APPS_SCRIPT_URL || !GOOGLE_SHEETS_API_KEY) {
      return NextResponse.json({
        error: 'Missing environment variables',
        GOOGLE_APPS_SCRIPT_URL: !!GOOGLE_APPS_SCRIPT_URL,
        GOOGLE_SHEETS_API_KEY: !!GOOGLE_SHEETS_API_KEY
      });
    }

    // Test the exact same request that the app would send
    const testData = {
      action: 'createUser',
      apiKey: GOOGLE_SHEETS_API_KEY,
      id: `user_debug_${Date.now()}`,
      email: 'debugtest@example.com',
      password: 'test123',
      displayName: 'Debug Test User',
      credits: 50,
      subscriptionTier: 'FREE',
      totalPaid: 0
    };

    console.log('🔍 DEBUG: Sending request to Google Apps Script');
    console.log('  - URL:', GOOGLE_APPS_SCRIPT_URL);
    console.log('  - Data:', JSON.stringify(testData, null, 2));

    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('🔍 DEBUG: Google Apps Script response');
    console.log('  - Status:', response.status);
    console.log('  - Result:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      requestData: testData,
      response: result,
      status: response.status,
      url: GOOGLE_APPS_SCRIPT_URL
    });

  } catch (error) {
    console.error('🔍 DEBUG: Error in Google Sheets request test');
    console.error('  - Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
