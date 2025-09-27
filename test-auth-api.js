const https = require('https');
const http = require('http');

// Test authentication API endpoints
const testAuth = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Authentication API...');
  
  // Test data
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'password123';
  const testDisplayName = 'Test User';
  
  console.log(`📝 Test email: ${testEmail}`);
  
  try {
    // Test 1: Register user
    console.log('\n🔐 Test 1: Registering user...');
    const registerData = JSON.stringify({
      email: testEmail,
      password: testPassword,
      displayName: testDisplayName
    });
    
    const registerResult = await makeRequest(`${baseUrl}/api/auth/register`, 'POST', registerData);
    console.log('Register result:', registerResult);
    
    if (registerResult.success) {
      console.log('✅ Registration successful');
      
      // Wait a moment for database to save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test 2: Login user
      console.log('\n🔑 Test 2: Logging in user...');
      const loginData = JSON.stringify({
        email: testEmail,
        password: testPassword
      });
      
      const loginResult = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', loginData);
      console.log('Login result:', loginResult);
      
      if (loginResult.success) {
        console.log('✅ Login successful');
        console.log('🎉 Authentication flow works correctly!');
      } else {
        console.log('❌ Login failed:', loginResult.error);
      }
    } else {
      console.log('❌ Registration failed:', registerResult.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          resolve({ error: 'Invalid JSON response', raw: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Check if server is running
const checkServer = async () => {
  try {
    const result = await makeRequest('http://localhost:3000');
    return true;
  } catch (error) {
    return false;
  }
};

// Run the test
const runTest = async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server not running. Please start the development server with: npm run dev');
    console.log('   Then run this test again.');
    return;
  }
  
  await testAuth();
};

runTest();
