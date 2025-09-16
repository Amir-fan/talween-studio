# Talween Studio - Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./database.sqlite"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Google Sheets Integration
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID="your-spreadsheet-id-here"

# MyFatoorah Payment Integration
MYFATOORAH_API_KEY="your_myfatoorah_api_key_here"
MYFATOORAH_BASE_URL="https://api.myfatoorah.com"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google AI
GOOGLE_AI_API_KEY="your-google-ai-api-key"
```

## Setup Steps

### 1. Email Configuration (Required)

#### For Gmail:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

#### For Other Email Providers:
- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Use your provider's settings

### 2. Google Sheets Integration (Required)

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Sheets API:**
   - Go to APIs & Services → Library
   - Search for "Google Sheets API"
   - Enable it

3. **Create Service Account:**
   - Go to APIs & Services → Credentials
   - Create Credentials → Service Account
   - Fill in details and create
   - Go to the service account → Keys tab
   - Add Key → JSON
   - Download the JSON file

4. **Create Google Spreadsheet:**
   - Create a new Google Spreadsheet
   - Share it with the service account email (from JSON file)
   - Give "Editor" permissions
   - Copy the Spreadsheet ID from the URL

5. **Update Environment Variables:**
   - Use the `client_email` from JSON as `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Use the `private_key` from JSON as `GOOGLE_PRIVATE_KEY`
   - Use the Spreadsheet ID as `GOOGLE_SPREADSHEET_ID`

### 3. Stripe Payment (Optional)

1. **Create Stripe Account:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Get your API keys from Developers → API keys

2. **Set up Webhooks:**
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook secret

### 4. Google AI (Already configured)

The Google AI API key is already configured in your project.

## Installation

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   - Copy the example above to `.env.local`
   - Fill in all required values

3. **Initialize Database:**
   ```bash
   npm run dev
   ```
   The database will be created automatically on first run.

4. **Initialize Google Sheets:**
   - Go to `/admin` in your browser
   - Click "مزامنة Google Sheets" to set up the sheets

## Features Implemented

### ✅ Email Automation
- Email verification on signup
- Welcome email after verification
- Password reset emails
- Order confirmation emails
- Payment success/failure emails
- Abandoned cart emails
- Digital delivery emails

### ✅ Database Management
- SQLite database with user management
- Order tracking
- Email logs
- Admin user management

### ✅ Admin Dashboard
- User management
- Credit allocation
- Order tracking
- Email logs
- Google Sheets sync

### ✅ Google Sheets Integration
- Automatic user data export
- Order tracking
- Email logs
- Real-time sync

### ✅ Authentication System
- Secure registration with email verification
- JWT-based authentication
- Password reset functionality
- Admin access control

## Admin Access

- **URL:** `/admin`
- **Default Admin:** `admin@talween.com` / `admin123`

## Email Templates

All email templates are in Arabic and include:
- Beautiful HTML design
- RTL support
- Brand colors
- Responsive layout
- Clear call-to-action buttons

## Support

If you need help with any setup step, please provide:
1. The specific step you're stuck on
2. Any error messages you're seeing
3. Your current environment configuration (without sensitive data)
