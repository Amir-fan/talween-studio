# Vercel Environment Variables Setup

## 🚨 CRITICAL: Missing Environment Variables

Your Vercel deployment is missing essential environment variables. Here's how to fix them:

### 1. Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Go to your project: `talween-studio`
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### 2. Add These Environment Variables

#### **JWT_SECRET (CRITICAL)**
- **Name**: `JWT_SECRET`
- **Value**: `your-super-secure-jwt-secret-key-change-this-in-production-2024`
- **Environment**: Production, Preview, Development

#### **Google Apps Script URL**
- **Name**: `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL`
- **Value**: `https://script.google.com/macros/s/AKfycbyz5QjB9BlrtemRf7mOnjTHaSBN9kxxxT7Q0QFt9j3US6aVT2OlzcowbEFFQRb_YoeR/exec`
- **Environment**: Production, Preview, Development

#### **Google Sheets API Key**
- **Name**: `NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY`
- **Value**: `4808f174cdf9c9aa94cdd80d02d3b069fa04b49b`
- **Environment**: Production, Preview, Development

#### **Google Spreadsheet ID**
- **Name**: `NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID`
- **Value**: `1e8H6MdRGF0QJNpNL0NvUwJtWv89Wqk6hQsZIocpb-mI`
- **Environment**: Production, Preview, Development

### 3. After Adding Variables
1. Click **Save** for each variable
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Wait for deployment to complete

### 4. Test After Redeployment
Run this command to test:
```bash
curl https://italween.com/api/debug/env
```

You should see `JWT_SECRET` is now set.

## 🎯 Expected Result
After adding these variables and redeploying:
- ✅ User login will work
- ✅ Authentication will work properly
- ✅ Payment system will work
- ✅ All features will function correctly

## 📋 Current Status
- ✅ Website pages load correctly
- ✅ Admin login works
- ✅ User registration works
- ❌ User login fails (JWT_SECRET missing)
- ❌ Payment system fails (validation issues)
