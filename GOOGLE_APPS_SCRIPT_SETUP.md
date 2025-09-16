# Google Apps Script Email Setup Guide

This guide will help you set up Google Apps Script to handle email sending for Talween Studio.

## Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Delete the default code and paste the entire content from `google-apps-script-code.js`
4. Save the project and give it a name like "Talween Studio Email Service"

## Step 2: Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set the following:
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
4. Click "Deploy"
5. Copy the Web App URL (it will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

## Step 3: Update Environment Variables

1. Open your `.env.local` file
2. Replace `YOUR_SCRIPT_ID` in the `GOOGLE_APPS_SCRIPT_URL` with your actual script ID
3. The final URL should look like: `GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/ABC123DEF456/exec`

## Step 4: Test the Setup

Run the test command:
```bash
node test-email-apps-script.js
```

## Step 5: Test User Registration

1. Start your development server: `npm run dev`
2. Go to the signup page
3. Create a new account
4. Check your email for the verification message

## Benefits of Google Apps Script

✅ **No SMTP configuration needed**
✅ **Uses your Gmail account automatically**
✅ **No App Password required**
✅ **More reliable than SMTP**
✅ **Beautiful HTML email templates**
✅ **Built-in error handling**

## Troubleshooting

- **Script not found**: Make sure the URL is correct and the script is deployed
- **Permission denied**: Make sure "Who has access" is set to "Anyone"
- **Email not sending**: Check the Apps Script logs in the Google Apps Script editor
- **Template issues**: Verify the email templates in the script code

## Email Templates Included

- **Email Verification**: Welcome email with verification link
- **Welcome**: Post-verification welcome message
- **Password Reset**: Password reset instructions
- **Custom**: Fallback for other email types

All templates are in Arabic and use beautiful, responsive HTML design!
