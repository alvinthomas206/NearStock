import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { calculateDistance, parseCoordinatesFromGoogleMapsLink } from '@/lib/utils';
import { Store } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat')) || 12.9716;
  const lng = Number(searchParams.get('lng')) || 77.5946;
  const radius = Number(searchParams.get('radius')) || 5;

  let stores: Store[] = [];

  if (adminDb) {
    try {
      const snap = await adminDb.collection('stores').get();
      stores = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Store));
    } catch (e) {
      console.warn('Error querying stores in API:', e);
    }
  }

  const storesWithDist = stores.map((s) => {
    const parsedCoords = s.googleMapsLink ? parseCoordinatesFromGoogleMapsLink(s.googleMapsLink) : null;
    const targetLat = parsedCoords?.lat || s.lat;
    const targetLng = parsedCoords?.lng || s.lng;
    return {
      ...s,
      lat: targetLat,
      lng: targetLng,
      distanceKm: calculateDistance(lat, lng, targetLat, targetLng),
    };
  }).filter((s) => s.distanceKm <= radius && (s.status === 'APPROVED' || !s.status));

  return NextResponse.json({ stores: storesWithDist });
}

