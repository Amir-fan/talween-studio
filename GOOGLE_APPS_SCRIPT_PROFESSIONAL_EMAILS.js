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
      data.emailVerified || true,
      new Date().toISOString(),
      data.phone || '',
      data.country || '',
      data.city || '',
      data.age || '',
      data.gender || '',
      data.interests || '',
      data.source || 'website',
      data.notes || ''
    ];
    
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
    
    sheet.deleteRow(userRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
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
      case 'emailVerification':
        subject = 'تأكيد بريدك الإلكتروني - تلوين ستوديو';
        htmlBody = getVerificationEmailTemplate(templateData);
        break;
        
      case 'welcomeAfterVerification':
        subject = 'مرحباً بك في تلوين ستوديو! 🎨';
        htmlBody = getWelcomeEmailTemplate(templateData);
        break;
        
      case 'passwordReset':
        subject = 'إعادة تعيين كلمة المرور - تلوين ستوديو';
        htmlBody = getPasswordResetEmailTemplate(templateData);
        break;
        
      case 'welcome':
        subject = 'مرحباً بك في تلوين ستوديو!';
        htmlBody = getWelcomeEmailTemplate(templateData);
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

// Email Templates (same as before)
function getVerificationEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد البريد الإلكتروني</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">تلوين ستوديو</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">مرحباً بك في عالم الإبداع!</p>
        </div>
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #4ecdc4, #45b7d1); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">✉️</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">تأكيد بريدك الإلكتروني</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
              مرحباً ${data.name || 'عزيزي المستخدم'}،<br>
              شكراً لك على التسجيل في تلوين ستوديو! يرجى النقر على الزر أدناه لتأكيد بريدك الإلكتروني والبدء في رحلة الإبداع.
            </p>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #4ecdc4); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);">
              تأكيد البريد الإلكتروني
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getWelcomeEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>مرحباً بك في تلوين ستوديو</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #4ecdc4, #45b7d1); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">مرحباً بك! 🎉</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">تم تأكيد حسابك بنجاح</p>
        </div>
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #4ecdc4, #45b7d1); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🎨</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">مرحباً ${data.name || 'عزيزي المستخدم'}!</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
              تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن الاستمتاع بجميع ميزات تلوين ستوديو وبدء رحلة الإبداع مع طفلك.
            </p>
          </div>
          <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 25px; border-radius: 15px; margin: 30px 0; text-align: center;">
            <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 24px;">🎁 هديتك المجانية</h3>
            <p style="color: #2c3e50; margin: 0; font-size: 18px; font-weight: bold;">50 نقطة مجانية</p>
            <p style="color: #2c3e50; margin: 10px 0 0 0; font-size: 14px;">يمكنك استخدام هذه النقاط لإنشاء قصص وصور تلوين مخصصة!</p>
          </div>
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
      <title>إعادة تعيين كلمة المرور</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #ff6b6b, #ffa726); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">إعادة تعيين كلمة المرور</h1>
        </div>
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ff6b6b, #ffa726); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🔐</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">إعادة تعيين كلمة المرور</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
              مرحباً ${data.name || 'عزيزي المستخدم'}،<br>
              تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. انقر على الزر أدناه لإعادة تعيين كلمة المرور.
            </p>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.resetLink}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #ffa726); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
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
      <title>تأكيد الطلب</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #00b894, #00cec9); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">تم تأكيد طلبك! ✅</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">شكراً لك على طلبك!</h2>
          <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
            تم تأكيد طلبك بنجاح. يمكنك الآن الاستمتاع بجميع الميزات المدفوعة.
          </p>
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
      <title>تم الدفع بنجاح</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #00b894, #00cec9); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">تم الدفع بنجاح! 💳</h1>
        </div>
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #00b894, #00cec9); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">✅</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">تم الدفع بنجاح!</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
              شكراً لك! تم استلام دفعتك بنجاح وتم تفعيل حسابك.
            </p>
          </div>
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
      <title>تم إضافة النقاط</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #fdcb6e, #e17055); padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">تم إضافة النقاط! ⭐</h1>
        </div>
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #fdcb6e, #e17055); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">⭐</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 28px;">تم إضافة ${data.credits || '0'} نقطة!</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
              تم إضافة النقاط إلى حسابك بنجاح. يمكنك الآن الاستمتاع بإنشاء المزيد من المحتوى!
            </p>
          </div>
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
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Cairo', Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="padding: 40px 30px;">
          <h2 style="color: #2c3e50; margin: 0 0 20px 0;">مرحباً ${data.name || 'عزيزي المستخدم'}!</h2>
          <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin: 0;">
            ${data.message || 'شكراً لك على استخدام تلوين ستوديو!'}
          </p>
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
    emailType: 'emailVerification',
    templateData: {
      name: 'Test User',
      verificationLink: 'https://your-domain.com/verify-email?token=test123'
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