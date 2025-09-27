// Talween Studio - Google Apps Script
// Combined Email Service + Google Sheets Database API
// Copy this entire code into your Google Apps Script project

// Configuration - Set these values in your Apps Script
const API_KEY = '4808f174cdf9c9aa94cdd80d02d3b069fa04b49b'; // Set this in your Apps Script
const SPREADSHEET_ID = '1e8H6MdRGF0QJNpNL0NvUwJtWv89Wqk6hQsZIocpb-mI'; // Set this in your Apps Script
const SHEET_NAME = 'Talween Studio Data';

// Main entry point for GET requests (Database API)
function doGet(e) {
  try {
    // Check API key for database operations
    const apiKey = e.parameter.apiKey || e.parameter.key;
    if (!apiKey || apiKey !== API_KEY) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'Invalid or missing API key' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const action = e.parameter.action || 'health';
    
    switch (action) {
      case 'health':
        return handleHealthCheck();
      case 'getUsers':
        return handleGetUsers();
      case 'getUser':
        return handleGetUser(e.parameter.userId);
      case 'syncCredits':
        return handleSyncCredits(e.parameter.userId);
      case 'clearAllData':
        return handleClearAllData();
      default:
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: false, 
            error: 'Invalid action' 
          }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('doGet error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Main entry point for POST requests (Email + Database API)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Check if this is a database operation
    if (data.action && data.apiKey) {
      if (data.apiKey !== API_KEY) {
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: false, 
            error: 'Invalid API key' 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      return handleDatabaseAction(data);
    }
    
    // Otherwise, handle as email request
    return handleEmailRequest(data);
    
  } catch (error) {
    console.error('doPost error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Database Actions Handler
function handleDatabaseAction(data) {
  const { action } = data;
  
  switch (action) {
    case 'createUser':
      return handleCreateUser(data);
    case 'updateUser':
      return handleUpdateUser(data);
    case 'deleteUser':
      return handleDeleteUser(data.userId);
    case 'addCredits':
      return handleAddCredits(data.userId, data.amount);
    case 'deductCredits':
      return handleDeductCredits(data.userId, data.amount);
    case 'updateCredits':
      return handleUpdateCredits(data.userId, data.credits);
    case 'getUsers':
      return handleGetUsers();
    case 'getUser':
      return handleGetUser(data.userId);
    case 'syncCredits':
      return handleSyncCredits(data.userId);
    case 'clearAllData':
      return handleClearAllData();
    default:
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'Invalid database action' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

// Health Check
function handleHealthCheck() {
  try {
    const sheet = getSheet();
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Google Sheets API is working',
        spreadsheetId: SPREADSHEET_ID,
        sheetName: SHEET_NAME,
        totalUsers: sheet.getLastRow() - 1
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Health check failed: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Clear All Data
function handleClearAllData() {
  try {
    console.log('Clearing all data from Google Sheets...');
    
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow > 1) {
      // Clear all data except headers (row 1)
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      console.log(`Cleared ${lastRow - 1} rows of data`);
    } else {
      console.log('No data to clear');
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'All data cleared successfully',
        clearedRows: lastRow - 1
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('Error clearing all data:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to clear data: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Get All Users
function handleGetUsers() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const users = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const user = {};
      headers.forEach((header, index) => {
        user[header] = row[index];
      });
      users.push(user);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        users: users,
        total: users.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to get users: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Get Single User
function handleGetUser(userId) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idColumnIndex = headers.indexOf('المعرف');
    
    if (idColumnIndex === -1) {
      throw new Error('المعرف column not found');
    }
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[idColumnIndex] === userId) {
        const user = {};
        headers.forEach((header, index) => {
          user[header] = row[index];
        });
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: true, 
            user: user
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'User not found' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to get user: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Create User
function handleCreateUser(data) {
  try {
    const sheet = getSheet();
    
    // Debug logging
    console.log('🔍 GOOGLE APPS SCRIPT - handleCreateUser called');
    console.log('  - data:', JSON.stringify(data, null, 2));
    console.log('  - data.password:', data.password);
    console.log('  - data.password type:', typeof data.password);
    console.log('  - data.password length:', data.password ? data.password.length : 'undefined');
    
    // Check if user already exists
    const existingUser = findUserByEmail(sheet, data.email);
    if (existingUser) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'User already exists with this email' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Prepare user data
    const userData = [
      data.id || generateId(),
      data.email || '',
      data.displayName || '',
      data.password || '',
      data.credits || 50,
      data.status || 'active',
      data.subscriptionTier || 'FREE',
      new Date().toISOString(),
      new Date().toISOString(), // last login
      0 // total spent
    ];
    
    console.log('  - userData array:', JSON.stringify(userData, null, 2));
    console.log('  - password in userData[3]:', userData[3]);
    
    sheet.appendRow(userData);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'User created successfully',
        userId: userData[0]
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to create user: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Update User
function handleUpdateUser(data) {
  try {
    const sheet = getSheet();
    const userRow = findUserRow(sheet, data.userId);
    
    if (!userRow) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Update specific fields
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    Object.keys(data).forEach(key => {
      const columnIndex = headers.indexOf(key);
      if (columnIndex !== -1 && key !== 'userId') {
        sheet.getRange(userRow, columnIndex + 1).setValue(data[key]);
      }
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'User updated successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to update user: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Delete User
function handleDeleteUser(userId) {
  try {
    console.log('GOOGLE APPS SCRIPT - Deleting user:', userId);
    
    const sheet = getSheet();
    const userRow = findUserRow(sheet, userId);
    
    if (!userRow) {
      console.log('❌ User not found in Google Sheets');
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get user data before deletion for logging
    const userData = sheet.getRange(userRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    const userEmail = userData[1]; // البريد الإلكتروني column
    const userName = userData[2]; // الاسم column
    
    console.log('📋 User data to delete:', {
      userId: userId,
      email: userEmail,
      name: userName,
      row: userRow
    });
    
    // Delete the user row
    sheet.deleteRow(userRow);
    
    console.log('✅ User deleted successfully from Google Sheets');
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully',
        deletedUser: {
          id: userId,
          email: userEmail,
          name: userName
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to delete user: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Add Credits
function handleAddCredits(userId, amount) {
  try {
    const sheet = getSheet();
    const userRow = findUserRow(sheet, userId);
    
    if (!userRow) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const creditsColumnIndex = getColumnIndex(sheet, 'النقاط');
    const currentCredits = sheet.getRange(userRow, creditsColumnIndex).getValue();
    const newCredits = currentCredits + parseInt(amount);
    
    sheet.getRange(userRow, creditsColumnIndex).setValue(newCredits);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Credits added successfully',
        newCredits: newCredits
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to add credits: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Deduct Credits
function handleDeductCredits(userId, amount) {
  try {
    const sheet = getSheet();
    const userRow = findUserRow(sheet, userId);
    
    if (!userRow) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const creditsColumnIndex = getColumnIndex(sheet, 'النقاط');
    const currentCredits = sheet.getRange(userRow, creditsColumnIndex).getValue();
    const deductAmount = parseInt(amount);
    
    if (currentCredits < deductAmount) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'Insufficient credits' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const newCredits = currentCredits - deductAmount;
    sheet.getRange(userRow, creditsColumnIndex).setValue(newCredits);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Credits deducted successfully',
        newCredits: newCredits
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to deduct credits: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Update Credits (set specific amount)
function handleUpdateCredits(userId, credits) {
  try {
    const sheet = getSheet();
    const userRow = findUserRow(sheet, userId);
    
    if (!userRow) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const creditsColumnIndex = getColumnIndex(sheet, 'النقاط');
    sheet.getRange(userRow, creditsColumnIndex).setValue(parseInt(credits));
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Credits updated successfully',
        newCredits: credits
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to update credits: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Sync Credits
function handleSyncCredits(userId) {
  try {
    const sheet = getSheet();
    const userRow = findUserRow(sheet, userId);
    
    if (!userRow) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const userData = data[userRow - 1];
    const user = {};
    
    headers.forEach((header, index) => {
      user[header] = userData[index];
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        user: user
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to sync credits: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Email Request Handler
function handleEmailRequest(data) {
  try {
    const { recipientEmail, emailType, templateData, userId } = data;
    
    if (!recipientEmail || !emailType) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    let subject = '';
    let htmlBody = '';
    
    switch (emailType) {
      case 'welcome':
        subject = 'مرحباً بك في تلوين ستوديو!';
        htmlBody = getWelcomeEmailTemplate(templateData);
        break;
        
      case 'passwordReset':
        subject = 'إعادة تعيين كلمة المرور - تلوين ستوديو';
        htmlBody = getPasswordResetEmailTemplate(templateData);
        break;
        
      case 'orderConfirmation':
        subject = 'تأكيد الطلب - تلوين ستوديو';
        htmlBody = getOrderConfirmationTemplate(templateData);
        break;
        
      case 'paymentSuccess':
        subject = 'تم الدفع بنجاح - تلوين ستوديو';
        htmlBody = getPaymentSuccessTemplate(templateData);
        break;
        
      case 'creditsAdded':
        subject = 'تم إضافة النقاط إلى حسابك - تلوين ستوديو';
        htmlBody = getCreditsAddedTemplate(templateData);
        break;
        
      default:
        subject = 'رسالة من تلوين ستوديو';
        htmlBody = getDefaultEmailTemplate(templateData);
    }
    
    GmailApp.sendEmail(
      recipientEmail,
      subject,
      '',
      {
        htmlBody: htmlBody,
        name: 'تلوين ستوديو'
      }
    );
    
    console.log(`Email sent successfully to ${recipientEmail} for ${emailType}`);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        recipientEmail,
        emailType 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error sending email:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper Functions
function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Create sheet with Arabic headers if it doesn't exist
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    const headers = [
      'المعرف',
      'البريد الإلكتروني',
      'الاسم',
      'كلمة المرور',
      'النقاط',
      'الحالة',
      'البريد الإلكتروني مؤكد',
      'تاريخ الإنشاء',
      'رقم الهاتف',
      'البلد',
      'المدينة',
      'العمر',
      'الجنس',
      'الاهتمامات',
      'المصدر',
      'ملاحظات'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  return sheet;
}

function findUserByEmail(sheet, email) {
  const data = sheet.getDataRange().getValues();
  const emailColumnIndex = data[0].indexOf('البريد الإلكتروني');
  
  if (emailColumnIndex === -1) return null;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailColumnIndex] === email) {
      return data[i];
    }
  }
  return null;
}

function findUserRow(sheet, userId) {
  const data = sheet.getDataRange().getValues();
  const idColumnIndex = data[0].indexOf('المعرف');
  
  if (idColumnIndex === -1) return null;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumnIndex] === userId) {
      return i + 1; // Return 1-based row number
    }
  }
  return null;
}

function getColumnIndex(sheet, columnName) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const index = headers.indexOf(columnName);
  return index === -1 ? 0 : index + 1; // Return 1-based column number
}

function generateId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Professional Email Templates

function getWelcomeEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>مرحباً بك في تلوين ستوديو</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
        body { margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .tagline { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400; }
        .content { padding: 40px 30px; }
        .icon-container { width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
        .icon { font-size: 36px; color: white; font-weight: bold; }
        .title { color: #1a202c; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center; }
        .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; text-align: center; }
        .gift-box { background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; border: 2px solid #f59e0b; }
        .gift-title { color: #92400e; margin: 0 0 8px 0; font-size: 20px; font-weight: 600; }
        .gift-amount { color: #92400e; margin: 0 0 8px 0; font-size: 24px; font-weight: 700; }
        .gift-description { color: #92400e; margin: 0; font-size: 14px; }
        .features { margin: 32px 0; }
        .feature-item { display: flex; align-items: center; margin: 16px 0; padding: 12px; background-color: #f7fafc; border-radius: 8px; }
        .feature-icon { font-size: 20px; margin-left: 12px; }
        .feature-text { color: #4a5568; font-size: 15px; margin: 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
        .cta-container { text-align: center; margin: 32px 0; }
        .footer { background-color: #f7fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-text { color: #718096; font-size: 14px; margin: 0; }
        @media (max-width: 600px) {
          .container { margin: 0; border-radius: 0; }
          .content { padding: 30px 20px; }
          .header { padding: 30px 20px; }
          .logo { font-size: 24px; }
          .title { font-size: 20px; }
          .message { font-size: 15px; }
          .gift-box { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">مرحباً بك!</h1>
          <p class="tagline">تم تأكيد حسابك بنجاح</p>
        </div>
        
        <div class="content">
          <div class="icon-container">
            <span class="icon">T</span>
            </div>
          
          <h2 class="title">مرحباً ${data.name || 'عزيزي المستخدم'}!</h2>
          
          <p class="message">
            تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن الاستمتاع بجميع ميزات تلوين ستوديو وبدء رحلة الإبداع السحرية مع طفلك.
          </p>
          
          <div class="gift-box">
            <h3 class="gift-title">هديتك المجانية</h3>
            <p class="gift-amount">50 نقطة مجانية</p>
            <p class="gift-description">يمكنك استخدام هذه النقاط لإنشاء قصص وصور تلوين مخصصة!</p>
          </div>
          
          <div class="features">
            <div class="feature-item">
              <span class="feature-icon" style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">1</span>
              <p class="feature-text">إنشاء قصص مخصصة بأسماء الأطفال</p>
          </div>
            <div class="feature-item">
              <span class="feature-icon" style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">2</span>
              <p class="feature-text">تحويل النصوص إلى صفحات تلوين</p>
        </div>
            <div class="feature-item">
              <span class="feature-icon" style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">3</span>
              <p class="feature-text">تحويل الصور إلى صفحات تلوين</p>
      </div>
            <div class="feature-item">
              <span class="feature-icon" style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">4</span>
              <p class="feature-text">حفظ المحتوى في مكتبتك الشخصية</p>
        </div>
            </div>
          
          <div class="cta-container">
            <a href="${data.appUrl || 'https://italween.com'}" class="cta-button">
              ابدأ الإبداع الآن
            </a>
          </div>
          </div>
        
        <div class="footer">
          <p class="footer-text">© 2024 تلوين ستوديو. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getPasswordResetEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>إعادة تعيين كلمة المرور - تلوين ستوديو</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
        body { margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .tagline { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400; }
        .content { padding: 40px 30px; }
        .icon-container { width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
        .icon { font-size: 36px; }
        .title { color: #1a202c; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center; }
        .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; text-align: center; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); }
        .cta-container { text-align: center; margin: 32px 0; }
        .footer { background-color: #f7fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-text { color: #718096; font-size: 14px; margin: 0; }
        .security-note { background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center; }
        .security-text { color: #991b1b; font-size: 14px; margin: 0; }
        .steps { margin: 32px 0; }
        .step-item { display: flex; align-items: flex-start; margin: 16px 0; padding: 16px; background-color: #f7fafc; border-radius: 8px; }
        .step-number { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; margin-left: 12px; flex-shrink: 0; }
        .step-text { color: #4a5568; font-size: 15px; margin: 0; }
        @media (max-width: 600px) {
          .container { margin: 0; border-radius: 0; }
          .content { padding: 30px 20px; }
          .header { padding: 30px 20px; }
          .logo { font-size: 24px; }
          .title { font-size: 20px; }
          .message { font-size: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">إعادة تعيين كلمة المرور</h1>
          <p class="tagline">تأمين حسابك</p>
        </div>
        
        <div class="content">
          <div class="icon-container">
            <span class="icon" style="font-size: 24px; font-weight: bold; color: white;">&nbsp;&nbsp;&nbsp;</span>
            </div>
          
          <h2 class="title">إعادة تعيين كلمة المرور</h2>
          
          <p class="message">
            مرحباً <strong>${data.name || 'عزيزي المستخدم'}</strong>،<br><br>
            تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في تلوين ستوديو.<br><br>
            انقر على الزر أدناه لإعادة تعيين كلمة المرور الخاصة بك.
          </p>
          
          <div class="cta-container">
            <a href="${data.resetLink}" class="cta-button">
              إعادة تعيين كلمة المرور             </a>
          </div>
          
          <div class="steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <p class="step-text">انقر على الرابط أعلاه</p>
          </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <p class="step-text">أدخل كلمة مرور جديدة قوية</p>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <p class="step-text">تأكيد كلمة المرور الجديدة</p>
            </div>
          </div>
          
          <div class="security-note">
            <p class="security-text">
              <strong>ملاحظة أمنية:</strong> إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان. رابط إعادة التعيين صالح لمدة 24 ساعة فقط.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">© 2024 تلوين ستوديو. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getOrderConfirmationTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد الطلب - تلوين ستوديو</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
        body { margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .tagline { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400; }
        .content { padding: 40px 30px; }
        .icon-container { width: 80px; height: 80px; background: linear-gradient(135deg, #059669, #047857); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
        .icon { font-size: 36px; }
        .title { color: #1a202c; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center; }
        .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; text-align: center; }
        .order-details { background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .order-title { color: #166534; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; text-align: center; }
        .order-info { display: flex; justify-content: space-between; margin: 8px 0; }
        .order-label { color: #166534; font-weight: 600; }
        .order-value { color: #166534; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #059669, #047857); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4); }
        .cta-container { text-align: center; margin: 32px 0; }
        .footer { background-color: #f7fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-text { color: #718096; font-size: 14px; margin: 0; }
        @media (max-width: 600px) {
          .container { margin: 0; border-radius: 0; }
          .content { padding: 30px 20px; }
          .header { padding: 30px 20px; }
          .logo { font-size: 24px; }
          .title { font-size: 20px; }
          .message { font-size: 15px; }
          .order-info { flex-direction: column; gap: 4px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">تم تأكيد طلبك!</h1>
          <p class="tagline">شكراً لك على ثقتك</p>
        </div>
        
        <div class="content">
          <div class="icon-container">
            <span class="icon" style="font-size: 24px; font-weight: bold; color: white;">&nbsp;&nbsp;&nbsp;</span>
          </div>
          
          <h2 class="title">شكراً لك على طلبك!</h2>
          
          <p class="message">
            مرحباً <strong>${data.name || 'عزيزي العميل'}</strong>،<br><br>
            تم تأكيد طلبك بنجاح! يمكنك الآن الاستمتاع بجميع الميزات المدفوعة في تلوين ستوديو.
          </p>
          
          <div class="order-details">
            <h3 class="order-title">تفاصيل الطلب</h3>
            <div class="order-info">
              <span class="order-label">رقم الطلب:</span>
              <span class="order-value">#${data.orderNumber || 'غير محدد'}</span>
            </div>
            <div class="order-info">
              <span class="order-label">المبلغ الإجمالي:</span>
              <span class="order-value">$${data.totalAmount || '0'}</span>
            </div>
            <div class="order-info">
              <span class="order-label">الحالة:</span>
              <span class="order-value">تم التأكيد</span>
            </div>
            <div class="order-info">
              <span class="order-label">تاريخ الطلب:</span>
              <span class="order-value">${new Date().toLocaleDateString('ar-SA')}</span>
            </div>
          </div>
          
          <div class="cta-container">
            <a href="${data.appUrl || 'https://italween.com'}" class="cta-button">
              ابدأ الإبداع الآن
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">© 2024 تلوين ستوديو. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getPaymentSuccessTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تم الدفع بنجاح - تلوين ستوديو</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
        body { margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .tagline { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400; }
        .content { padding: 40px 30px; }
        .icon-container { width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
        .icon { font-size: 36px; }
        .title { color: #1a202c; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center; }
        .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; text-align: center; }
        .success-box { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #22c55e; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
        .success-title { color: #166534; margin: 0 0 16px 0; font-size: 20px; font-weight: 600; }
        .success-message { color: #166534; margin: 0; font-size: 16px; }
        .payment-details { background-color: #f7fafc; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .payment-title { color: #1a202c; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; text-align: center; }
        .payment-info { display: flex; justify-content: space-between; margin: 8px 0; }
        .payment-label { color: #4a5568; font-weight: 600; }
        .payment-value { color: #1a202c; font-weight: 600; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
        .cta-container { text-align: center; margin: 32px 0; }
        .footer { background-color: #f7fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-text { color: #718096; font-size: 14px; margin: 0; }
        @media (max-width: 600px) {
          .container { margin: 0; border-radius: 0; }
          .content { padding: 30px 20px; }
          .header { padding: 30px 20px; }
          .logo { font-size: 24px; }
          .title { font-size: 20px; }
          .message { font-size: 15px; }
          .payment-info { flex-direction: column; gap: 4px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">تم الدفع بنجاح!</h1>
          <p class="tagline">شكراً لك على ثقتك</p>
        </div>
        
        <div class="content">
          <div class="icon-container">
            <span class="icon" style="font-size: 24px; font-weight: bold; color: white;">&nbsp;&nbsp;&nbsp;</span>
            </div>
          
          <h2 class="title">تم الدفع بنجاح!</h2>
          
          <p class="message">
            مرحباً <strong>${data.name || 'عزيزي العميل'}</strong>،<br><br>
            شكراً لك! تم استلام دفعتك بنجاح وتم تفعيل حسابك في تلوين ستوديو.
          </p>
          
          <div class="success-box">
            <h3 class="success-title">تم تفعيل حسابك!</h3>
            <p class="success-message">يمكنك الآن الاستمتاع بجميع الميزات المدفوعة</p>
          </div>
          
          <div class="payment-details">
            <h3 class="payment-title">تفاصيل الدفع</h3>
            <div class="payment-info">
              <span class="payment-label">رقم الطلب:</span>
              <span class="payment-value">#${data.orderNumber || 'غير محدد'}</span>
            </div>
            <div class="payment-info">
              <span class="payment-label">المبلغ المدفوع:</span>
              <span class="payment-value">$${data.totalAmount || '0'}</span>
            </div>
            <div class="payment-info">
              <span class="payment-label">تاريخ الدفع:</span>
              <span class="payment-value">${new Date().toLocaleDateString('ar-SA')}</span>
            </div>
            <div class="payment-info">
              <span class="payment-label">حالة الدفع:</span>
              <span class="payment-value">مكتمل</span>
            </div>
          </div>
          
          <div class="cta-container">
            <a href="${data.appUrl || 'https://italween.com'}" class="cta-button">
              ابدأ الإبداع الآن             </a>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">© 2024 تلوين ستوديو. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getCreditsAddedTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تم إضافة النقاط - تلوين ستوديو</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
        body { margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .tagline { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400; }
        .content { padding: 40px 30px; }
        .icon-container { width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
        .icon { font-size: 36px; }
        .title { color: #1a202c; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center; }
        .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; text-align: center; }
        .credits-box { background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
        .credits-title { color: #92400e; margin: 0 0 16px 0; font-size: 20px; font-weight: 600; }
        .credits-amount { color: #92400e; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; }
        .credits-description { color: #92400e; margin: 0; font-size: 16px; }
        .features { margin: 32px 0; }
        .feature-item { display: flex; align-items: center; margin: 16px 0; padding: 12px; background-color: #f7fafc; border-radius: 8px; }
        .feature-icon { font-size: 20px; margin-left: 12px; }
        .feature-text { color: #4a5568; font-size: 15px; margin: 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); }
        .cta-container { text-align: center; margin: 32px 0; }
        .footer { background-color: #f7fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-text { color: #718096; font-size: 14px; margin: 0; }
        @media (max-width: 600px) {
          .container { margin: 0; border-radius: 0; }
          .content { padding: 30px 20px; }
          .header { padding: 30px 20px; }
          .logo { font-size: 24px; }
          .title { font-size: 20px; }
          .message { font-size: 15px; }
          .credits-box { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">تم إضافة النقاط!</h1>
          <p class="tagline">استمتع بالمزيد من الإبداع</p>
        </div>
        
        <div class="content">
          <div class="icon-container">
            <span class="icon" style="font-size: 24px; font-weight: bold; color: white;">&nbsp;&nbsp;&nbsp;</span>
            </div>
          
          <h2 class="title">تم إضافة النقاط إلى حسابك!</h2>
          
          <p class="message">
            مرحباً <strong>${data.name || 'عزيزي المستخدم'}</strong>،<br><br>
            تم إضافة النقاط إلى حسابك بنجاح! يمكنك الآن الاستمتاع بإنشاء المزيد من المحتوى الإبداعي.
          </p>
          
          <div class="credits-box">
            <h3 class="credits-title">النقاط المضافة</h3>
            <p class="credits-amount">+${data.credits || '0'} نقطة</p>
            <p class="credits-description">يمكنك استخدام هذه النقاط لإنشاء قصص وصور تلوين مخصصة!</p>
          </div>
          
          <div class="features">
            <div class="feature-item">
              <span class="feature-icon" style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">1</span>
              <p class="feature-text">إنشاء قصص مخصصة بأسماء الأطفال</p>
            </div>
            <div class="feature-item">
              <span class="feature-icon" style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">2</span>
              <p class="feature-text">تحويل النصوص إلى صفحات تلوين</p>
            </div>
            <div class="feature-item">
              <span class="feature-icon" style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">3</span>
              <p class="feature-text">تحويل الصور إلى صفحات تلوين</p>
            </div>
            <div class="feature-item">
              <span class="feature-icon" style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">4</span>
              <p class="feature-text">حفظ المحتوى في مكتبتك الشخصية</p>
            </div>
          </div>
          
          <div class="cta-container">
            <a href="${data.appUrl || 'https://italween.com'}" class="cta-button">
              ابدأ الإبداع الآن
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">© 2024 تلوين ستوديو. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getDefaultEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>رسالة من تلوين ستوديو</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
        body { margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .tagline { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400; }
        .content { padding: 40px 30px; }
        .icon-container { width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
        .icon { font-size: 36px; }
        .title { color: #1a202c; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center; }
        .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; text-align: center; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
        .cta-container { text-align: center; margin: 32px 0; }
        .footer { background-color: #f7fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-text { color: #718096; font-size: 14px; margin: 0; }
        @media (max-width: 600px) {
          .container { margin: 0; border-radius: 0; }
          .content { padding: 30px 20px; }
          .header { padding: 30px 20px; }
          .logo { font-size: 24px; }
          .title { font-size: 20px; }
          .message { font-size: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">تلوين ستوديو</h1>
          <p class="tagline">عالم الإبداع والقصص السحرية</p>
        </div>
        
        <div class="content">
          <div class="icon-container">
            <span class="icon" style="font-size: 24px; font-weight: bold; color: white;">&nbsp;&nbsp;&nbsp;</span>
          </div>
          
          <h2 class="title">رسالة من تلوين ستوديو</h2>
          
          <p class="message">
            مرحباً <strong>${data.name || 'عزيزي المستخدم'}</strong>،<br><br>
            ${data.message || 'نشكرك على استخدام تلوين ستوديو. نتمنى لك تجربة إبداعية ممتعة!'}
          </p>
          
          <div class="cta-container">
            <a href="${data.appUrl || 'https://italween.com'}" class="cta-button">
              زر موقعنا
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">© 2024 تلوين ستوديو. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Test function
function testEmail() {
  const testData = {
    recipientEmail: 'your-email@gmail.com',
    emailType: 'welcome',
    templateData: {
      name: 'Test User'
    },
    userId: 'test123'
  };
  
  const result = doPost({
    postData: {
      contents: JSON.stringify(testData)
    }
  });
  
  console.log(result.getContent());
}

// Test database function
function testDatabase() {
  const testData = {
    action: 'createUser',
    apiKey: API_KEY,
    email: 'test@example.com',
    displayName: 'Test User',
    credits: 50
  };
  
  const result = doPost({
    postData: {
      contents: JSON.stringify(testData)
    }
  });
  
  console.log(result.getContent());
}