// Test the credit system to reproduce the bug
const fs = require('fs');

console.log('🔍 TESTING CREDIT SYSTEM - REPRODUCING THE BUG');
console.log('================================================');

// Simulate the exact localStorage data structure
const mockUserData = {
  uid: 'user_123456789',
  email: 'test@example.com',
  name: 'Test User',
  credits: 50,
  status: 'active',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

console.log('📊 Mock User Data:');
console.log('  - uid:', mockUserData.uid);
console.log('  - credits:', mockUserData.credits);
console.log('  - email:', mockUserData.email);

// Test the credit deduction logic
const cost = 35; // TEXT_TO_COLORING cost
console.log('\n💰 Credit Deduction Test:');
console.log('  - Required credits:', cost);
console.log('  - Available credits:', mockUserData.credits);
console.log('  - Has enough?', mockUserData.credits >= cost);

if (mockUserData.credits >= cost) {
  const newCredits = mockUserData.credits - cost;
  console.log('  - New credits after deduction:', newCredits);
  console.log('✅ SHOULD WORK - Credits sufficient');
} else {
  console.log('❌ FAILED - Not enough credits');
}

// Test the exact logic from local-auth.ts
console.log('\n🔧 Testing exact deductLocalUserCredits logic:');

function testDeductCredits(userId, amount) {
  console.log(`  - Testing with userId: ${userId}, amount: ${amount}`);
  
  // Simulate getLocalUserData()
  const userData = mockUserData;
  console.log(`  - userData from localStorage:`, userData);
  
  if (!userData) {
    console.log('❌ No userData found in localStorage');
    return { success: false, error: 'User not found in localStorage' };
  }
  
  if (userData.uid !== userId) {
    console.log('❌ User ID mismatch:');
    console.log(`    - Expected userId: ${userId}`);
    console.log(`    - Found userData.uid: ${userData.uid}`);
    return { success: false, error: 'User ID mismatch' };
  }

  console.log(`  - Current credits: ${userData.credits}`);
  console.log(`  - Required credits: ${amount}`);
  console.log(`  - Has enough credits? ${userData.credits >= amount}`);

  if (userData.credits < amount) {
    console.log('❌ Not enough credits');
    return { success: false, error: 'Not enough credits' };
  }

  const newCredits = userData.credits - amount;
  console.log(`✅ Credits deducted successfully`);
  console.log(`  - New credits: ${newCredits}`);

  return { success: true, newCredits };
}

// Test with the exact user ID that would be passed
const testUserId = 'user_123456789'; // This should match mockUserData.uid
const result = testDeductCredits(testUserId, 35);

console.log('\n📋 Final Result:');
console.log(result);

// Test with wrong user ID to see the mismatch
console.log('\n🔍 Testing with wrong user ID:');
const wrongResult = testDeductCredits('wrong_id', 35);
console.log(wrongResult);
