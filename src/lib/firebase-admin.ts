/**
 * IMPORTANT: This file should ONLY be used in server-side code (e.g., Server Actions, Genkit flows).
 */
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// Improved check for the service account key.
if (!serviceAccountKey || serviceAccountKey.startsWith('YOUR_SERVICE_ACCOUNT_KEY_HERE')) {
  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_KEY is not set correctly in your .env file. ' +
    'Please obtain your service account JSON from the Firebase console and set it as the value for this environment variable.'
  );
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountKey);
} catch (e) {
  throw new Error(
    'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. ' +
    'Please ensure it is a valid, un-escaped JSON string in your .env file.'
  );
}


let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "talween-studio.appspot.com",
  });
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp).bucket();
