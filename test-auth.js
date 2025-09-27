const { userDb } = require('./src/lib/simple-database.ts');

console.log('🧪 Testing Authentication Flow...');

// Test 1: Create a user
console.log('\n📝 Test 1: Creating user...');
const testEmail = 'test@example.com';
const testPassword = 'password123';
const testDisplayName = 'Test User';

try {
  const createResult = userDb.create(testEmail, testPassword, testDisplayName);
  console.log('Create result:', createResult);
  
  if (createResult.success) {
    console.log('✅ User created successfully');
    
    // Test 2: Find user by email
    console.log('\n🔍 Test 2: Finding user by email...');
    const foundUser = userDb.findByEmail(testEmail);
    console.log('Found user:', foundUser ? 'YES' : 'NO');
    
    if (foundUser) {
      console.log('User details:', {
        id: foundUser.id,
        email: foundUser.email,
        displayName: foundUser.display_name,
        hasPassword: !!foundUser.password,
        passwordLength: foundUser.password?.length || 0
      });
      
      // Test 3: Check database file
      console.log('\n💾 Test 3: Checking database file...');
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(process.cwd(), 'database.json');
      
      if (fs.existsSync(dbPath)) {
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        const db = JSON.parse(dbContent);
        console.log('Database file exists');
        console.log('Total users in file:', Object.keys(db.users || {}).length);
        
        if (db.users) {
          const userInFile = Object.values(db.users).find(u => u.email === testEmail);
          console.log('User found in file:', !!userInFile);
          if (userInFile) {
            console.log('User in file details:', {
              id: userInFile.id,
              email: userInFile.email,
              displayName: userInFile.display_name,
              hasPassword: !!userInFile.password,
              passwordLength: userInFile.password?.length || 0
            });
          }
        }
      } else {
        console.log('❌ Database file does not exist!');
      }
    } else {
      console.log('❌ User not found after creation!');
    }
  } else {
    console.log('❌ User creation failed:', createResult.error);
  }
} catch (error) {
  console.error('❌ Test failed with error:', error);
}
