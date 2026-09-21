import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (adminDb) {
    try {
      const prodDoc = await adminDb.collection('products').doc(params.id).get();
      if (prodDoc.exists) {
        const product = { id: prodDoc.id, ...prodDoc.data() } as any;
        const storeDoc = await adminDb.collection('stores').doc(product.storeId).get();
        const store = storeDoc.exists ? { id: storeDoc.id, ...storeDoc.data() } : null;
        return NextResponse.json({ product: { ...product, store } });
      }
    } catch (e) {
      console.warn('Error fetching product detail API:', e);
    }
  }

  return NextResponse.json({ error: 'Product not found' }, { status: 404 });
}

