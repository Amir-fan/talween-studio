import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { googleSheetsUserDb } from './google-sheets-api';

const dbPath = path.join(process.cwd(), 'database.json');
const backupPath = path.join(process.cwd(), 'database-backup.json');
const emergencyPath = path.join(process.cwd(), 'database-emergency.json');

interface User {
  id: string;
  email: string;
  password: string;
  display_name: string;
  credits: number;
  status: string;
  email_verified: boolean;
  verification_token?: string;
  reset_token?: string;
  reset_token_expires?: number;
  subscription_tier: string;
  subscription_expires?: number;
  created_at: number;
  updated_at: number;
  last_login?: number;
  total_spent: number;
  country?: string;
  phone?: string;
}

interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  payment_method?: string;
  payment_intent_id?: string;
  subscription_tier?: string;
  credits_purchased?: number;
  created_at: number;
  updated_at: number;
}

interface EmailLog {
  id: string;
  user_id?: string;
  email_type: string;
  recipient_email: string;
  subject: string;
  status: string;
  sent_at?: number;
  error_message?: string;
  created_at: number;
}

interface UserContent {
  id: string;
  user_id: string;
  title: string;
  type: 'story' | 'coloring' | 'image';
  content: any; // JSON content
  thumbnail_url?: string;
  status: 'draft' | 'published' | 'favorite';
  created_at: number;
  updated_at: number;
}

interface Database {
  users: { [key: string]: User };
  orders: { [key: string]: Order };
  emailLogs: { [key: string]: EmailLog };
  userContent: { [key: string]: UserContent };
  adminUsers: { [key: string]: any };
}

let db: Database = {
  users: {},
  orders: {},
  emailLogs: {},
  userContent: {},
  adminUsers: {}
};

// Load database from file
function loadDatabase() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      const loadedDb = JSON.parse(data);
      // Ensure all required properties exist and are objects (not arrays)
      db = {
        users: (loadedDb.users && typeof loadedDb.users === 'object' && !Array.isArray(loadedDb.users)) ? loadedDb.users : {},
        orders: (loadedDb.orders && typeof loadedDb.orders === 'object' && !Array.isArray(loadedDb.orders)) ? loadedDb.orders : {},
        emailLogs: (loadedDb.emailLogs && typeof loadedDb.emailLogs === 'object' && !Array.isArray(loadedDb.emailLogs)) ? loadedDb.emailLogs : {},
        userContent: (loadedDb.userContent && typeof loadedDb.userContent === 'object' && !Array.isArray(loadedDb.userContent)) ? loadedDb.userContent : {},
        adminUsers: (loadedDb.adminUsers && typeof loadedDb.adminUsers === 'object' && !Array.isArray(loadedDb.adminUsers)) ? loadedDb.adminUsers : {}
      };
    }
  } catch (error) {
    console.error('Error loading database:', error);
    // Reset to default structure if loading fails
    db = {
      users: {},
      orders: {},
      emailLogs: {},
      userContent: {},
      adminUsers: {}
    };
  }
}

// Simplified and reliable save function
function saveDatabase() {
  try {
    console.log('🔍 SAVING DATABASE:');
    console.log('  - dbPath:', dbPath);
    console.log('  - users count:', Object.keys(db.users).length);
    
    const dataString = JSON.stringify(db, null, 2);
    
    // Write to main database file
    fs.writeFileSync(dbPath, dataString, 'utf8');
    console.log('✅ Database saved successfully');
    
    // Optional: Create backup (non-critical)
    try {
      fs.writeFileSync(backupPath, dataString, 'utf8');
      console.log('✅ Backup created');
    } catch (backupError) {
      console.log('⚠️ Backup creation failed (non-critical):', backupError.message);
    }
    
  } catch (error) {
    console.error('❌ Database save error:', error);
    throw new Error(`Database save failed: ${error.message}`);
  }
}

// Database integrity validation - checks saved file, not in-memory data
function validateDatabaseIntegrity(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Read the saved database file to validate what was actually written
    if (!fs.existsSync(dbPath)) {
      errors.push('Database file does not exist');
      return { valid: false, errors };
    }
    
    const savedData = fs.readFileSync(dbPath, 'utf8');
    const savedDb = JSON.parse(savedData);
    
    // Check if all required properties exist and are objects
    if (!savedDb.users || typeof savedDb.users !== 'object' || Array.isArray(savedDb.users)) {
      errors.push('Users property is invalid in saved file');
    }
    
    if (!savedDb.orders || typeof savedDb.orders !== 'object' || Array.isArray(savedDb.orders)) {
      errors.push('Orders property is invalid in saved file');
    }
    
    if (!savedDb.emailLogs || typeof savedDb.emailLogs !== 'object' || Array.isArray(savedDb.emailLogs)) {
      errors.push('EmailLogs property is invalid in saved file');
    }
    
    if (!savedDb.userContent || typeof savedDb.userContent !== 'object' || Array.isArray(savedDb.userContent)) {
      errors.push('UserContent property is invalid in saved file');
    }
    
    if (!savedDb.adminUsers || typeof savedDb.adminUsers !== 'object' || Array.isArray(savedDb.adminUsers)) {
      errors.push('AdminUsers property is invalid in saved file');
    }
    
    // Validate user data structure
    Object.values(savedDb.users).forEach((user: any, index) => {
      if (!user.id || !user.email || !user.password) {
        errors.push(`User ${index} missing required fields (id, email, or password) in saved file`);
      }
    });
    
  } catch (error) {
    errors.push(`Database validation error: ${error}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Emergency restore from backup
function restoreFromBackup() {
  console.log('🚨 Attempting emergency database restoration...');
  
  try {
    // Try to restore from backup
    if (fs.existsSync(backupPath)) {
      const backupData = fs.readFileSync(backupPath, 'utf8');
      const backupDb = JSON.parse(backupData);
      
      // Validate backup data
      const validationResult = validateDatabaseIntegrity();
      if (validationResult.valid) {
        db = backupDb;
        fs.writeFileSync(dbPath, backupData, 'utf8');
        console.log('✅ Database restored from backup');
        return;
      }
    }
    
    // Try emergency backup
    if (fs.existsSync(emergencyPath)) {
      const emergencyData = fs.readFileSync(emergencyPath, 'utf8');
      const emergencyDb = JSON.parse(emergencyData);
      
      db = emergencyDb;
      fs.writeFileSync(dbPath, emergencyData, 'utf8');
      console.log('✅ Database restored from emergency backup');
      return;
    }
    
    console.error('❌ All backup restoration attempts failed');
    
  } catch (error) {
    console.error('❌ Emergency restoration failed:', error);
  }
}

// Initialize database
function initializeDatabase() {
  loadDatabase();
  
  // Create default admin user if not exists
  const adminExists = db.adminUsers ? Object.values(db.adminUsers).find(user => user.email === 'admin@talween.com') : null;
  if (!adminExists) {
    const adminId = uuidv4();
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.adminUsers[adminId] = {
      id: adminId,
      email: 'admin@talween.com',
      password: adminPassword,
      role: 'admin',
      created_at: Math.floor(Date.now() / 1000)
    };
    saveDatabase();
  }
}

// User management functions
export const userDb = {
  create: (email: string, password: string, displayName: string) => {
    console.log('🔍 BULLETPROOF USER CREATE - Attempting to create user:');
    console.log('  - email:', email);
    console.log('  - displayName:', displayName);
    
    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 12); // Higher security
    const verificationToken = uuidv4();
    
    // Check if user already exists
    const existingUser = Object.values(db.users).find(user => user.email === email);
    console.log('  - existingUser found:', !!existingUser);
    if (existingUser) {
      console.log('  - existingUser email:', existingUser.email);
      console.log('❌ User already exists');
      return { success: false, error: 'Email already exists' };
    }
    
    const newUser: User = {
      id,
      email,
      password: hashedPassword,
      display_name: displayName,
      credits: 50,
      status: 'active', // Auto-verify users immediately
      email_verified: true, // Auto-verify users immediately
      verification_token: verificationToken,
      subscription_tier: 'FREE',
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      total_spent: 0
    };
    
    // Add user to database
    db.users[id] = newUser;
    console.log('✅ User added to database:');
    console.log('  - User ID:', id);
    console.log('  - Email:', email);
    console.log('  - Total users now:', Object.keys(db.users).length);
    
    // SIMPLIFIED SAVE: Direct save with basic validation
    try {
      saveDatabase();
      console.log('✅ Database saved successfully');
      
      // Simple verification - check if file exists and has content
      if (fs.existsSync(dbPath)) {
        const savedData = fs.readFileSync(dbPath, 'utf8');
        const savedDb = JSON.parse(savedData);
        if (savedDb.users && savedDb.users[id]) {
          console.log('✅ User save verified - user exists in saved file');
        } else {
          console.log('❌ User not found in saved file');
          return { success: false, error: 'Failed to save user data - please try again' };
        }
      } else {
        console.log('❌ Database file not found after save');
        return { success: false, error: 'Failed to save user data - please try again' };
      }
    } catch (error) {
      console.error('❌ Save failed:', error);
      // Remove user from memory since we couldn't save it
      delete db.users[id];
      return { success: false, error: 'Failed to save user data - please try again' };
    }
    
    // SYNC TO GOOGLE SHEETS (backup layer)
    console.log('  - Syncing to Google Sheets as backup...');
    googleSheetsUserDb.create(email, password, displayName).then(result => {
      if (result.success) {
        console.log('✅ User synced to Google Sheets successfully');
      } else {
        console.log('⚠️ Google Sheets sync failed (non-critical):', result.error);
      }
    }).catch(error => {
      console.log('⚠️ Google Sheets sync error (non-critical):', error);
    });
    
    return { success: true, user: { id, email, displayName, verificationToken } };
  },

  findByEmail: (email: string) => {
    return Object.values(db.users).find(user => user.email === email);
  },

  findById: (id: string) => {
    return db.users[id];
  },

  verifyEmail: (token: string) => {
    const user = Object.values(db.users).find(user => user.verification_token === token);
    if (user) {
      user.email_verified = true;
      user.status = 'active';
      user.verification_token = undefined;
      user.updated_at = Math.floor(Date.now() / 1000);
      saveDatabase();
      return { success: true, user };
    }
    return { success: false, error: 'Invalid token' };
  },

  updateCredits: (userId: string, credits: number) => {
    const user = db.users[userId];
    if (user) {
      user.credits += credits;
      user.updated_at = Math.floor(Date.now() / 1000);
      saveDatabase();
    }
  },

  deductCredits: (userId: string, credits: number) => {
    const user = db.users[userId];
    if (user && user.credits >= credits) {
      user.credits -= credits;
      user.updated_at = Math.floor(Date.now() / 1000);
      saveDatabase();
      return { success: true };
    }
    return { success: false, error: 'Insufficient credits' };
  },

  getAllUsers: () => {
    return Object.values(db.users);
  },

  updateUser: (id: string, updates: any) => {
    const user = db.users[id];
    if (user) {
      Object.assign(user, updates);
      user.updated_at = Math.floor(Date.now() / 1000);
      saveDatabase();
    }
  },

  deleteUser: (id: string) => {
    if (db.users[id]) {
      delete db.users[id];
      saveDatabase();
      return { success: true };
    }
    return { success: false, error: 'User not found' };
  },

  // Comprehensive user deletion - removes user and all related data
  deleteUserCompletely: (id: string) => {
    console.log('🗑️ DELETING USER COMPLETELY:', id);
    
    try {
      const results = {
        userDeleted: false,
        ordersDeleted: 0,
        emailLogsDeleted: 0,
        contentDeleted: 0
      };

      // Check if user exists
      if (!db.users[id]) {
        console.log('❌ User not found:', id);
        return { 
          success: false, 
          error: 'User not found',
          results 
        };
      }

      console.log('✅ User found, proceeding with deletion');

      // Delete user
      delete db.users[id];
      results.userDeleted = true;
      console.log('✅ User deleted from memory');

      // Delete all orders for this user
      const userOrders = Object.values(db.orders).filter(order => order.user_id === id);
      userOrders.forEach(order => {
        delete db.orders[order.id];
        results.ordersDeleted++;
      });
      console.log('✅ Orders deleted:', results.ordersDeleted);

      // Delete all email logs for this user
      const userEmailLogs = Object.values(db.emailLogs).filter(log => log.user_id === id);
      userEmailLogs.forEach(log => {
        delete db.emailLogs[log.id];
        results.emailLogsDeleted++;
      });
      console.log('✅ Email logs deleted:', results.emailLogsDeleted);

      // Delete all content for this user
      const userContent = Object.values(db.userContent).filter(content => content.user_id === id);
      userContent.forEach(content => {
        delete db.userContent[content.id];
        results.contentDeleted++;
      });
      console.log('✅ Content deleted:', results.contentDeleted);

      // Save database with error handling
      console.log('💾 Attempting to save database...');
      try {
        saveDatabase();
        console.log('✅ Database saved successfully');
      } catch (saveError) {
        console.error('❌ Database save failed:', saveError);
        return { 
          success: false, 
          error: `Database save failed: ${saveError.message}`,
          results 
        };
      }

      return { 
        success: true, 
        message: `User and all related data deleted successfully`,
        results
      };
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in deleteUserCompletely:', error);
      return { 
        success: false, 
        error: `Critical error during deletion: ${error.message}`,
        results: {
          userDeleted: false,
          ordersDeleted: 0,
          emailLogsDeleted: 0,
          contentDeleted: 0
        }
      };
    }
  }
};

// Order management functions
export const orderDb = {
  create: (userId: string, totalAmount: number, subscriptionTier?: string, creditsPurchased?: number) => {
    const id = uuidv4();
    const orderNumber = `TAL-${Date.now()}`;
    
    const order: Order = {
      id,
      user_id: userId,
      order_number: orderNumber,
      total_amount: totalAmount,
      subscription_tier: subscriptionTier,
      credits_purchased: creditsPurchased,
      status: 'pending',
      currency: 'USD',
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000)
    };
    
    db.orders[id] = order;
    saveDatabase();
    
    return { id, orderNumber };
  },

  updateStatus: (id: string, status: string, paymentIntentId?: string) => {
    const order = db.orders[id];
    if (order) {
      order.status = status;
      order.payment_intent_id = paymentIntentId;
      order.updated_at = Math.floor(Date.now() / 1000);
      saveDatabase();
    }
  },

  findByUser: (userId: string) => {
    return Object.values(db.orders).filter(order => order.user_id === userId);
  },

  findById: (id: string) => {
    return db.orders[id];
  },

  getAllOrders: () => {
    return Object.values(db.orders);
  }
};

// Email log functions
export const emailDb = {
  log: (userId: string | null, emailType: string, recipientEmail: string, subject: string) => {
    const id = uuidv4();
    const emailLog: EmailLog = {
      id,
      user_id: userId || undefined,
      email_type: emailType,
      recipient_email: recipientEmail,
      subject,
      status: 'pending',
      created_at: Math.floor(Date.now() / 1000)
    };
    
    db.emailLogs[id] = emailLog;
    saveDatabase();
    return id;
  },

  updateStatus: (id: string, status: string, errorMessage?: string) => {
    const emailLog = db.emailLogs[id];
    if (emailLog) {
      emailLog.status = status;
      emailLog.sent_at = Math.floor(Date.now() / 1000);
      emailLog.error_message = errorMessage;
      saveDatabase();
    }
  }
};

// User content management functions
export const contentDb = {
  create: (userId: string, title: string, type: 'story' | 'coloring' | 'image', content: any, thumbnailUrl?: string) => {
    const id = uuidv4();
    const newContent: UserContent = {
      id,
      user_id: userId,
      title,
      type,
      content,
      thumbnail_url: thumbnailUrl,
      status: 'published',
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000)
    };
    
    db.userContent[id] = newContent;
    saveDatabase();
    
    return { success: true, content: newContent };
  },

  findByUser: (userId: string) => {
    return Object.values(db.userContent).filter(content => content.user_id === userId);
  },

  findById: (id: string) => {
    return db.userContent[id];
  },

  update: (id: string, updates: Partial<UserContent>) => {
    const content = db.userContent[id];
    if (content) {
      Object.assign(content, updates);
      content.updated_at = Math.floor(Date.now() / 1000);
      saveDatabase();
      return { success: true, content };
    }
    return { success: false, error: 'Content not found' };
  },

  delete: (id: string) => {
    if (db.userContent[id]) {
      delete db.userContent[id];
      saveDatabase();
      return { success: true };
    }
    return { success: false, error: 'Content not found' };
  },

  toggleFavorite: (id: string) => {
    const content = db.userContent[id];
    if (content) {
      content.status = content.status === 'favorite' ? 'published' : 'favorite';
      content.updated_at = Math.floor(Date.now() / 1000);
      saveDatabase();
      return { success: true, content };
    }
    return { success: false, error: 'Content not found' };
  }
};

// Initialize database on import
initializeDatabase();

export default db;
