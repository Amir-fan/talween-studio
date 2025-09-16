'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
        } 
        // Handle regular user - use id or uid
        else if (userData.id || userData.uid) {
          const regularUser = {
            id: userData.id || userData.uid, // Use id if available, otherwise uid
            email: userData.email,
            displayName: userData.displayName,
            credits: userData.credits || 50,
            status: userData.status || 'active',
            emailVerified: userData.emailVerified || false,
            subscriptionTier: userData.subscriptionTier || 'FREE'
          };
          console.log('🔍 RESTORING USER FROM LOCALSTORAGE:');
          console.log('  - userData:', userData);
          console.log('  - regularUser:', regularUser);
          setUser(regularUser);
          setUserData(regularUser);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('talween_user');
      }
    }
    setLoading(false);
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

  const loginAsAdmin = (email: string, password: string) => {
    // Use environment variables for admin credentials
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@talween.com';
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    
    // Also allow the old hardcoded credentials for backward compatibility
    const validCredentials = (
      (email === 'admin' && password === 'admin123') ||
      (email === adminEmail && password === adminPassword)
    );
    
    if (validCredentials) {
      const adminUser = {
        id: 'admin',
        email: adminEmail,
        displayName: 'مدير النظام',
        credits: 9999,
        status: 'premium',
        emailVerified: true,
        subscriptionTier: 'CREATIVE_TEACHER'
      };
      localStorage.setItem('talween_user', JSON.stringify({ uid: 'admin' }));
      setUser(adminUser);
      setUserData(adminUser);
      setIsAdmin(true);
      
      // Set admin token for middleware
      const adminToken = `admin_${Date.now()}`;
      document.cookie = `admin_token=${adminToken}; path=/; max-age=86400; SameSite=Lax`; // 24 hours
      
      console.log('✅ Admin login successful');
      console.log('🔍 Admin token set:', adminToken);
      console.log('🔍 Current cookies:', document.cookie);
      return true;
    }
    
    console.log('❌ Invalid admin credentials');
    return false;
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
        localStorage.setItem('talween_user', JSON.stringify(userForStorage));
        setUser(userWithId);
        setUserData(userWithId);
        setIsAdmin(userWithId.id === 'admin');
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

  const refreshUserData = async () => {
    // Refresh user data from localStorage
    const storedUser = localStorage.getItem('talween_user');
    const storedUserData = localStorage.getItem('talween_user_data');
    
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
        } else {
          // Handle regular user - sync with server for latest credits
          const canonicalId = userData.id || userData.uid;
          if (!canonicalId) {
            return;
          }
          try {
            // Try to sync with server first
            const response = await fetch('/api/user/sync-credits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: canonicalId })
            });
            
            if (response.ok) {
              const serverData = await response.json();
              if (serverData.success) {
                console.log('✅ Synced credits from server:', serverData.user.credits);
                
                // Update localStorage with server data
                const updatedUserData = {
                  uid: canonicalId,
                  email: serverData.user.email,
                  displayName: serverData.user.displayName,
                  credits: serverData.user.credits,
                  status: serverData.user.status,
                  emailVerified: serverData.user.emailVerified,
                  subscriptionTier: serverData.user.subscriptionTier
                };
                localStorage.setItem('talween_user_data', JSON.stringify(updatedUserData));
                
                const regularUser = {
                  id: serverData.user.id, // Use server's user ID (matches database)
                  email: serverData.user.email,
                  displayName: serverData.user.displayName,
                  credits: serverData.user.credits,
                  status: serverData.user.status,
                  emailVerified: serverData.user.emailVerified,
                  subscriptionTier: serverData.user.subscriptionTier
                };
                setUser(regularUser);
                setUserData(regularUser);
                setIsAdmin(false);
                return;
              }
            }
          } catch (error) {
            console.error('Error syncing with server:', error);
          }

          // Ensure dashboard consistency even when only local changed
          try {
            if (storedUserData) {
              const cached = JSON.parse(storedUserData);
              const delta = (userData.credits ?? 0) - (cached.credits ?? 0);
              if (delta < 0) {
                await fetch('/api/user/deduct-credits', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: canonicalId, amount: Math.abs(delta) })
                });
              }
            }
          } catch {}
          
          // Use credits from the main user data (which should be updated)
          let credits = userData.credits || 50;
          
          console.log('🔍 REFRESH USER DATA:');
          console.log('  - userData.credits:', userData.credits);
          console.log('  - Final credits:', credits);
          
          const regularUser = {
            id: canonicalId, // Prefer canonical ID
            email: userData.email,
            displayName: userData.displayName,
            credits: credits,
            status: userData.status || 'active',
            emailVerified: userData.emailVerified || false,
            subscriptionTier: userData.subscriptionTier || 'FREE'
          };
          setUser(regularUser);
          setUserData(regularUser);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

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