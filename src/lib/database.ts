import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize database tables
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT NOT NULL,
      credits INTEGER DEFAULT 50,
      status TEXT DEFAULT 'pending',
      email_verified BOOLEAN DEFAULT FALSE,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expires INTEGER,
      subscription_tier TEXT DEFAULT 'FREE',
      subscription_expires INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      last_login INTEGER,
      total_spent REAL DEFAULT 0,
      country TEXT,
      phone TEXT
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      order_number TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending',
      total_amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      payment_method TEXT,
      payment_intent_id TEXT,
      subscription_tier TEXT,
      credits_purchased INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Email logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email_type TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      sent_at INTEGER,
      error_message TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Stories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      child_name TEXT NOT NULL,
      content TEXT NOT NULL,
      pages TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Create default admin user
  const adminExists = db.prepare('SELECT id FROM admin_users WHERE email = ?').get('admin@talween.com');
  if (!adminExists) {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO admin_users (id, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), 'admin@talween.com', adminPassword, 'admin');
  }
}

// User management functions
export const userDb = {
  create: (email: string, password: string, displayName: string) => {
    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const verificationToken = uuidv4();
    
    try {
      db.prepare(`
        INSERT INTO users (id, email, password, display_name, verification_token)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, email, hashedPassword, displayName, verificationToken);
      
      return { success: true, user: { id, email, displayName, verificationToken } };
    } catch (error) {
      return { success: false, error: 'Email already exists' };
    }
  },

  findByEmail: (email: string) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findById: (id: string) => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  verifyEmail: (token: string) => {
    const user = db.prepare('SELECT * FROM users WHERE verification_token = ?').get(token);
    if (user) {
      db.prepare(`
        UPDATE users 
        SET email_verified = TRUE, verification_token = NULL, status = 'active'
        WHERE id = ?
      `).run(user.id);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid token' };
  },

  updateCredits: (userId: string, credits: number) => {
    db.prepare('UPDATE users SET credits = credits + ?, updated_at = strftime("%s", "now") WHERE id = ?')
      .run(credits, userId);
  },

  deductCredits: (userId: string, credits: number) => {
    const user = db.prepare('SELECT credits FROM users WHERE id = ?').get(userId);
    if (user && user.credits >= credits) {
      db.prepare('UPDATE users SET credits = credits - ?, updated_at = strftime("%s", "now") WHERE id = ?')
        .run(credits, userId);
      return { success: true };
    }
    return { success: false, error: 'Insufficient credits' };
  },

  getAllUsers: () => {
    return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  },

  updateUser: (id: string, updates: any) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    db.prepare(`UPDATE users SET ${fields}, updated_at = strftime("%s", "now") WHERE id = ?`)
      .run(...values);
  }
};

// Order management functions
export const orderDb = {
  create: (userId: string, totalAmount: number, subscriptionTier?: string, creditsPurchased?: number) => {
    const id = uuidv4();
    const orderNumber = `TAL-${Date.now()}`;
    
    db.prepare(`
      INSERT INTO orders (id, user_id, order_number, total_amount, subscription_tier, credits_purchased)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, orderNumber, totalAmount, subscriptionTier, creditsPurchased);
    
    return { id, orderNumber };
  },

  updateStatus: (id: string, status: string, paymentIntentId?: string) => {
    db.prepare(`
      UPDATE orders 
      SET status = ?, payment_intent_id = ?, updated_at = strftime("%s", "now")
      WHERE id = ?
    `).run(status, paymentIntentId, id);
  },

  findByUser: (userId: string) => {
    return db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  },

  findById: (id: string) => {
    return db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  }
};

// Email log functions
export const emailDb = {
  log: (userId: string | null, emailType: string, recipientEmail: string, subject: string) => {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO email_logs (id, user_id, email_type, recipient_email, subject)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, emailType, recipientEmail, subject);
    return id;
  },

  updateStatus: (id: string, status: string, errorMessage?: string) => {
    db.prepare(`
      UPDATE email_logs 
      SET status = ?, sent_at = strftime("%s", "now"), error_message = ?
      WHERE id = ?
    `).run(status, errorMessage, id);
  }
};

// Initialize database on import
initializeDatabase();

export default db;
