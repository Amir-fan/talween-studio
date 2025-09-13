
/**
 * IMPORTANT: This file should ONLY be used in server-side code (e.g., Server Actions, Genkit flows).
 */
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

let adminApp: App;
let dbAdmin: Firestore;
let authAdmin: Auth;
let storageAdmin: Storage;

function initializeAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey || serviceAccountKey === 'YOUR_SERVICE_ACCOUNT_KEY_HERE' || serviceAccountKey.trim() === '') {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK is not initialized.'
    );
    // Return a dummy object or throw an error if you want to enforce initialization
    return null;
  }
  
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    return initializeApp({
      credential: cert(serviceAccount),
      storageBucket: 'talween-studio.appspot.com',
    });
  } catch(e) {
    console.error(
      'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.', e
    );
     return null;
  }
}

const app = initializeAdminApp();

if (app) {
    adminApp = app;
    dbAdmin = getFirestore(adminApp);
    authAdmin = getAuth(adminApp);
    storageAdmin = getStorage(adminApp);
} else {
    // Handle the case where initialization failed.
    // For now, we are logging the warning.
}


export { adminApp, dbAdmin, authAdmin, storageAdmin };
