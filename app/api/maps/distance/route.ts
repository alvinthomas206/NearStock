import { NextResponse } from 'next/server';
import { calculateDistance } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const originLat = Number(searchParams.get('originLat')) || 12.9716;
  const originLng = Number(searchParams.get('originLng')) || 77.5946;
  const destLat = Number(searchParams.get('destLat')) || 12.9752;
  const destLng = Number(searchParams.get('destLng')) || 77.5982;

  const distanceKm = calculateDistance(originLat, originLng, destLat, destLng);

  return NextResponse.json({
    origin: { lat: originLat, lng: originLng },
    destination: { lat: destLat, lng: destLng },
    distanceKm,
    durationText: `${Math.round(distanceKm * 4 + 2)} mins drive`,
  });
}
