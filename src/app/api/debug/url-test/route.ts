import { NextResponse } from 'next/server';

export async function GET() {
  const googleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  
  return NextResponse.json({
    googleAppsScriptUrl: googleAppsScriptUrl,
    expectedUrl: 'https://script.google.com/macros/s/AKfycbzADHiFd3petRWbqhQonzVMv6A1e4AL4cL64x1MIWDaFeWHPcW-t5HKvwCSxGxpfG8B/exec',
    isCorrect: googleAppsScriptUrl === 'https://script.google.com/macros/s/AKfycbzADHiFd3petRWbqhQonzVMv6A1e4AL4cL64x1MIWDaFeWHPcW-t5HKvwCSxGxpfG8B/exec'
  });
}

