// Environment configuration for client-side usage
export const config = {
  googleAppsScriptUrl: process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzADHiFd3petRWbqhQonzVMv6A1e4AL4cL64x1MIWDaFeWHPcW-t5HKvwCSxGxpfG8B/exec',
  googleSheetsApiKey: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY,
  googleSpreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID
};
