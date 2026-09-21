import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const originLat = searchParams.get('originLat') || '12.9716';
  const originLng = searchParams.get('originLng') || '77.5946';
  const destLat = searchParams.get('destLat') || '12.9752';
  const destLng = searchParams.get('destLng') || '77.5982';

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;

  return NextResponse.json({
    directionsUrl,
    mode: 'DRIVING',
  });
}
