
/**
 * IMPORTANT: This file should ONLY be used in server-side code (e.g., Server Actions, Genkit flows).
 */
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

let adminApp: App | undefined;
let dbAdmin: Firestore | undefined;
let authAdmin: Auth | undefined;
let storageAdmin: Storage | undefined;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey && serviceAccountKey !== 'YOUR_SERVICE_ACCOUNT_KEY_HERE' && serviceAccountKey.trim() !== '') {
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    if (!getApps().length) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: 'talween-studio.appspot.com',
      });
    } else {
      adminApp = getApps()[0];
    }

    dbAdmin = getFirestore(adminApp);
    authAdmin = getAuth(adminApp);
    storageAdmin = getStorage(adminApp);
  } else {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_KEY is not set or is using the default placeholder. Firebase Admin SDK is not initialized. Server-side Firebase features will not work.'
    );
  }
} catch (e) {
  console.error(
    'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. ' +
      'Please ensure it is a valid, un-escaped JSON string in your .env file.',
    e
  );
  console.warn(
    'Firebase Admin SDK initialization failed. Server-side Firebase features will not work.'
  );
}

export { adminApp, dbAdmin, authAdmin, storageAdmin };
