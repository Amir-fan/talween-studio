# 📧 Email Setup Guide - Google Apps Script

## Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the code from `GOOGLE_APPS_SCRIPT_PROFESSIONAL_EMAILS.js`
4. Save the project (Ctrl+S)
5. Give it a name like "Talween Email Service"

## Step 2: Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set "Execute as" to "Me"
4. Set "Who has access" to "Anyone"
5. Click "Deploy"
6. Copy the Web App URL (it will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

## Step 3: Update Environment Variables

Create a `.env.local` file in your project root with:

```env
# Google Apps Script Email Service
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Google Sheets Integration (if you want it)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-key-here
```

## Step 4: Test Email Service

1. Restart your development server
2. Try creating a new account
3. Check the console logs for email sending status
4. Check your email for verification links

## Email Templates Included

- ✅ **Email Verification** - Sent when user registers
- ✅ **Welcome Email** - Sent after email verification
- ✅ **Password Reset** - Sent when user requests password reset
- ✅ **Order Confirmation** - Sent when user makes a purchase
- ✅ **Payment Success** - Sent when payment is completed

## Troubleshooting

- If emails don't send, check the Google Apps Script logs
- Make sure the Web App URL is correct in `.env.local`
- Verify the Google Apps Script has permission to send emails
- Check that the script is deployed as a Web App (not just saved)
