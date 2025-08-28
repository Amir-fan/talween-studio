'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { deleteCookie, setCookie } from '@/lib/cookies';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserData {
  uid: string;
  email: string;
  name: string;
  credits: number;
  status: string;
  // Add other user profile fields here
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const token = await user.getIdToken();
        setCookie('auth-token', token);

        // Listen for user data changes
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            // This case might happen if the Firestore doc isn't created yet
            // or was deleted.
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error listening to user document:", error);
            setUserData(null);
            setLoading(false);
        });

        return () => unsubscribeFirestore();
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        deleteCookie('auth-token');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    await signOut(auth);
    router.push('/'); // Redirect to home page after logout
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, userData, loading, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
