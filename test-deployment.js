// Test the current Google Apps Script deployment
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVFOHBlvOTvRMNkQdxocDqGVvHdXCgzrFpVVUpA69OUjHDg1EWJ0ttpqHQKCPpXv1J/exec';

async function testDeployment() {
  console.log('🧪 Testing Google Apps Script deployment...');
  
  try {
    // Test 1: No parameters
    console.log('1. Testing with no parameters...');
    const response1 = await fetch(GOOGLE_APPS_SCRIPT_URL);
    const data1 = await response1.json();
    console.log('Response:', data1);
    
    // Test 2: With action but no API key
    console.log('2. Testing with action but no API key...');
    const response2 = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=health`);
    const data2 = await response2.json();
    console.log('Response:', data2);
    
    // Test 3: With different API key format
    console.log('3. Testing with different API key format...');
    const response3 = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=health&apiKey=4808f174cdf9c9aa94cdd80d02d3b069fa04b49b`);
    const data3 = await response3.json();
    console.log('Response:', data3);
    
    // Test 4: With key parameter instead of apiKey
    console.log('4. Testing with key parameter...');
    const response4 = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=health&key=4808f174cdf9c9aa94cdd80d02d3b069fa04b49b`);
    const data4 = await response4.json();
    console.log('Response:', data4);
    
  } catch (error) {
    console.error('❌ Error testing deployment:', error);
  }
}

testDeployment();
