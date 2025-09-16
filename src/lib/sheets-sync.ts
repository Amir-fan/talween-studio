import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SHEET_NAME = 'Sheet1';

export interface SheetUserRow {
  id: string;
  email: string;
  display_name: string;
  credits: number;
  status: string;
  email_verified: boolean;
  subscription_tier: string;
  created_at: number;
  last_login?: number;
  total_spent: number;
}

export async function fetchAllUsersFromSheets(): Promise<SheetUserRow[]> {
  if (!SPREADSHEET_ID) return [];

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:J10000`,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    });

    const rows = (res.data.values || []) as any[];
    return rows
      .filter(r => r && r[0])
      .map(r => {
        const createdAt = typeof r[7] === 'number' ? r[7] : Date.now() / 1000;
        const lastLogin = r[8] && typeof r[8] === 'number' ? r[8] : undefined;
        return {
          id: String(r[0]),
          email: String(r[1] || ''),
          display_name: String(r[2] || ''),
          credits: Number(r[3] || 0),
          status: String(r[4] || 'active'),
          email_verified: String(r[5] || 'لا') === 'نعم',
          subscription_tier: String(r[6] || 'FREE'),
          created_at: Math.floor(createdAt),
          last_login: lastLogin ? Math.floor(lastLogin) : undefined,
          total_spent: Number(r[9] || 0),
        } as SheetUserRow;
      });
  } catch (e) {
    console.error('Failed fetching users from Google Sheets:', e);
    return [];
  }
}


