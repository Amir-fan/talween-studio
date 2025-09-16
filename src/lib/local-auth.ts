/**
 * Simple local storage authentication system
 * Replaces Firebase authentication with localStorage
 */

export interface LocalUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export interface LocalUserData {
  uid: string;
  email: string;
  name: string;
  credits: number;
  status: string;
  createdAt: string;
  lastLogin: string;
}

// Default admin user
export const ADMIN_USER: LocalUser = {
  uid: 'admin',
  email: 'admin@talween.com',
  displayName: 'مستخدم عادي',
  photoURL: null,
};

export const ADMIN_USER_DATA: LocalUserData = {
  uid: 'admin',
  email: 'admin@talween.com',
  name: 'مستخدم عادي',
  credits: 9999,
  status: 'premium',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

// Generate a simple user ID
function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Get user from localStorage
export function getLocalUser(): LocalUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('talween_user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

// Get user data from localStorage
export function getLocalUserData(): LocalUserData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('talween_user_data');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

// Save user to localStorage
export function saveLocalUser(user: LocalUser): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('talween_user', JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
}

// Save user data to localStorage
export function saveLocalUserData(userData: LocalUserData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('talween_user_data', JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
}

// Clear user from localStorage
export function clearLocalUser(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('talween_user');
    localStorage.removeItem('talween_user_data');
  } catch (error) {
    console.error('Failed to clear user:', error);
  }
}

// Create a new user
export function createLocalUser(email: string, password: string, displayName?: string): { success: boolean; user?: LocalUser; error?: string } {
  try {
    // Simple validation
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check if user already exists (simple check)
    const existingUser = getLocalUser();
    if (existingUser && existingUser.email === email) {
      return { success: false, error: 'User already exists' };
    }

    const userId = generateUserId();
    const user: LocalUser = {
      uid: userId,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: null,
    };

    const userData: LocalUserData = {
      uid: userId,
      email,
      name: displayName || email.split('@')[0],
      credits: 50, // Give 50 credits on signup
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    saveLocalUser(user);
    saveLocalUserData(userData);

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Failed to create user' };
  }
}

// Sign in user
export function signInLocalUser(email: string, password: string): { success: boolean; user?: LocalUser; error?: string } {
  try {
    // Check admin credentials first
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (email === 'admin' && password === adminPassword) {
      saveLocalUser(ADMIN_USER);
      saveLocalUserData(ADMIN_USER_DATA);
      return { success: true, user: ADMIN_USER };
    }

    // For demo purposes, accept any email/password combination
    // In a real app, you'd validate against stored credentials
    const user: LocalUser = {
      uid: generateUserId(),
      email,
      displayName: email.split('@')[0],
      photoURL: null,
    };

    const userData: LocalUserData = {
      uid: user.uid,
      email,
      name: user.displayName,
      credits: 100, // Give 100 credits for demo
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    saveLocalUser(user);
    saveLocalUserData(userData);

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Failed to sign in' };
  }
}

// Update user credits
export function updateLocalUserCredits(userId: string, newCredits: number): boolean {
  try {
    const userData = getLocalUserData();
    if (!userData || userData.uid !== userId) return false;

    const updatedUserData = { ...userData, credits: newCredits };
    saveLocalUserData(updatedUserData);
    return true;
  } catch {
    return false;
  }
}

// Deduct credits
export function deductLocalUserCredits(userId: string, amount: number): { success: boolean; newCredits?: number; error?: string } {
  try {
    console.log('🔍 CREDIT DEBUG - deductLocalUserCredits called:');
    console.log('  - userId:', userId);
    console.log('  - amount:', amount);
    
    // Get user data from the main talween_user localStorage key
    const storedUser = localStorage.getItem('talween_user');
    if (!storedUser) {
      console.log('❌ No user found in localStorage');
      return { success: false, error: 'User not found in localStorage' };
    }
    
    const userData = JSON.parse(storedUser);
    console.log('  - userData from localStorage:', userData);
    
    if (!userData) {
      console.log('❌ No userData found in localStorage');
      return { success: false, error: 'User not found in localStorage' };
    }
    
    console.log('  - Current credits:', userData.credits);
    console.log('  - Required credits:', amount);
    console.log('  - Has enough credits?', userData.credits >= amount);

    if (userData.credits < amount) {
      console.log('❌ Not enough credits');
      return { success: false, error: 'Not enough credits' };
    }

    const newCredits = userData.credits - amount;
    const updatedUser = { ...userData, credits: newCredits };
    
    // Update the main user localStorage key
    localStorage.setItem('talween_user', JSON.stringify(updatedUser));
    
    // Also update talween_user_data for backward compatibility
    const userDataForBackup = {
      uid: userData.id || userData.uid,
      email: userData.email,
      name: userData.displayName,
      credits: newCredits,
      status: userData.status,
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem('talween_user_data', JSON.stringify(userDataForBackup));
    
    console.log('✅ Credits deducted successfully');
    console.log('  - Old credits:', userData.credits);
    console.log('  - Amount deducted:', amount);
    console.log('  - New credits:', newCredits);
    console.log('  - Updated user saved:', updatedUser);

    return { success: true, newCredits };
  } catch (error) {
    console.log('❌ Error in deductLocalUserCredits:', error);
    return { success: false, error: 'Failed to deduct credits' };
  }
}
