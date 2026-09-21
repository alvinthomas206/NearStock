import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { calculateDistance, parseCoordinatesFromGoogleMapsLink } from '@/lib/utils';
import { Product, Store } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').toLowerCase();
  const lat = Number(searchParams.get('lat')) || 12.9716;
  const lng = Number(searchParams.get('lng')) || 77.5946;
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'distance';

  let products: Product[] = [];
  let storesMap: Record<string, Store> = {};

  if (adminDb) {
    try {
      const prodSnap = await adminDb.collection('products').get();
      products = prodSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));

      const storeSnap = await adminDb.collection('stores').get();
      storeSnap.docs.forEach((doc) => {
        storesMap[doc.id] = { id: doc.id, ...doc.data() } as Store;
      });
    } catch (e) {
      console.warn('Error querying Firestore in search API:', e);
    }
  }

  let results = products.map((p) => {
    const store = storesMap[p.storeId];
    const parsedCoords = store?.googleMapsLink ? parseCoordinatesFromGoogleMapsLink(store.googleMapsLink) : null;
    const storeLat = parsedCoords?.lat || store?.lat || lat;
    const storeLng = parsedCoords?.lng || store?.lng || lng;
    const distanceKm = store ? calculateDistance(lat, lng, storeLat, storeLng) : 0;
    return { ...p, store, distanceKm };
  }).filter((p) => {
    const matchesQ = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchesCat = !category || p.category === category;
    return matchesQ && matchesCat;
  });

  if (sortBy === 'distance') {
    results.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (sortBy === 'price') {
    results.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'availability') {
    results.sort((a, b) => b.stock - a.stock);
  }

  return NextResponse.json({ products: results });
}

