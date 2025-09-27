// Data integrity monitoring and health checks
import fs from 'fs';
import path from 'path';
import { googleSheetsUserDb } from './google-sheets-api';

const dbPath = path.join(process.cwd(), 'database.json');
const backupPath = path.join(process.cwd(), 'database-backup.json');
const emergencyPath = path.join(process.cwd(), 'database-emergency.json');

export interface DataHealthReport {
  timestamp: number;
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalContent: number;
    lastBackup: string | null;
    databaseSize: number;
  };
  recommendations: string[];
}

// Comprehensive data health check
export function performDataHealthCheck(): DataHealthReport {
  const timestamp = Date.now();
  const issues: string[] = [];
  const recommendations: string[] = [];
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';

  try {
    console.log('🔍 PERFORMING DATA HEALTH CHECK...');

    // Check if main database exists and is readable
    if (!fs.existsSync(dbPath)) {
      issues.push('Main database file does not exist');
      status = 'critical';
    } else {
      try {
        const data = fs.readFileSync(dbPath, 'utf8');
        const db = JSON.parse(data);

        // Validate database structure
        if (!db.users || typeof db.users !== 'object' || Array.isArray(db.users)) {
          issues.push('Users data structure is invalid');
          status = 'critical';
        }

        if (!db.orders || typeof db.orders !== 'object' || Array.isArray(db.orders)) {
          issues.push('Orders data structure is invalid');
          status = 'warning';
        }

        if (!db.userContent || typeof db.userContent !== 'object' || Array.isArray(db.userContent)) {
          issues.push('UserContent data structure is invalid');
          status = 'warning';
        }

        // Check for data integrity issues
        const users = Object.values(db.users || {});
        users.forEach((user: any, index) => {
          if (!user.id || !user.email || !user.password) {
            issues.push(`User ${index} missing critical fields (id, email, or password)`);
            status = 'critical';
          }
        });

        // Check for duplicate emails
        const emails = users.map((user: any) => user.email);
        const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
        if (duplicateEmails.length > 0) {
          issues.push(`Duplicate emails found: ${duplicateEmails.join(', ')}`);
          status = 'warning';
        }

      } catch (parseError) {
        issues.push(`Database file is corrupted: ${parseError}`);
        status = 'critical';
      }
    }

    // Check backup files
    let lastBackup: string | null = null;
    if (fs.existsSync(backupPath)) {
      const backupStats = fs.statSync(backupPath);
      lastBackup = new Date(backupStats.mtime).toISOString();
    } else {
      issues.push('Backup file does not exist');
      status = status === 'critical' ? 'critical' : 'warning';
    }

    if (!fs.existsSync(emergencyPath)) {
      issues.push('Emergency backup file does not exist');
      status = status === 'critical' ? 'critical' : 'warning';
    }

    // Get database statistics
    let stats = {
      totalUsers: 0,
      totalOrders: 0,
      totalContent: 0,
      lastBackup,
      databaseSize: 0
    };

    try {
      if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        const db = JSON.parse(data);
        
        stats.totalUsers = Object.keys(db.users || {}).length;
        stats.totalOrders = Object.keys(db.orders || {}).length;
        stats.totalContent = Object.keys(db.userContent || {}).length;
        stats.databaseSize = Buffer.byteLength(data, 'utf8');
      }
    } catch (error) {
      issues.push('Failed to calculate database statistics');
    }

    // Generate recommendations
    if (issues.length === 0) {
      recommendations.push('Database is healthy - no issues detected');
    } else {
      if (issues.some(issue => issue.includes('critical') || issue.includes('corrupted'))) {
        recommendations.push('IMMEDIATE ACTION REQUIRED: Restore from backup');
        recommendations.push('Consider running data recovery procedures');
      }
      
      if (issues.some(issue => issue.includes('backup'))) {
        recommendations.push('Create backup files immediately');
      }
      
      if (issues.some(issue => issue.includes('duplicate'))) {
        recommendations.push('Clean up duplicate user records');
      }
      
      if (stats.totalUsers > 1000) {
        recommendations.push('Consider implementing database archiving for old records');
      }
    }

    console.log(`✅ Data health check completed - Status: ${status}`);
    console.log(`   - Issues found: ${issues.length}`);
    console.log(`   - Total users: ${stats.totalUsers}`);
    console.log(`   - Database size: ${(stats.databaseSize / 1024).toFixed(2)} KB`);

    return {
      timestamp,
      status,
      issues,
      stats,
      recommendations
    };

  } catch (error) {
    console.error('❌ Data health check failed:', error);
    return {
      timestamp,
      status: 'critical',
      issues: [`Health check failed: ${error}`],
      stats: {
        totalUsers: 0,
        totalOrders: 0,
        totalContent: 0,
        lastBackup: null,
        databaseSize: 0
      },
      recommendations: ['CRITICAL: Data health check system is not functioning']
    };
  }
}

// Automatic data recovery
export async function performDataRecovery(): Promise<{ success: boolean; message: string; recovered: number }> {
  try {
    console.log('🚨 INITIATING DATA RECOVERY...');
    
    let recovered = 0;

    // Check if main database is corrupted
    let mainDbValid = false;
    try {
      if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        const db = JSON.parse(data);
        if (db.users && typeof db.users === 'object' && !Array.isArray(db.users)) {
          mainDbValid = true;
        }
      }
    } catch (error) {
      console.log('Main database is corrupted, attempting recovery...');
    }

    if (!mainDbValid) {
      // Try to restore from backup
      if (fs.existsSync(backupPath)) {
        try {
          const backupData = fs.readFileSync(backupPath, 'utf8');
          const backupDb = JSON.parse(backupData);
          
          if (backupDb.users && typeof backupDb.users === 'object') {
            fs.writeFileSync(dbPath, backupData, 'utf8');
            recovered = Object.keys(backupDb.users).length;
            console.log(`✅ Recovered ${recovered} users from backup`);
            return {
              success: true,
              message: `Successfully recovered ${recovered} users from backup`,
              recovered
            };
          }
        } catch (error) {
          console.log('Backup restoration failed:', error);
        }
      }

      // Try emergency backup
      if (fs.existsSync(emergencyPath)) {
        try {
          const emergencyData = fs.readFileSync(emergencyPath, 'utf8');
          const emergencyDb = JSON.parse(emergencyData);
          
          if (emergencyDb.users && typeof emergencyDb.users === 'object') {
            fs.writeFileSync(dbPath, emergencyData, 'utf8');
            recovered = Object.keys(emergencyDb.users).length;
            console.log(`✅ Recovered ${recovered} users from emergency backup`);
            return {
              success: true,
              message: `Successfully recovered ${recovered} users from emergency backup`,
              recovered
            };
          }
        } catch (error) {
          console.log('Emergency backup restoration failed:', error);
        }
      }

      // Last resort: try to recover from Google Sheets
      try {
        console.log('Attempting recovery from Google Sheets...');
        const users = await googleSheetsUserDb.getAllUsers();
        if (users && users.length > 0) {
          // Create a new database structure
          const newDb = {
            users: {},
            orders: {},
            emailLogs: {},
            userContent: {},
            adminUsers: {}
          };

          // Migrate users from Google Sheets
          users.forEach((user: any) => {
            const userId = user['المعرف'] || user.id || Math.random().toString(36);
            newDb.users[userId] = {
              id: userId,
              email: user['البريد الإلكتروني'] || user.email,
              password: user['كلمة المرور'] || user.password || 'recovered',
              display_name: user['الاسم'] || user.displayName || 'Recovered User',
              credits: parseInt(user['النقاط'] || user.credits || '50'),
              status: 'active',
              email_verified: true,
              subscription_tier: 'FREE',
              created_at: Math.floor(Date.now() / 1000),
              updated_at: Math.floor(Date.now() / 1000),
              total_spent: 0
            };
            recovered++;
          });

          fs.writeFileSync(dbPath, JSON.stringify(newDb, null, 2), 'utf8');
          console.log(`✅ Recovered ${recovered} users from Google Sheets`);
          return {
            success: true,
            message: `Successfully recovered ${recovered} users from Google Sheets`,
            recovered
          };
        }
      } catch (error) {
        console.log('Google Sheets recovery failed:', error);
      }

      return {
        success: false,
        message: 'All recovery attempts failed - manual intervention required',
        recovered: 0
      };
    }

    return {
      success: true,
      message: 'Database is already valid - no recovery needed',
      recovered: 0
    };

  } catch (error) {
    console.error('❌ Data recovery failed:', error);
    return {
      success: false,
      message: `Data recovery failed: ${error}`,
      recovered: 0
    };
  }
}

// Schedule regular health checks
export function startDataMonitoring() {
  console.log('🔍 Starting data monitoring...');
  
  // Perform health check every 5 minutes
  setInterval(() => {
    const report = performDataHealthCheck();
    
    if (report.status === 'critical') {
      console.error('🚨 CRITICAL DATA ISSUE DETECTED:', report.issues);
      // In production, you might want to send alerts here
    } else if (report.status === 'warning') {
      console.warn('⚠️ Data warnings detected:', report.issues);
    }
    
  }, 5 * 60 * 1000); // 5 minutes
  
  console.log('✅ Data monitoring started');
}
