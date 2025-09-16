import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'database.json');

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
      db = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
}

// Save database to file
function saveDatabase() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Initialize database
function initializeDatabase() {
  loadDatabase();
  
  // Create default admin user if not exists
  const adminExists = Object.values(db.adminUsers).find(user => user.email === 'admin@talween.com');
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
    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const verificationToken = uuidv4();
    
    // Check if user already exists
    const existingUser = Object.values(db.users).find(user => user.email === email);
    if (existingUser) {
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
    
    db.users[id] = newUser;
    saveDatabase();
    
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
