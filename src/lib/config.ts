// Environment configuration for client-side usage
export const config = {
  googleAppsScriptUrl: process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwCnPVVhTeGGHSgxZVGi0ha9VAhvDDo1JyuuVpFrCA3N06jfAnzDqzyZEr9SFm7Poza/exec',
  googleSheetsApiKey: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || '4808f174cdf9c9aa94cdd80d02d3b069fa04b49b',
  googleSpreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID || '1e8H6MdRGF0QJNpNL0NvUwJtWv89Wqk6hQsZIocpb-mI'
};
