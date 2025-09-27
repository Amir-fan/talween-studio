// Clear Google Sheets Data
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCnPVVhTeGGHSgxZVGi0ha9VAhvDDo1JyuuVpFrCA3N06jfAnzDqzyZEr9SFm7Poza/exec';
const GOOGLE_SHEETS_API_KEY = '4808f174cdf9c9aa94cdd80d02d3b069fa04b49b';

async function clearGoogleSheets() {
  try {
    console.log('🗑️ Clearing Google Sheets data...');
    
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=clearAllData&apiKey=${GOOGLE_SHEETS_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log(`✅ Successfully cleared ${data.clearedRows || 0} rows from Google Sheets`);
    } else {
      console.log('❌ Failed to clear Google Sheets:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error clearing Google Sheets:', error.message);
  }
}

clearGoogleSheets();
