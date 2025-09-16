// Debug script to test credit system
const fs = require('fs');
const path = require('path');

// Simulate localStorage data
const mockUserData = {
  uid: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  credits: 50,
  status: 'active',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

console.log('=== CREDIT SYSTEM DEBUG ===');
console.log('Mock user data:', mockUserData);
console.log('User credits:', mockUserData.credits);

// Test credit deduction
const cost = 35; // TEXT_TO_COLORING cost
console.log('Cost to deduct:', cost);
console.log('Credits >= Cost?', mockUserData.credits >= cost);

if (mockUserData.credits >= cost) {
  const newCredits = mockUserData.credits - cost;
  console.log('New credits after deduction:', newCredits);
  console.log('✅ Credit deduction should work');
} else {
  console.log('❌ Not enough credits');
}

// Test the actual pricing config
const PRICING_CONFIG = {
  FEATURE_COSTS: {
    TEXT_TO_COLORING: 35,
    PHOTO_TO_COLORING: 27,
    STORY_WITH_CHILD_NAME: 66,
  }
};

console.log('\n=== PRICING CONFIG TEST ===');
console.log('TEXT_TO_COLORING cost:', PRICING_CONFIG.FEATURE_COSTS.TEXT_TO_COLORING);
console.log('User has 50, needs 35, should work:', 50 >= PRICING_CONFIG.FEATURE_COSTS.TEXT_TO_COLORING);
