// Environment configuration for client-side usage
export const config = {
  googleAppsScriptUrl: process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyz5QjB9BlrtemRf7mOnjTHaSBN9kxxxT7Q0QFt9j3US6aVT2OlzcowbEFFQRb_YoeR/exec',
  googleSheetsApiKey: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || 'AIzaSyC5DtRGIPds3rDzw1odpzDxuzTE3UQbICA',
  googleSpreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID || '1e8H6MdRGF0QJNpNL0NvUwJtWv89Wqk6hQsZIocpb-mI'
};
