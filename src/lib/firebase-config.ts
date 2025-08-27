import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  projectId: "talween-studio",
  appId: "1:378767438301:web:5b5f6a66e78b4323668634",
  storageBucket: "talween-studio.appspot.com",
  apiKey: "AIzaSyB0TxPiCvTevv9k-mLdzocEIvRs9bo_loE",
  authDomain: "talween-studio.firebaseapp.com",
  messagingSenderId: "378767438301"
};

function initializeFirebaseApp(): FirebaseApp {
    if (getApps().length > 0) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

export const app = initializeFirebaseApp();
