// Environment Setup Helper
// Run with: node setup-env.js

const fs = require('fs');
const path = require('path');

const envExample = `# Database
DATABASE_URL="file:./database.sqlite"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-here"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Google Sheets Integration
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour private key here\\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID="your-spreadsheet-id-here"

# MyFatoorah Payment Integration
MYFATOORAH_API_KEY="your_myfatoorah_api_key_here"
MYFATOORAH_BASE_URL="https://api.myfatoorah.com"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google AI
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Google Apps Script (Optional - for professional emails)
GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/your-script-id/exec"
`;

const envPath = path.join(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists');
  console.log('Current environment variables:');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  lines.forEach(line => {
    const [key] = line.split('=');
    if (key) {
      console.log(`  - ${key}`);
    }
  });
} else {
  console.log('📝 Creating .env.local file...');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env.local created successfully!');
  console.log('📋 Please update the values in .env.local with your actual API keys');
}

console.log('\n🔧 Quick Setup Guide:');
console.log('1. Get MyFatoorah API key: https://portal.myfatoorah.com/');
console.log('2. Get Google AI API key: https://aistudio.google.com/');
console.log('3. Update .env.local with your keys');
console.log('4. Run: npm run dev');
console.log('\n💡 For development, the app will use mock payment service if MyFatoorah API key is missing');
