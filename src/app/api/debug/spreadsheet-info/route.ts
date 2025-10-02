import { NextResponse } from 'next/server';

export async function GET() {
  const serverSpreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const clientSpreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID;
  
  return NextResponse.json({
    serverSpreadsheetId: serverSpreadsheetId,
    clientSpreadsheetId: clientSpreadsheetId,
    expectedSpreadsheetId: '1e8H6MdRGF0QJNpNL0NvUwJtWv89Wqk6hQsZIocpb-mI',
    serverMatches: serverSpreadsheetId === '1e8H6MdRGF0QJNpNL0NvUwJtWv89Wqk6hQsZIocpb-mI',
    clientMatches: clientSpreadsheetId === '1e8H6MdRGF0QJNpNL0NvUwJtWv89Wqk6hQsZIocpb-mI',
    note: 'Check if the Google Apps Script is using the same Spreadsheet ID as your Google Sheet'
  });
}
