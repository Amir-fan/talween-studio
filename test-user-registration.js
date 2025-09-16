// Test user registration flow
const { userDb } = require('./src/lib/simple-database');

console.log('🔍 TESTING USER REGISTRATION FLOW');
console.log('==================================\n');

// 1. Check current users
console.log('1️⃣ Current users in database:');
const allUsers = userDb.getAllUsers();
console.log('Total users:', allUsers.length);
allUsers.forEach((user, index) => {
  console.log(`  ${index + 1}. ${user.email} (${user.display_name}) - Status: ${user.status} - Verified: ${user.email_verified}`);
});
console.log('');

// 2. Test creating a new user
console.log('2️⃣ Testing user creation:');
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'password123';
const testName = 'Test User';

console.log('Creating user:', testEmail);
const createResult = userDb.create(testEmail, testPassword, testName);
console.log('Create result:', createResult);

if (createResult.success) {
  console.log('✅ User created successfully');
  
  // 3. Check users again
  console.log('\n3️⃣ Users after creation:');
  const updatedUsers = userDb.getAllUsers();
  console.log('Total users:', updatedUsers.length);
  updatedUsers.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.email} (${user.display_name}) - Status: ${user.status} - Verified: ${user.email_verified}`);
  });
  
  // 4. Test finding the user
  console.log('\n4️⃣ Testing user lookup:');
  const foundUser = userDb.findByEmail(testEmail);
  console.log('Found user:', foundUser ? 'YES' : 'NO');
  if (foundUser) {
    console.log('User details:', {
      id: foundUser.id,
      email: foundUser.email,
      display_name: foundUser.display_name,
      status: foundUser.status,
      email_verified: foundUser.email_verified,
      credits: foundUser.credits
    });
  }
} else {
  console.log('❌ User creation failed:', createResult.error);
}

console.log('\n✅ Test completed');
