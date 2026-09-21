import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  INITIAL_STORES,
  INITIAL_PRODUCTS,
} from '../lib/mock-data';

// Initialize Firebase Admin
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'nearstock-demo',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'demo@nearstock-demo.iam.gserviceaccount.com',
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  } catch (e) {
    console.warn('Firebase Admin fallback init for seed script:', e);
  }
}

async function seedDatabase() {
  console.log('🚀 Starting NearStock Store & Product Catalog Seeding...');

  try {
    const db = getFirestore();

    // 1. Seed 3 Pharmacies
    console.log('🏬 Seeding Pharmacies...');
    for (const store of INITIAL_STORES) {
      await db.collection('stores').doc(store.id).set(store, { merge: true });
      console.log(` - ${store.name} (${store.formattedAddress})`);
    }

    // 2. Seed Pharmacy Products
    console.log('💊 Seeding Product Inventory...');
    for (const product of INITIAL_PRODUCTS) {
      await db.collection('products').doc(product.id).set(product, { merge: true });
      console.log(` - ${product.name} (Price: ₹${product.price}, Stock: ${product.stock})`);
    }

    console.log('✅ NearStock Catalog Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Error Seeding Database:', error);
  }
}

seedDatabase();
