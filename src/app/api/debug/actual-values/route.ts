import { NextResponse } from 'next/server';

export async function GET() {
  const serverGoogleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const serverGoogleSheetsApiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const serverGoogleSpreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  
  const clientGoogleAppsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
  const clientGoogleSheetsApiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
  const clientGoogleSpreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID;

  return NextResponse.json({
    serverSide: {
      googleAppsScriptUrl: serverGoogleAppsScriptUrl,
      googleSheetsApiKey: serverGoogleSheetsApiKey ? serverGoogleSheetsApiKey.substring(0, 10) + '...' : 'NOT SET',
      googleSpreadsheetId: serverGoogleSpreadsheetId,
    },
    clientSide: {
      googleAppsScriptUrl: clientGoogleAppsScriptUrl,
      googleSheetsApiKey: clientGoogleSheetsApiKey ? clientGoogleSheetsApiKey.substring(0, 10) + '...' : 'NOT SET',
      googleSpreadsheetId: clientGoogleSpreadsheetId,
    },
    expected: {
      url: 'https://script.google.com/macros/s/AKfycbzADHiFd3petRWbqhQonzVMv6A1e4AL4cL64x1MIWDaFeWHPcW-t5HKvwCSxGxpfG8B/exec',
      apiKey: '4808f174cdf9c9aa94cdd80d02d3b069fa04b49b'
    }
  });
}
