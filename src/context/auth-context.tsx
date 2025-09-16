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
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return;
    }

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
        // Handle regular user - convert uid to id
        else if (userData.uid) {
          const regularUser = {
            id: userData.uid, // Use uid as id
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
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('talween_user');
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('talween_user');
    setUser(null);
    setUserData(null);
    setIsAdmin(false);
    router.push('/');
  };

  const loginAsAdmin = (email: string, password: string) => {
    if (email === 'admin' && password === 'admin123') {
      const adminUser = {
        id: 'admin',
        email: 'admin@talween.com',
        displayName: 'مستخدم عادي',
        credits: 9999,
        status: 'premium',
        emailVerified: true,
        subscriptionTier: 'CREATIVE_TEACHER'
      };
      localStorage.setItem('talween_user', JSON.stringify({ uid: 'admin' }));
      setUser(adminUser);
      setUserData(adminUser);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      });

      const data = await response.json();

      if (data.success) {
        // Don't auto-login after registration, user needs to verify email
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Convert uid to id for consistency
        const userWithId = {
          ...data.user,
          id: data.user.uid || data.user.id // Use uid as id if available
        };
        
        // Store user in localStorage for persistence
        localStorage.setItem('talween_user', JSON.stringify(data.user));
        setUser(userWithId);
        setUserData(userWithId);
        setIsAdmin(userWithId.id === 'admin');
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const refreshUserData = () => {
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
        } 
        // Handle regular user - convert uid to id and get latest credits
        else if (userData.uid) {
          let credits = userData.credits || 50;
          
          // Get latest credits from user_data if available
          if (storedUserData) {
            try {
              const userDataFromStorage = JSON.parse(storedUserData);
              if (userDataFromStorage.uid === userData.uid) {
                credits = userDataFromStorage.credits || credits;
              }
            } catch (error) {
              console.error('Error parsing user_data:', error);
            }
          }
          
          const regularUser = {
            id: userData.uid, // Use uid as id
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