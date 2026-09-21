import { NextResponse } from 'next/server';
import { generatePickupCode, calculateReservationFeeDetails } from '@/lib/utils';

export async function GET() {
  return NextResponse.json({ reservations: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const unitPriceRupees = Number(body.unitPrice) || 0;
    const quantity = Math.max(1, Number(body.quantity) || 1);
    const durationMinutes = body.durationMinutes === 120 ? 120 : 60;
    
    // Server-side fee calculation (Requirements 1, 2, 20)
    const feeDetails = calculateReservationFeeDetails(unitPriceRupees, quantity, durationMinutes);

    const now = new Date();
    const pickupExpiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

    const newReservation = {
      id: `res-${Date.now()}`,
      customerId: body.customerId,
      storeId: body.storeId,
      productId: body.productId,
      quantity,
      status: 'CONFIRMED',
      documentUrl: body.documentUrl || '',
      documentStatus: body.documentUrl ? 'PENDING' : 'NOT_REQUIRED',
      reservationStartAt: now.toISOString(),
      pickupExpiresAt,
      expiresAt: pickupExpiresAt,
      pickupCode: generatePickupCode(),
      createdAt: now.toISOString(),
      
      // Integer Paise Amounts
      productSubtotalPaise: feeDetails.productSubtotalPaise,
      reservationFeePaise: feeDetails.reservationFeePaise,
      reservationDurationMinutes: durationMinutes,
      extraReservationTimeFeePaise: feeDetails.extraReservationTimeFeePaise,
      amountPayableNowPaise: feeDetails.amountPayableNowPaise,
      amountPayableAtStorePaise: feeDetails.amountPayableAtStorePaise,

      paymentMethod: 'QR',
      paymentStatus: body.paymentReference ? 'PAYMENT_SUBMITTED' : 'PENDING',
      paymentReference: body.paymentReference || null,
    };
    return NextResponse.json({ reservation: newReservation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

