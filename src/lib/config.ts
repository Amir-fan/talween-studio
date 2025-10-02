// Environment configuration for client-side usage
export const config = {
  googleAppsScriptUrl: process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz9yA6fJAIHHiroyqX2AUNlZ5C1QqUXh8VKCrGkX3ykIPRcpaHYbpX5wF39M6-y4XQ/exec',
  googleSheetsApiKey: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY,
  googleSpreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID
};
