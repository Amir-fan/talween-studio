// Test Google Sheets integration
require('dotenv').config({ path: '.env.local' });

console.log('Testing Google Sheets integration...');
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? 'Set' : 'Not set');
console.log('GOOGLE_SPREADSHEET_ID:', process.env.GOOGLE_SPREADSHEET_ID);

const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function testSheets() {
  try {
    console.log('Testing Google Sheets API...');
    
    // Test reading from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'Sheet1!A1:J1',
    });
    
    console.log('✅ Google Sheets API is working!');
    console.log('Headers:', response.data.values);
    
    // Test writing to the sheet
    const testData = [[
      'test-id',
      'test@example.com',
      'Test User',
      '50',
      'pending',
      'لا',
      'FREE',
      new Date().toLocaleDateString('ar-SA'),
      'لم يسجل دخول',
      '0'
    ]];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'Sheet1!A:J',
      valueInputOption: 'RAW',
      requestBody: { values: testData }
    });
    
    console.log('✅ Successfully wrote test data to Google Sheets!');
    
  } catch (error) {
    console.error('❌ Google Sheets error:', error.message);
  }
}

testSheets();
