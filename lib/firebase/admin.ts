import * as admin from 'firebase-admin';

export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY &&
    !process.env.FIREBASE_CLIENT_EMAIL.includes('demo')
);

if (!admin.apps.length) {
  try {
    if (isFirebaseAdminConfigured) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'nearstock-demo',
      });
    }
  } catch (error) {
    console.warn('Firebase Admin SDK initialization warning:', error);
  }
}

export const adminAuth = isFirebaseAdminConfigured ? admin.auth() : null;
export const adminDb = isFirebaseAdminConfigured ? admin.firestore() : null;
export const adminStorage = isFirebaseAdminConfigured ? admin.storage() : null;
export default admin;
