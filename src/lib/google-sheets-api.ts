// Google Sheets API Service using Apps Script
// This replaces the local database with Google Sheets as the primary database

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

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
  country?: string;
  city?: string;
  age?: string;
  gender?: string;
  interests?: string;
  source?: string;
  notes?: string;
}

interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  user?: User;
  users?: User[];
  newCredits?: number;
}

// Helper function to make API calls to Google Apps Script
async function callGoogleSheetsAPI(action: string, data: any = {}): Promise<ApiResponse> {
  try {
    const url = `${GOOGLE_APPS_SCRIPT_URL}?action=${action}&apiKey=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        apiKey: GOOGLE_SHEETS_API_KEY,
        ...data
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error calling Google Sheets API for action ${action}:`, error);
    return {
      success: false,
      error: error.message || 'API call failed'
    };
  }
}

// User management functions
export const googleSheetsUserDb = {
  // Create a new user
  create: async (email: string, password: string, displayName: string) => {
    console.log('🔍 GOOGLE SHEETS CREATE - Attempting to create user:');
    console.log('  - email:', email);
    console.log('  - displayName:', displayName);
    
    const result = await callGoogleSheetsAPI('createUser', {
      email,
      password,
      displayName,
      credits: 50,
      status: 'active',
      emailVerified: true,
      subscriptionTier: 'FREE',
      source: 'website'
    });

    console.log('  - result.success:', result.success);
    console.log('  - result.error:', result.error);

    if (result.success) {
      return {
        success: true,
        user: {
          id: result.userId,
          email,
          displayName,
          verificationToken: 'auto-verified'
        }
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to create user'
      };
    }
  },

  // Find user by email
  findByEmail: async (email: string) => {
    const result = await callGoogleSheetsAPI('getUsers');
    
    if (result.success && result.users) {
      return result.users.find((user: any) => user['البريد الإلكتروني'] === email);
    }
    return null;
  },

  // Find user by ID
  findById: async (id: string) => {
    const result = await callGoogleSheetsAPI('getUser', { userId: id });
    
    if (result.success && result.user) {
      return result.user;
    }
    return null;
  },

  // Verify email (not needed since we auto-verify)
  verifyEmail: async (token: string) => {
    return { success: true, user: null };
  },

  // Add credits to user
  addCredits: async (userId: string, credits: number) => {
    const result = await callGoogleSheetsAPI('addCredits', {
      userId,
      amount: credits
    });

    return result;
  },

  // Deduct credits from user
  deductCredits: async (userId: string, credits: number) => {
    const result = await callGoogleSheetsAPI('deductCredits', {
      userId,
      amount: credits
    });

    return result;
  },

  // Update credits (set specific amount)
  updateCredits: async (userId: string, credits: number) => {
    const result = await callGoogleSheetsAPI('updateCredits', {
      userId,
      credits
    });

    return result;
  },

  // Get all users
  getAllUsers: async () => {
    const result = await callGoogleSheetsAPI('getUsers');
    
    if (result.success && result.users) {
      return result.users;
    }
    return [];
  },

  // Update user
  updateUser: async (id: string, updates: any) => {
    const result = await callGoogleSheetsAPI('updateUser', {
      userId: id,
      ...updates
    });

    return result;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const result = await callGoogleSheetsAPI('deleteUser', {
      userId: id
    });

    return result;
  },

  // Sync user credits
  syncCredits: async (userId: string) => {
    const result = await callGoogleSheetsAPI('syncCredits', {
      userId
    });

    return result;
  },

  // Health check
  healthCheck: async () => {
    const result = await callGoogleSheetsAPI('health');
    return result;
  }
};

// Convert Google Sheets user format to our app format
export function convertSheetsUserToAppUser(sheetsUser: any): User {
  return {
    id: sheetsUser['المعرف'] || sheetsUser.id,
    email: sheetsUser['البريد الإلكتروني'] || sheetsUser.email,
    displayName: sheetsUser['الاسم'] || sheetsUser.displayName,
    credits: parseInt(sheetsUser['النقاط'] || sheetsUser.credits || '0'),
    status: sheetsUser['الحالة'] || sheetsUser.status || 'active',
    emailVerified: sheetsUser['البريد الإلكتروني مؤكد'] === 'نعم' || sheetsUser.emailVerified === true,
    subscriptionTier: sheetsUser['مستوى الاشتراك'] || sheetsUser.subscriptionTier || 'FREE',
    createdAt: sheetsUser['تاريخ الإنشاء'] || sheetsUser.createdAt || new Date().toISOString(),
    lastLogin: sheetsUser['آخر دخول'] || sheetsUser.lastLogin,
    totalSpent: parseInt(sheetsUser['إجمالي المدفوع'] || sheetsUser.totalSpent || '0'),
    phone: sheetsUser['رقم الهاتف'] || sheetsUser.phone,
    country: sheetsUser['البلد'] || sheetsUser.country,
    city: sheetsUser['المدينة'] || sheetsUser.city,
    age: sheetsUser['العمر'] || sheetsUser.age,
    gender: sheetsUser['الجنس'] || sheetsUser.gender,
    interests: sheetsUser['الاهتمامات'] || sheetsUser.interests,
    source: sheetsUser['المصدر'] || sheetsUser.source,
    notes: sheetsUser['ملاحظات'] || sheetsUser.notes
  };
}

export default googleSheetsUserDb;
