// Test Google Sheets integration
const { addUserToSheets } = require('./src/lib/google-sheets');

console.log('🔍 TESTING GOOGLE SHEETS INTEGRATION');
console.log('=====================================\n');

// Test user data
const testUser = {
  id: 'test-123',
  email: 'test@example.com',
  display_name: 'Test User',
  credits: 50,
  status: 'active',
  email_verified: true,
  subscription_tier: 'FREE',
  created_at: Math.floor(Date.now() / 1000),
  total_spent: 0
};

console.log('📊 Test User Data:');
console.log(testUser);
console.log('');

console.log('🔄 Attempting to add user to Google Sheets...');
addUserToSheets(testUser)
  .then(() => {
    console.log('✅ Google Sheets test completed');
  })
  .catch((error) => {
    console.error('❌ Google Sheets test failed:', error);
  });
