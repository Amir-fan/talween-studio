#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupProduction() {
  console.log('🚀 Talween Studio Production Setup');
  console.log('=====================================\n');

  console.log('This script will help you configure the environment variables for production.');
  console.log('You can skip any field by pressing Enter.\n');

  const envVars = {};

  // MyFatoorah Configuration
  console.log('💳 MyFatoorah Payment Integration:');
  envVars.MYFATOORAH_API_KEY = await question('MyFatoorah API Key: ');
  envVars.MYFATOORAH_BASE_URL = await question('MyFatoorah Base URL [https://api.myfatoorah.com]: ') || 'https://api.myfatoorah.com';

  // App Configuration
  console.log('\n🌐 App Configuration:');
  envVars.NEXT_PUBLIC_APP_URL = await question('App URL (e.g., https://yourdomain.com): ');
  envVars.JWT_SECRET = await question('JWT Secret (random string): ') || `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Google AI
  console.log('\n🤖 Google AI (for story generation):');
  envVars.GOOGLE_AI_API_KEY = await question('Google AI API Key: ');

  // Google Sheets
  console.log('\n📊 Google Sheets Integration:');
  envVars.GOOGLE_APPS_SCRIPT_URL = await question('Google Apps Script URL: ');
  envVars.GOOGLE_SHEETS_API_KEY = await question('Google Sheets API Key: ');

  // Email Configuration (Optional)
  console.log('\n📧 Email Configuration (Optional):');
  const setupEmail = await question('Setup email configuration? (y/n): ');
  if (setupEmail.toLowerCase() === 'y') {
    envVars.SMTP_HOST = await question('SMTP Host [smtp.gmail.com]: ') || 'smtp.gmail.com';
    envVars.SMTP_PORT = await question('SMTP Port [587]: ') || '587';
    envVars.SMTP_USER = await question('SMTP User (email): ');
    envVars.SMTP_PASS = await question('SMTP Password (app password): ');
  }

  // Create .env.local file
  const envContent = Object.entries(envVars)
    .filter(([key, value]) => value && value.trim())
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');

  const envPath = '.env.local';
  fs.writeFileSync(envPath, envContent);

  console.log(`\n✅ Environment variables saved to ${envPath}`);
  console.log('\n📋 Summary:');
  console.log('============');
  
  if (envVars.MYFATOORAH_API_KEY) {
    console.log('✅ MyFatoorah integration configured');
  } else {
    console.log('❌ MyFatoorah API key not set - payment will not work');
  }
  
  if (envVars.NEXT_PUBLIC_APP_URL) {
    console.log('✅ App URL configured');
  } else {
    console.log('❌ App URL not set - may cause issues with callbacks');
  }
  
  if (envVars.GOOGLE_AI_API_KEY) {
    console.log('✅ Google AI configured');
  } else {
    console.log('❌ Google AI not configured - story generation will not work');
  }

  console.log('\n🚀 Next steps:');
  console.log('1. Restart your development server');
  console.log('2. Test the $1 package to verify payments work');
  console.log('3. Check your MyFatoorah dashboard for transactions');
  
  if (!envVars.MYFATOORAH_API_KEY) {
    console.log('\n⚠️  IMPORTANT: You need to configure MyFatoorah API key for payments to work!');
    console.log('   Get your API key from: https://portal.myfatoorah.com/');
  }

  rl.close();
}

setupProduction().catch(console.error);
