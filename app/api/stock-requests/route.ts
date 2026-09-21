import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
  let requests: any[] = [];
  if (adminDb) {
    try {
      const snap = await adminDb.collection('stockRequests').orderBy('createdAt', 'desc').get();
      requests = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn('Error fetching stock requests API:', e);
    }
  }
  return NextResponse.json({ stockRequests: requests });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRequest = {
      id: `req-${Date.now()}`,
      customerId: body.customerId || 'customer-demo-1',
      productName: body.productName,
      quantity: body.quantity || 1,
      radiusKm: body.radiusKm || 5,
      status: 'OPEN',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ stockRequest: newRequest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
