import { google } from 'googleapis';
import { userDb } from './simple-database';

// Google Sheets configuration
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Spreadsheet ID - you'll need to create this and share it with the service account
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

// Single sheet name
const SHEET_NAME = 'Sheet1';

// Initialize spreadsheet with headers
export async function initializeSpreadsheet() {
  try {
    // Add headers for the single sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:J1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'ID',
          'البريد الإلكتروني',
          'الاسم',
          'النقاط',
          'الحالة',
          'تم التحقق من البريد',
          'مستوى الاشتراك',
          'تاريخ الإنشاء',
          'آخر دخول',
          'إجمالي المدفوع'
        ]]
      }
    });

    console.log('Spreadsheet initialized successfully');
  } catch (error) {
    console.error('Error initializing spreadsheet:', error);
  }
}

// Add user to Google Sheets
export async function addUserToSheets(user: any) {
  try {
    const values = [[
      user.id,
      user.email,
      user.display_name,
      user.credits,
      user.status,
      user.email_verified ? 'نعم' : 'لا',
      user.subscription_tier,
      new Date(user.created_at * 1000).toLocaleDateString('ar-SA'),
      user.last_login ? new Date(user.last_login * 1000).toLocaleDateString('ar-SA') : 'لم يسجل دخول',
      user.total_spent
    ]];

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Google Sheets timeout')), 10000);
    });

    await Promise.race([
      sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:J`,
        valueInputOption: 'RAW',
        requestBody: { values }
      }),
      timeoutPromise
    ]);

    console.log('User added to Google Sheets:', user.email);
  } catch (error) {
    console.error('Error adding user to sheets:', error);
  }
}

// Add order to Google Sheets
export async function addOrderToSheets(order: any, userEmail: string) {
  try {
    const values = [[
      order.id,
      order.order_number,
      order.user_id,
      userEmail,
      order.status,
      order.total_amount,
      order.currency,
      order.payment_method || 'غير محدد',
      order.subscription_tier || 'غير محدد',
      new Date(order.created_at * 1000).toLocaleDateString('ar-SA')
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.ORDERS}!A:J`,
      valueInputOption: 'RAW',
      requestBody: { values }
    });

    console.log('Order added to Google Sheets:', order.order_number);
  } catch (error) {
    console.error('Error adding order to sheets:', error);
  }
}

// Add email log to Google Sheets
export async function addEmailLogToSheets(emailLog: any) {
  try {
    const values = [[
      emailLog.id,
      emailLog.email_type,
      emailLog.recipient_email,
      emailLog.subject,
      emailLog.status,
      emailLog.sent_at ? new Date(emailLog.sent_at * 1000).toLocaleDateString('ar-SA') : 'لم يرسل',
      emailLog.error_message || 'لا يوجد',
      new Date(emailLog.created_at * 1000).toLocaleDateString('ar-SA')
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.EMAIL_LOGS}!A:H`,
      valueInputOption: 'RAW',
      requestBody: { values }
    });

    console.log('Email log added to Google Sheets:', emailLog.id);
  } catch (error) {
    console.error('Error adding email log to sheets:', error);
  }
}

// Sync all users to Google Sheets
export async function syncAllUsersToSheets() {
  try {
    const users = userDb.getAllUsers();
    
    // Clear existing data (except headers)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:J1000`
    });

    // Add all users
    const values = users.map(user => [
      user.id,
      user.email,
      user.display_name,
      user.credits,
      user.status,
      user.email_verified ? 'نعم' : 'لا',
      user.subscription_tier,
      new Date(user.created_at * 1000).toLocaleDateString('ar-SA'),
      user.last_login ? new Date(user.last_login * 1000).toLocaleDateString('ar-SA') : 'لم يسجل دخول',
      user.total_spent
    ]);

    if (values.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:J${values.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: { values }
      });
    }

    console.log(`Synced ${users.length} users to Google Sheets`);
  } catch (error) {
    console.error('Error syncing users to sheets:', error);
  }
}

// Get user statistics
export async function getUserStats() {
  try {
    const users = userDb.getAllUsers();
    
    const stats = {
      totalUsers: users.length,
      verifiedUsers: users.filter(u => u.email_verified).length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalCredits: users.reduce((sum, u) => sum + u.credits, 0),
      totalSpent: users.reduce((sum, u) => sum + u.total_spent, 0),
      subscriptionTiers: {
        FREE: users.filter(u => u.subscription_tier === 'FREE').length,
        EXPLORER: users.filter(u => u.subscription_tier === 'EXPLORER').length,
        CREATIVE_WORLD: users.filter(u => u.subscription_tier === 'CREATIVE_WORLD').length,
        CREATIVE_TEACHER: users.filter(u => u.subscription_tier === 'CREATIVE_TEACHER').length,
      }
    };

    return stats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
}
