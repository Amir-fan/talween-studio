import { NextResponse } from 'next/server';

export async function GET() {
  const serverUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const clientUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
  
  return NextResponse.json({
    serverUrl: serverUrl,
    clientUrl: clientUrl,
    expectedUrl: 'https://script.google.com/macros/s/AKfycbzADHiFd3petRWbqhQonzVMv6A1e4AL4cL64x1MIWDaFeWHPcW-t5HKvwCSxGxpfG8B/exec',
    serverMatches: serverUrl === 'https://script.google.com/macros/s/AKfycbzADHiFd3petRWbqhQonzVMv6A1e4AL4cL64x1MIWDaFeWHPcW-t5HKvwCSxGxpfG8B/exec',
    clientMatches: clientUrl === 'https://script.google.com/macros/s/AKfycbzADHiFd3petRWbqhQonzVMv6A1e4AL4cL64x1MIWDaFeWHPcW-t5HKvwCSxGxpfG8B/exec'
  });
}
