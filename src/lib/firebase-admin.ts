/**
 * IMPORTANT: This file should ONLY be used in server-side code (e.g., Server Actions, Genkit flows).
 */
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Bucket } from 'firebase-admin/storage';

let adminApp: App | undefined;
let dbAdmin: Firestore | undefined;
let authAdmin: Auth | undefined;
let bucketAdmin: Bucket | undefined;

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountKey) {
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    if (!getApps().length) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: "talween-studio.appspot.com",
      });
    } else {
      adminApp = getApps()[0];
    }

    if (adminApp) {
        dbAdmin = getFirestore(adminApp);
        authAdmin = getAuth(adminApp);
        bucketAdmin = getStorage(adminApp).bucket();
    }

  } catch (e) {
    console.error(
      'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. ' +
      'Please ensure it is a valid, un-escaped JSON string in your .env file.',
      e
    );
  }
} else {
    console.warn(
        'FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK will not be initialized. Server-side Firebase features will not work.'
    );
}

// Throw an error if they are used without being initialized.
const
  err =
    'Firebase Admin SDK not initialized. Please set FIREBASE_SERVICE_ACCOUNT_KEY in your .env file.';
const proxyHandler = {
    get: (target: any, prop: any) => {
        throw new Error(err);
    }
};

export { adminApp };
export const dbAdmin: Firestore = dbAdmin || new Proxy({}, proxyHandler);
export const authAdmin: Auth = authAdmin || new Proxy({}, proxyHandler);
export const bucketAdmin: Bucket = bucketAdmin || new Proxy({}, proxyHandler);
