'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  displayName: string;
  credits: number;
  status: string;
  emailVerified: boolean;
  subscriptionTier: string;
}

interface AuthContextType {
  user: User | null;
  userData: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => void;
  loginAsAdmin: (email: string, password: string) => boolean;
  signUp: (email: string, password: string, displayName?: string) => { success: boolean; error?: string };
  signIn: (email: string, password: string) => { success: boolean; error?: string };
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return;
    }

    const initializeUser = async () => {
      setLoading(true);
      // Check for stored user in localStorage
      const storedUser = localStorage.getItem('talween_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Handle admin user
          if (userData.uid === 'admin') {
            const adminUser = {
              id: 'admin',
              email: 'admin@talween.com',
              displayName: 'مستخدم عادي',
              credits: 9999,
              status: 'premium',
              emailVerified: true,
              subscriptionTier: 'CREATIVE_TEACHER'
            };
            setUser(adminUser);
            setUserData(adminUser);
            setIsAdmin(true);
            setLoading(false);
          } 
          // Handle regular user - ALWAYS fetch fresh credits from server
          else if (userData.id || userData.uid) {
            const canonicalId = userData.id || userData.uid;
            console.log('🔍 INITIALIZING USER - Fetching fresh credits from Google Sheets:', canonicalId);
            
            try {
              // Fetch fresh credits from server (Google Sheets)
              const response = await fetch('/api/user/sync-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: canonicalId })
              });
              
              if (response.ok) {
                const serverData = await response.json();
                if (serverData.success && serverData.user) {
                  console.log('✅ Fresh credits from Google Sheets:', serverData.user.credits);
                  
                  const regularUser = {
                    id: serverData.user.id,
                    email: serverData.user.email,
                    displayName: serverData.user.displayName,
                    credits: serverData.user.credits, // ALWAYS use Google Sheets credits
                    status: serverData.user.status,
                    emailVerified: serverData.user.emailVerified,
                    subscriptionTier: serverData.user.subscriptionTier
                  };
                  
                  // Update localStorage with fresh data
                  localStorage.setItem('talween_user_data', JSON.stringify(regularUser));
                  
                  setUser(regularUser);
                  setUserData(regularUser);
                  setIsAdmin(false);
                  setLoading(false);
                  return;
                }
              }
              
              // Fallback to localStorage if server sync fails
              console.log('⚠️ Server sync failed, using localStorage as fallback');
              const regularUser = {
                id: canonicalId,
                email: userData.email,
                displayName: userData.displayName,
                credits: userData.credits || 50,
                status: userData.status || 'active',
                emailVerified: userData.emailVerified || false,
                subscriptionTier: userData.subscriptionTier || 'FREE'
              };
              setUser(regularUser);
              setUserData(regularUser);
              setIsAdmin(false);
            } catch (error) {
              console.error('❌ Error fetching fresh credits:', error);
              // Fallback to localStorage
              const regularUser = {
                id: canonicalId,
                email: userData.email,
                displayName: userData.displayName,
                credits: userData.credits || 50,
                status: userData.status || 'active',
                emailVerified: userData.emailVerified || false,
                subscriptionTier: userData.subscriptionTier || 'FREE'
              };
              setUser(regularUser);
              setUserData(regularUser);
              setIsAdmin(false);
            }
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          // Clear invalid data
          localStorage.removeItem('talween_user');
        }
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('talween_user');
    localStorage.removeItem('talween_user_data');
    setUser(null);
    setUserData(null);
    setIsAdmin(false);
    
    // Clear admin token
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    router.push('/');
  };

  const loginAsAdmin = async (email: string, password: string) => {
    try {
      console.log('🔍 Attempting admin login with:', email);
      
      // Call the server-side admin login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('🔍 Admin login response:', data);
      console.log('🔍 Response status:', response.status);
      
      if (data.success && data.user) {
        // Check if this is an admin user
        if (data.user.role === 'admin') {
          const adminUser = {
            id: data.user.id,
            email: data.user.email,
            displayName: 'مدير النظام',
            credits: 9999,
            status: 'premium',
            emailVerified: true,
            subscriptionTier: 'CREATIVE_TEACHER'
          };
          localStorage.setItem('talween_user', JSON.stringify({ uid: data.user.id }));
          setUser(adminUser);
          setUserData(adminUser);
          setIsAdmin(true);
          
          // Set admin token for middleware
          const adminToken = `admin_${Date.now()}`;
          document.cookie = `admin_token=${adminToken}; path=/; max-age=86400; SameSite=Lax; Secure=false`; // 24 hours
          
          console.log('✅ Admin login successful');
          console.log('🔍 Admin token set:', adminToken);
          console.log('🔍 Current cookies:', document.cookie);
          return true;
        } else {
          console.log('❌ User is not an admin');
          return false;
        }
      } else {
        console.log('❌ Admin login failed:', data.error);
        console.log('❌ Response data:', data);
        return false;
      }
    } catch (error) {
      console.error('❌ Admin login error:', error);
      console.error('❌ Error details:', error.message);
      return false;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      });

      const data = await response.json();

      if (data.success) {
        console.log('🔍 REGISTRATION SUCCESS - User data from server:');
        console.log('  - data.user:', data.user);
        console.log('  - data.user.id:', data.user.id);
        
        // Auto-login user after successful registration (no verification needed)
        if (data.user) {
          // Use server's user.id directly (matches database)
          const userWithId = {
            ...data.user,
            id: data.user.id // Use server's id directly
          };
          
          console.log('  - Final userWithId:', userWithId);
          
          // Store user in localStorage for persistence - include both id and uid for compatibility
          const userForStorage = { ...userWithId, uid: userWithId.id };
          localStorage.setItem('talween_user', JSON.stringify(userForStorage));
          setUser(userWithId);
          setUserData(userWithId);
          setIsAdmin(userWithId.id === 'admin');
          
          console.log('✅ User registered and logged in automatically');
        }
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        console.log('🔍 LOGIN SUCCESS - User data from server:');
        console.log('  - data.user:', data.user);
        console.log('  - data.user.id:', data.user.id);
        console.log('  - data.user.uid:', data.user.uid);
        
        // Use the server's user.id directly (should match database)
        const userWithId = {
          ...data.user,
          id: data.user.id // Use the server's id directly
        };
        
        console.log('  - Final userWithId:', userWithId);
        
        // Store user in localStorage for persistence - include both id and uid for compatibility
        const userForStorage = { ...userWithId, uid: userWithId.id };
        // Ensure initial credits field is present to reflect server value
        if (typeof userForStorage.credits !== 'number') {
          userForStorage.credits = 50;
        }
        localStorage.setItem('talween_user', JSON.stringify(userForStorage));
        setUser(userWithId);
        setUserData(userWithId);
        
        // Check if user is admin by role, not by hardcoded ID
        const isAdminUser = userWithId.role === 'admin';
        setIsAdmin(isAdminUser);
        
        // If this is an admin user, also set the admin token cookie
        if (isAdminUser) {
          const adminToken = `admin_${Date.now()}`;
          document.cookie = `admin_token=${adminToken}; path=/; max-age=86400; SameSite=Lax; Secure=false`;
          console.log('✅ Admin token set by signIn function:', adminToken);
        }
        
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = useCallback(async () => {
    // Refresh user data from Google Sheets - this is the INSTANT version
    const storedUser = localStorage.getItem('talween_user');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        // Handle admin user
        if (userData.uid === 'admin') {
          const adminUser = {
            id: 'admin',
            email: 'admin@talween.com',
            displayName: 'مستخدم عادي',
            credits: 9999,
            status: 'premium',
            emailVerified: true,
            subscriptionTier: 'CREATIVE_TEACHER'
          };
          setUser(adminUser);
          setUserData(adminUser);
          setIsAdmin(true);
          return;
        }
        
        // Handle regular user - ALWAYS sync with Google Sheets for instant updates
        const canonicalId = userData.id || userData.uid;
        if (!canonicalId) {
          return;
        }
        
        console.log('🔄 INSTANT CREDIT REFRESH - Fetching from Google Sheets...');
        
        try {
          // Fetch fresh credits from Google Sheets
          const response = await fetch('/api/user/sync-credits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: canonicalId })
          });
          
          if (response.ok) {
            const serverData = await response.json();
            if (serverData.success && serverData.user) {
              console.log('✅ INSTANT UPDATE - Fresh credits from Google Sheets:', serverData.user.credits);
              
              // IMMEDIATELY update UI state
              const regularUser = {
                id: serverData.user.id,
                email: serverData.user.email,
                displayName: serverData.user.displayName,
                credits: serverData.user.credits, // LIVE from Google Sheets
                status: serverData.user.status,
                emailVerified: serverData.user.emailVerified,
                subscriptionTier: serverData.user.subscriptionTier
              };
              
              // Update localStorage with fresh data
              localStorage.setItem('talween_user', JSON.stringify({ ...regularUser, uid: regularUser.id }));
              localStorage.setItem('talween_user_data', JSON.stringify(regularUser));
              
              // Update state IMMEDIATELY
              setUser(regularUser);
              setUserData(regularUser);
              setIsAdmin(false);
              
              console.log('✅ UI updated instantly with new credits:', regularUser.credits);
              return;
            }
          }
          
          console.error('⚠️ Google Sheets sync failed, cannot update credits');
        } catch (error) {
          console.error('❌ Error syncing with Google Sheets:', error);
        }
        
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  }, []); // Empty dependency array - this function is stable

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      isAdmin, 
      logout, 
      loginAsAdmin, 
      signUp, 
      signIn, 
      refreshUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};