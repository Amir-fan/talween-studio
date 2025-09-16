// Test current Google Apps Script deployment
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVFOHBlvOTvRMNkQdxocDqGVvHdXCgzrFpVVUpA69OUjHDg1EWJ0ttpqHQKCPpXv1J/exec';

async function testCurrentAPI() {
  console.log('🧪 Testing current Google Apps Script deployment...');
  
  try {
    // Test without API key first
    console.log('1. Testing without API key...');
    const response1 = await fetch(GOOGLE_APPS_SCRIPT_URL);
    const data1 = await response1.json();
    console.log('Response without API key:', data1);
    
    // Test with API key
    console.log('2. Testing with API key...');
    const response2 = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=health&apiKey=talween_studio_2024_secure_key_xyz789abc123`);
    const data2 = await response2.json();
    console.log('Response with API key:', data2);
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testCurrentAPI();
