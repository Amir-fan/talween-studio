// Test the exact browser scenario
console.log('🌐 TESTING BROWSER SCENARIO - EXACT REPRODUCTION');
console.log('==================================================');

// Simulate what happens when user logs in
function simulateUserLogin() {
  console.log('\n1️⃣ SIMULATING USER LOGIN:');
  
  // This is what gets stored in localStorage when user signs in
  const storedUser = {
    uid: 'user_123456789',
    email: 'test@example.com',
    displayName: 'Test User'
  };
  
  const storedUserData = {
    uid: 'user_123456789',
    email: 'test@example.com',
    name: 'Test User',
    credits: 50,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  console.log('  - storedUser (talween_user):', storedUser);
  console.log('  - storedUserData (talween_user_data):', storedUserData);
  
  return { storedUser, storedUserData };
}

// Simulate what the auth context does
function simulateAuthContext(storedUser, storedUserData) {
  console.log('\n2️⃣ SIMULATING AUTH CONTEXT:');
  
  if (storedUser.uid === 'admin') {
    console.log('  - Admin user detected');
    return {
      id: 'admin',
      email: 'admin@talween.com',
      displayName: 'مدير النظام',
      credits: 9999
    };
  } else if (storedUser.uid) {
    console.log('  - Regular user detected');
    let credits = storedUser.credits || 50;
    
    // Get latest credits from user_data if available
    if (storedUserData) {
      if (storedUserData.uid === storedUser.uid) {
        credits = storedUserData.credits || credits;
        console.log('  - Credits from user_data:', credits);
      }
    }
    
    const regularUser = {
      id: storedUser.uid, // Use uid as id
      email: storedUser.email,
      displayName: storedUser.displayName,
      credits: credits,
      status: storedUser.status || 'active',
      emailVerified: storedUser.emailVerified || false,
      subscriptionTier: storedUser.subscriptionTier || 'FREE'
    };
    
    console.log('  - Created user object:', regularUser);
    return regularUser;
  }
  
  return null;
}

// Simulate the credit deduction
function simulateCreditDeduction(user, cost) {
  console.log('\n3️⃣ SIMULATING CREDIT DEDUCTION:');
  console.log('  - user.id:', user.id);
  console.log('  - cost:', cost);
  
  // This is what getLocalUserData() returns
  const userData = {
    uid: 'user_123456789',
    email: 'test@example.com',
    name: 'Test User',
    credits: 50,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  console.log('  - userData from localStorage:', userData);
  
  if (!userData) {
    console.log('❌ No userData found in localStorage');
    return { success: false, error: 'User not found in localStorage' };
  }
  
  if (userData.uid !== user.id) {
    console.log('❌ User ID mismatch:');
    console.log('  - Expected userId:', user.id);
    console.log('  - Found userData.uid:', userData.uid);
    return { success: false, error: 'User ID mismatch' };
  }

  console.log('  - Current credits:', userData.credits);
  console.log('  - Required credits:', cost);
  console.log('  - Has enough credits?', userData.credits >= cost);

  if (userData.credits < cost) {
    console.log('❌ Not enough credits');
    return { success: false, error: 'Not enough credits' };
  }

  const newCredits = userData.credits - cost;
  console.log('✅ Credits deducted successfully');
  console.log('  - New credits:', newCredits);

  return { success: true, newCredits };
}

// Run the complete test
const { storedUser, storedUserData } = simulateUserLogin();
const user = simulateAuthContext(storedUser, storedUserData);
const result = simulateCreditDeduction(user, 35);

console.log('\n📋 FINAL RESULT:');
console.log(result);

if (result.success) {
  console.log('✅ CREDIT SYSTEM SHOULD WORK!');
} else {
  console.log('❌ CREDIT SYSTEM FAILED:', result.error);
}
