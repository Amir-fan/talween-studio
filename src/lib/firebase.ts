'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "talween-studio",
  appId: "1:378767438301:web:5b5f6a66e78b4323668634",
  storageBucket: "talween-studio.firebasestorage.app",
  apiKey: "AIzaSyB0TxPiCvTevv9k-mLdzocEIvRs9bo_loE",
  authDomain: "talween-studio.firebaseapp.com",
  messagingSenderId: "378767438301"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
