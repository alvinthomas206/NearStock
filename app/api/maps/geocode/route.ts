import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') || '';

  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (apiKey && !apiKey.includes('DemoKey')) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      const data = await res.json();
      return NextResponse.json(data);
    } catch (e: any) {
      console.warn('Google Maps Geocoding API fallback:', e);
    }
  }

  return NextResponse.json({
    status: 'OK',
    results: [
      {
        formatted_address: address || 'MG Road Metro Station, Central City, Bengaluru 560001',
        geometry: {
          location: { lat: 12.9716, lng: 77.5946 },
        },
        place_id: 'ChIJgUb9-kWwrjsRgySymo16Z1g',
      },
    ],
  });
}
