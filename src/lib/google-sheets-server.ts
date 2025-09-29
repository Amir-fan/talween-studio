// Server-side Google Sheets API using Apps Script
// This is for server-side operations (API routes, auth, etc.)

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;

interface User {
  id: string;
  email: string;
  displayName: string;
  credits: number;
  status: string;
  emailVerified: boolean;
  subscriptionTier: string;
  createdAt: string;
  lastLogin?: string;
  totalSpent: number;
  phone?: string;
  role?: string;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const googleSheetsUserDb = {
  async create(email: string, password: string, displayName: string): Promise<AuthResult> {
    try {
      console.log('🔄 Creating user in Google Sheets (server-side)...');
      
      if (!GOOGLE_APPS_SCRIPT_URL || !GOOGLE_SHEETS_API_KEY) {
        console.error('❌ Missing Google Sheets environment variables');
        return { success: false, error: 'Google Sheets configuration not found' };
      }
      
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createUser',
          apiKey: GOOGLE_SHEETS_API_KEY,
          data: {
            email,
            password,
            displayName,
            credits: 50,
            subscriptionTier: 'FREE',
            totalPaid: 0
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Google Sheets create response:', result);

      if (result.success) {
        const user: User = {
          id: result.userId || result.user?.id || 'unknown',
          email,
          displayName,
          credits: 50,
          status: 'active',
          emailVerified: true,
          subscriptionTier: 'FREE',
          createdAt: new Date().toISOString(),
          totalSpent: 0,
          role: 'user'
        };

        return { success: true, user };
      } else {
        return { success: false, error: result.error || 'Failed to create user in Google Sheets' };
      }
    } catch (error) {
      console.error('❌ Google Sheets create error:', error);
      return { success: false, error: error.message };
    }
  },

  async findByEmail(email: string): Promise<AuthResult> {
    try {
      console.log('🔍 Finding user by email in Google Sheets (server-side)...');
      
      if (!GOOGLE_APPS_SCRIPT_URL || !GOOGLE_SHEETS_API_KEY) {
        console.error('❌ Missing Google Sheets environment variables');
        return { success: false, error: 'Google Sheets configuration not found' };
      }
      
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getUserByEmail',
          apiKey: GOOGLE_SHEETS_API_KEY,
          email
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Google Sheets find response:', result);

      if (result.success && result.user) {
        const user: User = {
          id: result.user.id || result.user.ID,
          email: result.user.email || result.user.Email,
          displayName: result.user.name || result.user.Name || result.user.displayName,
          credits: parseInt(result.user.credits || result.user.Credits || '0'),
          status: 'active',
          emailVerified: true,
          subscriptionTier: result.user.subscription || result.user.Subscription || 'FREE',
          createdAt: result.user.created || result.user.Created || new Date().toISOString(),
          lastLogin: result.user.lastLogin || result.user.LastLogin,
          totalSpent: parseFloat(result.user.totalPaid || result.user.TotalPaid || '0'),
          role: 'user'
        };

        return { success: true, user };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('❌ Google Sheets find error:', error);
      return { success: false, error: error.message };
    }
  },

  async findById(id: string): Promise<AuthResult> {
    try {
      console.log('🔍 Finding user by ID in Google Sheets (server-side)...');
      
      if (!GOOGLE_APPS_SCRIPT_URL || !GOOGLE_SHEETS_API_KEY) {
        console.error('❌ Missing Google Sheets environment variables');
        return { success: false, error: 'Google Sheets configuration not found' };
      }
      
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getUserById',
          apiKey: GOOGLE_SHEETS_API_KEY,
          userId: id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Google Sheets find by ID response:', result);

      if (result.success && result.user) {
        const user: User = {
          id: result.user.id || result.user.ID,
          email: result.user.email || result.user.Email,
          displayName: result.user.name || result.user.Name || result.user.displayName,
          credits: parseInt(result.user.credits || result.user.Credits || '0'),
          status: 'active',
          emailVerified: true,
          subscriptionTier: result.user.subscription || result.user.Subscription || 'FREE',
          createdAt: result.user.created || result.user.Created || new Date().toISOString(),
          lastLogin: result.user.lastLogin || result.user.LastLogin,
          totalSpent: parseFloat(result.user.totalPaid || result.user.TotalPaid || '0'),
          role: 'user'
        };

        return { success: true, user };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('❌ Google Sheets find by ID error:', error);
      return { success: false, error: error.message };
    }
  },

  async updateCredits(userId: string, credits: number): Promise<AuthResult> {
    try {
      console.log('🔄 Updating credits in Google Sheets (server-side)...');
      
      if (!GOOGLE_APPS_SCRIPT_URL || !GOOGLE_SHEETS_API_KEY) {
        console.error('❌ Missing Google Sheets environment variables');
        return { success: false, error: 'Google Sheets configuration not found' };
      }
      
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateCredits',
          apiKey: GOOGLE_SHEETS_API_KEY,
          userId,
          credits
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Google Sheets update credits response:', result);

      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to update credits' };
      }
    } catch (error) {
      console.error('❌ Google Sheets update credits error:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteUser(userId: string): Promise<AuthResult> {
    try {
      console.log('🗑️ Deleting user from Google Sheets (server-side)...');
      
      if (!GOOGLE_APPS_SCRIPT_URL || !GOOGLE_SHEETS_API_KEY) {
        console.error('❌ Missing Google Sheets environment variables');
        return { success: false, error: 'Google Sheets configuration not found' };
      }
      
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteUser',
          apiKey: GOOGLE_SHEETS_API_KEY,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Google Sheets delete response:', result);

      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to delete user' };
      }
    } catch (error) {
      console.error('❌ Google Sheets delete error:', error);
      return { success: false, error: error.message };
    }
  }
};
