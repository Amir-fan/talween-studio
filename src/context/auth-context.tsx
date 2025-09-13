'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getLocalUser, 
  getLocalUserData, 
  clearLocalUser, 
  signInLocalUser, 
  createLocalUser,
  updateLocalUserCredits,
  deductLocalUserCredits,
  type LocalUser,
  type LocalUserData 
} from '@/lib/local-auth';

interface AuthContextType {
  user: LocalUser | null;
  userData: LocalUserData | null;
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
  const [user, setUser] = useState<LocalUser | null>(null);
  const [userData, setUserData] = useState<LocalUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return;
    }

    // Load user from localStorage on mount
    const savedUser = getLocalUser();
    const savedUserData = getLocalUserData();
    
    if (savedUser && savedUserData) {
      setUser(savedUser);
      setUserData(savedUserData);
      setIsAdmin(savedUser.uid === 'admin');
    }
  }, []);

  const logout = () => {
    clearLocalUser();
    setUser(null);
    setUserData(null);
    setIsAdmin(false);
    router.push('/');
  };

  const loginAsAdmin = (email: string, password: string) => {
    const result = signInLocalUser(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      setUserData(getLocalUserData());
      setIsAdmin(result.user.uid === 'admin');
      return true;
    }
    return false;
  };

  const signUp = (email: string, password: string, displayName?: string) => {
    const result = createLocalUser(email, password, displayName);
    if (result.success && result.user) {
      setUser(result.user);
      setUserData(getLocalUserData());
      setIsAdmin(false);
    }
    return result;
  };

  const signIn = (email: string, password: string) => {
    const result = signInLocalUser(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      setUserData(getLocalUserData());
      setIsAdmin(result.user.uid === 'admin');
    }
    return result;
  };

  // Function to refresh user data (useful when credits are updated)
  const refreshUserData = () => {
    setUserData(getLocalUserData());
  };

  // Function to update credits (for use in other components)
  const updateCredits = (amount: number) => {
    if (user) {
      updateLocalUserCredits(user.uid, amount);
      setUserData(getLocalUserData());
    }
  };

  // Function to deduct credits (for use in other components)
  const deductCredits = (amount: number) => {
    if (user) {
      const result = deductLocalUserCredits(user.uid, amount);
      if (result.success) {
        setUserData(getLocalUserData());
      }
      return result;
    }
    return { success: false, error: 'User not logged in' };
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