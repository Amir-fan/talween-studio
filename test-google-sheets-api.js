// Test Google Sheets API
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCnPVVhTeGGHSgxZVGi0ha9VAhvDDo1JyuuVpFrCA3N06jfAnzDqzyZEr9SFm7Poza/exec';
const API_KEY = '4808f174cdf9c9aa94cdd80d02d3b069fa04b49b';

async function testGoogleSheetsAPI() {
  console.log('🧪 Testing Google Sheets API...');
  
  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=health&apiKey=${API_KEY}`);
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);
    
    // Test get users
    console.log('2. Testing get users...');
    const usersResponse = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getUsers&apiKey=${API_KEY}`);
    const usersData = await usersResponse.json();
    console.log('Users result:', usersData);
    
    // Test create user
    console.log('3. Testing create user...');
    const createResponse = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=createUser&apiKey=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createUser',
        apiKey: API_KEY,
        email: 'test@example.com',
        displayName: 'Test User',
        credits: 50
      })
    });
    const createData = await createResponse.json();
    console.log('Create user result:', createData);
    
  } catch (error) {
    console.error('❌ Error testing Google Sheets API:', error);
  }
}

testGoogleSheetsAPI();
