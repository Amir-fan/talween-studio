'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';

interface LibraryItem {
  id: string;
  type: 'story' | 'text-to-coloring' | 'image-to-coloring';
  title: string;
  description: string;
  imageDataUri: string;
  createdAt: number;
  userId: string;
  // For stories
  pages?: Array<{
    text: string;
    imageDataUri: string;
  }>;
  // For coloring pages
  originalImageDataUri?: string;
  // Metadata
  childName?: string;
  ageGroup?: string;
  setting?: string;
  lesson?: string;
  difficulty?: string;
}

interface LibraryContextType {
  libraryItems: LibraryItem[];
  addToLibrary: (item: Omit<LibraryItem, 'id' | 'createdAt' | 'userId'>) => void;
  removeFromLibrary: (itemId: string) => void;
  isInLibrary: (itemId: string) => boolean;
  loading: boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load library items from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const storedLibrary = localStorage.getItem(`talween_library_${user.id}`);
      if (storedLibrary) {
        try {
          const items = JSON.parse(storedLibrary);
          setLibraryItems(items);
        } catch (error) {
          console.error('Error loading library:', error);
        }
      }
      setLoading(false);
    }
  }, [user]);

  // Save library items to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && user && libraryItems.length >= 0) {
      localStorage.setItem(`talween_library_${user.id}`, JSON.stringify(libraryItems));
    }
  }, [libraryItems, user]);

  const addToLibrary = (item: Omit<LibraryItem, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;

    const newItem: LibraryItem = {
      ...item,
      id: `${item.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      userId: user.id,
    };

    setLibraryItems(prev => {
      // Check if item already exists (by type and title)
      const exists = prev.some(existing => 
        existing.type === newItem.type && 
        existing.title === newItem.title &&
        existing.userId === user.id
      );
      
      if (exists) {
        console.log('Item already in library');
        return prev;
      }
      
      return [...prev, newItem];
    });
  };

  const removeFromLibrary = (itemId: string) => {
    setLibraryItems(prev => prev.filter(item => item.id !== itemId));
  };

  const isInLibrary = (itemId: string) => {
    return libraryItems.some(item => item.id === itemId);
  };

  return (
    <LibraryContext.Provider value={{
      libraryItems,
      addToLibrary,
      removeFromLibrary,
      isInLibrary,
      loading
    }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
