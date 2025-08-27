/**
 * IMPORTANT: This file should ONLY be used in server-side code (e.g., Server Actions, Genkit flows).
 */
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

let adminApp: App;

if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env file.');
  }
   if (serviceAccountKey === 'YOUR_SERVICE_ACCOUNT_KEY_HERE') {
    throw new Error(
      'Using default placeholder for FIREBASE_SERVICE_ACCOUNT_KEY. Please set your actual service account key in the .env file.'
    );
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: 'talween-studio.appspot.com',
    });
  } catch (e) {
    console.error(
      'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. ' +
        'Please ensure it is a valid, un-escaped JSON string in your .env file.',
      e
    );
    throw new Error('Firebase Admin SDK initialization failed.');
  }
} else {
  adminApp = getApps()[0];
}

const dbAdmin: Firestore = getFirestore(adminApp);
const authAdmin: Auth = getAuth(adminApp);
const storageAdmin: Storage = getStorage(adminApp);

export { adminApp, dbAdmin, authAdmin, storageAdmin };
