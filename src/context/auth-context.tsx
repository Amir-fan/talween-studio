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
        // Handle regular user
        else if (userData.id) {
          setUser(userData);
          setUserData(userData);
          setIsAdmin(userData.id === 'admin');
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
        // Store user in localStorage for persistence
        localStorage.setItem('talween_user', JSON.stringify(data.user));
        setUser(data.user);
        setUserData(data.user);
        setIsAdmin(data.user.id === 'admin');
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const refreshUserData = () => {
    // Refresh user data from server
    if (user) {
      // Update localStorage with current user data
      localStorage.setItem('talween_user', JSON.stringify(user));
      setUserData(user);
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