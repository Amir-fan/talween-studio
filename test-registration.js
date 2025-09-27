// Test User Registration
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCnPVVhTeGGHSgxZVGi0ha9VAhvDDo1JyuuVpFrCA3N06jfAnzDqzyZEr9SFm7Poza/exec';
const GOOGLE_SHEETS_API_KEY = '4808f174cdf9c9aa94cdd80d02d3b069fa04b49b';

async function testRegistration() {
  try {
    console.log('🧪 Testing user registration...');
    
    const testUser = {
      action: 'createUser',
      apiKey: GOOGLE_SHEETS_API_KEY,
      email: 'testuser@example.com',
      displayName: 'Test User',
      password: 'testpassword123',
      credits: 50,
      status: 'active',
      subscriptionTier: 'FREE'
    };
    
    console.log('Creating user:', testUser.email);
    
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Registration result:', result);
    
    if (result.success) {
      console.log('✅ User created successfully!');
      console.log('User ID:', result.userId);
    } else {
      console.log('❌ User creation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testGetUsers() {
  try {
    console.log('🧪 Testing get users...');
    
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getUsers&apiKey=${GOOGLE_SHEETS_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Get users result:', result);
    
    if (result.success) {
      console.log(`✅ Found ${result.users.length} users`);
      result.users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email || user['البريد الإلكتروني']} - ${user.displayName || user['الاسم']}`);
      });
    } else {
      console.log('❌ Get users failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Get users test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting registration tests...');
  
  await testRegistration();
  console.log('');
  await testGetUsers();
  
  console.log('');
  console.log('🎉 Tests completed!');
}

runTests();
