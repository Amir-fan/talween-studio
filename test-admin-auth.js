// Test admin authentication and cookie handling
const fs = require('fs');
const path = require('path');

console.log('🔍 TESTING ADMIN AUTHENTICATION...\n');

// Step 1: Check if admin user exists in database
const dbPath = path.join(process.cwd(), 'database.json');
console.log('📊 Step 1: Checking Admin User in Database');

try {
  const dbData = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(dbData);
  
  console.log('  - Admin users:', Object.keys(db.adminUsers).length);
  console.log('  - Admin user IDs:', Object.keys(db.adminUsers));
  
  if (Object.keys(db.adminUsers).length > 0) {
    const adminId = Object.keys(db.adminUsers)[0];
    const adminUser = db.adminUsers[adminId];
    console.log('  - Admin email:', adminUser.email);
    console.log('  - Admin role:', adminUser.role);
  }
  
} catch (error) {
  console.log('❌ Database error:', error.message);
}

console.log('\n🔍 Step 2: Testing Admin Login API');

// Step 2: Test admin login API
const adminLoginData = {
  email: 'admin@talween.com',
  password: 'admin123'
};

console.log('  - Testing admin login with:', adminLoginData.email);
console.log('  - Password:', adminLoginData.password);

// We can't test the actual API call here, but we can verify the credentials
console.log('\n✅ Admin authentication test setup complete');
console.log('  - Admin credentials should be: admin@talween.com / admin123');
console.log('  - Admin token should be set as cookie: admin_token');
console.log('  - Cookie should include: path=/, max-age=86400, SameSite=Lax, Secure=false');
