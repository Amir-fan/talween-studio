# Google Sheets Setup Guide for Talween Studio

## 📊 **Required Google Sheet Structure**

### **Step 1: Create/Update Your Google Sheet**

1. **Go to**: [Google Sheets](https://sheets.google.com)
2. **Create a new sheet** or use existing one
3. **Rename the sheet to**: `Talween Studio Data`
4. **Set the Spreadsheet ID** in your Google Apps Script

### **Step 2: Set Up Column Headers (Row 1)**

Copy and paste these headers into **Row 1** of your Google Sheet:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `المعرف` | `البريد الإلكتروني` | `الاسم` | `كلمة المرور` | `النقاط` | `الحالة` | `البريد الإلكتروني مؤكد` | `تاريخ الإنشاء` | `آخر تسجيل دخول` | `المبلغ الإجمالي` | `رقم الهاتف` | `البلد` | `المدينة` | `العمر` | `الجنس` | `الاهتمامات` | `المصدر` | `ملاحظات` |

### **Step 3: Column Details**

| Column | Arabic Header | English | Data Type | Required | Description |
|--------|---------------|---------|-----------|----------|-------------|
| A | `المعرف` | ID | Text | ✅ | Unique user identifier (UUID) |
| B | `البريد الإلكتروني` | Email | Text | ✅ | User's email address |
| C | `الاسم` | Display Name | Text | ✅ | User's display name |
| D | `كلمة المرور` | Password | Text | ✅ | Hashed password (bcrypt) |
| E | `النقاط` | Credits | Number | ✅ | User's credit balance |
| F | `الحالة` | Status | Text | ✅ | User status (active, inactive, etc.) |
| G | `البريد الإلكتروني مؤكد` | Email Verified | Boolean | ✅ | Email verification status |
| H | `تاريخ الإنشاء` | Created Date | Date | ✅ | Account creation timestamp |
| I | `آخر تسجيل دخول` | Last Login | Date | ✅ | Last login timestamp |
| J | `المبلغ الإجمالي` | Total Spent | Number | ✅ | Total amount spent by user |
| K | `رقم الهاتف` | Phone Number | Text | ❌ | Optional phone number |
| L | `البلد` | Country | Text | ❌ | Optional country |
| M | `المدينة` | City | Text | ❌ | Optional city |
| N | `العمر` | Age | Number | ❌ | Optional age |
| O | `الجنس` | Gender | Text | ❌ | Optional gender |
| P | `الاهتمامات` | Interests | Text | ❌ | Optional interests |
| Q | `المصدر` | Source | Text | ❌ | Optional source |
| R | `ملاحظات` | Notes | Text | ❌ | Optional notes |

### **Step 4: Sample Data (Row 2)**

Add this sample admin user in **Row 2**:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `60a2a978-09e3-41ad-9aef-675399a17b3d` | `admin@talween.com` | `مدير النظام` | `$2a$10$s.z94Jx5INDPkfayxz72Xew0iBZfyU6BiZd0uJ6y/nwv5aUl0SanW` | `9999` | `active` | `TRUE` | `2024-01-01T00:00:00.000Z` | `2024-01-01T00:00:00.000Z` | `0` | | | | | | | | |

### **Step 5: Update Google Apps Script**

1. **Copy the updated script** from `GOOGLE_APPS_SCRIPT_PROFESSIONAL_EMAILS.js`
2. **Paste it into your Google Apps Script project**
3. **Update these values** in the script:
   ```javascript
   const API_KEY = '4808f174cdf9c9aa94cdd80d02d3b069fa04b49b';
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   const SHEET_NAME = 'Talween Studio Data';
   ```

### **Step 6: Test the Setup**

1. **Deploy the Google Apps Script** as a web app
2. **Test the health check**:
   ```
   GET https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=health&apiKey=4808f174cdf9c9aa94cdd80d02d3b069fa04b49b
   ```
3. **Test user creation**:
   ```
   POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   Content-Type: application/json
   
   {
     "action": "createUser",
     "apiKey": "4808f174cdf9c9aa94cdd80d02d3b069fa04b49b",
     "email": "test@example.com",
     "password": "hashed_password",
     "displayName": "Test User"
   }
   ```

## 🔧 **Important Notes**

1. **Column Order Matters**: The data array in the script must match the column order exactly
2. **Required Columns**: Columns A-J are required for the app to function
3. **Optional Columns**: Columns K-R are optional and can be left empty
4. **Data Types**: Make sure to use the correct data types (Text, Number, Boolean, Date)
5. **Arabic Headers**: The headers must be in Arabic as shown above

## ✅ **Verification Checklist**

- [ ] Google Sheet created with name "Talween Studio Data"
- [ ] All 18 column headers added to Row 1
- [ ] Sample admin user added to Row 2
- [ ] Google Apps Script updated with correct Spreadsheet ID
- [ ] Google Apps Script deployed as web app
- [ ] Health check endpoint working
- [ ] User creation endpoint working

## 🚨 **Common Issues**

1. **Column Mismatch**: If data appears in wrong columns, check the header order
2. **Missing Headers**: If script fails, ensure all required headers are present
3. **Data Type Errors**: Ensure numbers are numbers, dates are dates, etc.
4. **API Key**: Make sure the API key matches in both the script and your app

Once this is set up correctly, your Talween Studio app will be able to:
- ✅ Create users in Google Sheets
- ✅ Authenticate users from Google Sheets
- ✅ Update user credits and data
- ✅ Sync data between local database and Google Sheets
