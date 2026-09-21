'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  formatCurrency,
  formatDateTime,
  formatPaiseToRupees,
  getRemainingTimeDisplay,
} from '@/lib/utils';
import {
  ArrowLeft,
  QrCode,
  MapPin,
  Clock,
  Navigation,
  Phone,
  ShieldCheck,
  XCircle,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resId = params.id as string;

  const { reservations, cancelReservation, submitPayment } = useApp();
  const reservation = reservations.find((r) => r.id === resId);

  // Ticker for real-time timer (Requirement 3: Persistent, does NOT reset on refresh)
  const [timerState, setTimerState] = useState(() =>
    getRemainingTimeDisplay(reservation?.pickupExpiresAt || reservation?.expiresAt || '')
  );

  useEffect(() => {
    if (!reservation) return;
    const interval = setInterval(() => {
      setTimerState(
        getRemainingTimeDisplay(reservation.pickupExpiresAt || reservation.expiresAt || '')
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [reservation]);

  if (!reservation) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-slate-600">Reservation record not found.</p>
        <Link href="/reservations">
          <Button variant="teal" size="sm">
            View All Reservations
          </Button>
        </Link>
      </div>
    );
  }

  const productName = reservation.productName || reservation.product?.name || 'Item Reservation';
  const unitPrice = reservation.unitPrice ?? reservation.product?.price ?? 0;
  const totalPrice = reservation.totalPrice ?? (unitPrice * reservation.quantity);
  const storeName = reservation.storeName || reservation.store?.name || 'Local Pharmacy';
  const storeAddress = reservation.storeAddress || reservation.store?.formattedAddress || reservation.store?.address || '';

  const pickupDeadline = reservation.pickupExpiresAt || reservation.expiresAt;
  const isReservationExpired = timerState.isExpired || reservation.status === 'EXPIRED';

  const openDirections = () => {
    if (reservation.store) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${reservation.store.lat},${reservation.store.lng}`;
      window.open(url, '_blank');
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="teal">PAID & VERIFIED ✓</Badge>;
      case 'PAYMENT_SUBMITTED':
        return <Badge variant="warning">PAYMENT SUBMITTED (PENDING VERIFICATION)</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">PAYMENT REJECTED</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50">PAYMENT PENDING</Badge>;
    }
  };

  return (
    <div className="space-y-4 pb-12 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {getPaymentStatusBadge(reservation.paymentStatus || 'PENDING')}
          <Badge variant={isReservationExpired ? 'danger' : 'teal'}>
            {isReservationExpired ? 'EXPIRED' : reservation.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Digital Passcode Card & Timer (Requirement 3 & 23) */}
      <div className="bg-gradient-to-br from-brand-navy to-slate-800 text-white p-6 rounded-3xl text-center space-y-4 shadow-card relative overflow-hidden">
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
          Show Passcode at Store Counter
        </span>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 inline-block mx-auto min-w-[220px]">
          <QrCode className="w-12 h-12 text-brand-teal mx-auto mb-2" />
          <span className="text-3xl font-black tracking-widest text-white block font-mono">
            {reservation.pickupCode}
          </span>
          <span className="text-[10px] text-slate-300 block mt-1">Reservation ID: {reservation.id}</span>
        </div>

        {/* Dynamic Timer Display (Requirement 3: Reserved Until & Remaining Time) */}
        <div className="bg-black/20 p-3 rounded-2xl border border-white/10 space-y-1 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Reserved Until:</span>
            <span className="font-bold text-white">{formatDateTime(pickupDeadline)}</span>
          </div>
          <div className="flex justify-between text-amber-300 font-extrabold text-sm pt-1 border-t border-white/10">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-400" />
              Remaining Pickup Time:
            </span>
            <span className="font-mono text-base">{timerState.remainingText}</span>
          </div>
        </div>
      </div>

      {/* Item & Price Breakdown Card (Requirement 23) */}
      <Card className="p-5 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
          Reservation Details & Summary
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-extrabold text-slate-900 text-sm block">{productName}</span>
              {reservation.productBrand && (
                <span className="text-[10px] text-slate-400 block font-semibold">Brand: {reservation.productBrand}</span>
              )}
              <span className="text-slate-500">Unit Price: {formatCurrency(unitPrice)}</span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-slate-700 block">Quantity: {reservation.quantity}</span>
              <span className="font-black text-brand-navy text-sm block">Subtotal: {formatCurrency(totalPrice)}</span>
            </div>
          </div>

          {/* Detailed Fee Breakdown (Requirement 23) */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-slate-600 bg-slate-50 p-3 rounded-2xl">
            <div className="flex justify-between">
              <span>Product Total:</span>
              <span className="font-bold text-slate-800">{formatPaiseToRupees(reservation.productSubtotalPaise || totalPrice * 100)}</span>
            </div>
            <div className="flex justify-between">
              <span>Reservation Fee (1%):</span>
              <span className="font-bold text-slate-800">{formatPaiseToRupees(reservation.reservationFeePaise || Math.round(totalPrice * 1))}</span>
            </div>
            <div className="flex justify-between">
              <span>Reservation Duration:</span>
              <span className="font-bold text-slate-800">{reservation.reservationDurationMinutes || 60} Minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Extra Time Charge:</span>
              <span className="font-bold text-slate-800">{formatPaiseToRupees(reservation.extraReservationTimeFeePaise || 0)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-emerald-700 text-sm">
              <span>NearStock Fee Paid / Payable:</span>
              <span>{formatPaiseToRupees(reservation.amountPayableNowPaise || Math.round(totalPrice * 1))}</span>
            </div>
            <div className="flex justify-between font-black text-brand-navy text-sm">
              <span>Amount Due at Store:</span>
              <span>{formatPaiseToRupees(reservation.amountPayableAtStorePaise || totalPrice * 100)}</span>
            </div>
          </div>
        </div>

        {reservation.documentUrl && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Prescription Attached & Pending Store Review</span>
          </div>
        )}
      </Card>

      {/* Pickup Store Details */}
      <Card className="p-5 space-y-3">
        <h3 className="font-extrabold text-slate-900 text-base">Pickup Store</h3>

        <div>
          <h4 className="font-bold text-slate-900 text-sm">{storeName}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{storeAddress}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          {reservation.store?.phone ? (
            <a
              href={`tel:${reservation.store.phone}`}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              Call Store
            </a>
          ) : (
            <div className="flex items-center justify-center py-2 text-xs text-slate-400 bg-slate-50 rounded-xl">
              Phone N/A
            </div>
          )}

          <Button size="sm" variant="teal" onClick={openDirections} className="gap-1.5 text-xs">
            <Navigation className="w-3.5 h-3.5" />
            Directions
          </Button>
        </div>
      </Card>

      {/* QR Payment Status Banner / Quick Pay Action */}
      {reservation.paymentStatus === 'PENDING' && (
        <Card className="p-4 bg-amber-50 border-amber-300 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>NearStock Fee Payment Pending ({formatPaiseToRupees(reservation.amountPayableNowPaise || 0)})</span>
          </div>
          <Button
            size="sm"
            variant="teal"
            onClick={async () => {
              await submitPayment(reservation.id);
              alert('Payment reference submitted for verification!');
            }}
            className="w-full text-xs font-bold"
          >
            Mark QR Fee Paid
          </Button>
        </Card>
      )}

      {/* Cancel Reservation Option */}
      {(reservation.status === 'CONFIRMED' || reservation.status === 'PENDING') && !isReservationExpired && (
        <div className="pt-2">
          <Button
            variant="danger"
            size="md"
            onClick={async () => {
              await cancelReservation(reservation.id);
              router.push('/reservations');
            }}
            className="w-full gap-2 font-bold"
          >
            <XCircle className="w-4 h-4" />
            Cancel Reservation & Release Stock
          </Button>
        </div>
      )}
    </div>
  );
}
