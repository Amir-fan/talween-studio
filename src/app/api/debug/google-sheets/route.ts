import { NextResponse } from 'next/server';

export async function GET() {
  const googleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const googleSheetsApiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const googleSpreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  
  const nextPublicGoogleAppsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
  const nextPublicGoogleSheetsApiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
  const nextPublicGoogleSpreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID;

  return NextResponse.json({
    serverSide: {
      googleAppsScriptUrl: googleAppsScriptUrl ? 'SET' : 'NOT SET',
      googleSheetsApiKey: googleSheetsApiKey ? 'SET' : 'NOT SET',
      googleSpreadsheetId: googleSpreadsheetId ? 'SET' : 'NOT SET',
    },
    clientSide: {
      nextPublicGoogleAppsScriptUrl: nextPublicGoogleAppsScriptUrl ? 'SET' : 'NOT SET',
      nextPublicGoogleSheetsApiKey: nextPublicGoogleSheetsApiKey ? 'SET' : 'NOT SET',
      nextPublicGoogleSpreadsheetId: nextPublicGoogleSpreadsheetId ? 'SET' : 'NOT SET',
    },
    actualValues: {
      serverGoogleAppsScriptUrl: googleAppsScriptUrl,
      serverGoogleSheetsApiKey: googleSheetsApiKey ? googleSheetsApiKey.substring(0, 10) + '...' : 'NOT SET',
      serverGoogleSpreadsheetId: googleSpreadsheetId,
    }
  });
}

