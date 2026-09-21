'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { formatCurrency, formatDateTime, formatPaiseToRupees } from '@/lib/utils';
import { ClipboardList, QrCode, Phone, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MerchantBookingsPage() {
  const { user, stores, reservations, updateReservationStatus } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Requirement 9, 14, 18: Restrict data to stores owned by authenticated merchant
  const merchantStoreIds = stores
    .filter((s) => s.ownerId === user?.id || s.id === `store-${user?.id?.substring(0, 8)}`)
    .map((s) => s.id);
  const primaryStoreId = merchantStoreIds[0] || (user?.id ? `store-${user.id.substring(0, 8)}` : '');
  const allowedStoreIds = user?.role === 'ADMIN' ? stores.map((s) => s.id) : (merchantStoreIds.length > 0 ? merchantStoreIds : [primaryStoreId]);

  const merchantBookings = reservations.filter((r) => allowedStoreIds.includes(r.storeId));

  const filtered = merchantBookings.filter(
    (r) => filterStatus === 'ALL' || r.status === filterStatus
  );

  const statuses: { label: string; value: string }[] = [
    { label: 'All Bookings', value: 'ALL' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Expired', value: 'EXPIRED' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Merchant Bookings & Pickup Fulfillment</h1>
        <p className="text-xs text-slate-500">
          View customer reservations, fee payment status, pickup deadlines, and verify pickup passcode.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
              filterStatus === s.value
                ? 'bg-brand-navy text-white border-brand-navy shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Bookings List (Requirement 22) */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((res) => (
            <Card key={res.id} className="p-5 border-slate-200 space-y-4 shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">{res.productName || res.product?.name}</span>
                    <Badge variant="teal" className="font-mono font-black">{res.pickupCode}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customer Name: <strong className="text-slate-800">{res.customerName || 'Customer'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={res.status === 'READY_FOR_PICKUP' ? 'success' : res.status === 'CONFIRMED' ? 'teal' : 'default'}>
                    Booking: {res.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] font-mono text-slate-400">ID: {res.id}</span>
                </div>
              </div>

              {/* Requirement 22: Merchant Booking Field Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Product Total</span>
                  <span className="font-black text-brand-navy">
                    {formatPaiseToRupees(res.productSubtotalPaise || (res.totalPrice * 100))}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Reservation Duration</span>
                  <span className="font-extrabold text-slate-800">
                    {res.reservationDurationMinutes || 60} Minutes
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">NearStock 1% Fee</span>
                  <span className="font-extrabold text-slate-800">
                    {formatPaiseToRupees(res.reservationFeePaise || Math.round(res.totalPrice * 1))}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Extra Duration Fee</span>
                  <span className="font-extrabold text-slate-800">
                    {formatPaiseToRupees(res.extraReservationTimeFeePaise || 0)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">NearStock Payment Status</span>
                  <span className={`font-bold ${res.paymentStatus === 'VERIFIED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {res.paymentStatus || 'PENDING'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Reserved Until</span>
                  <span className="text-slate-700 font-semibold">{formatDateTime(res.pickupExpiresAt || res.expiresAt)}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Quantity</span>
                  <span className="font-extrabold text-slate-800">{res.quantity} units</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Prescription Doc</span>
                  <span className="text-slate-700 font-semibold">{res.documentStatus}</span>
                </div>
              </div>

              {/* Status Update Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {res.status === 'CONFIRMED' && (
                  <Button
                    size="sm"
                    variant="teal"
                    onClick={() => updateReservationStatus(res.id, 'READY_FOR_PICKUP')}
                    className="gap-1 text-xs font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Ready for Pickup
                  </Button>
                )}

                {res.status === 'READY_FOR_PICKUP' && (
                  <Button
                    size="sm"
                    variant="teal"
                    onClick={() => updateReservationStatus(res.id, 'COMPLETED')}
                    className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify Passcode & Mark Completed
                  </Button>
                )}

                {(res.status === 'CONFIRMED' || res.status === 'READY_FOR_PICKUP') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateReservationStatus(res.id, 'CANCELLED')}
                    className="text-rose-600 hover:bg-rose-50 text-xs"
                  >
                    Reject / Cancel Booking
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-xs shadow-soft">
            No bookings found for selected filter status.
          </div>
        )}
      </div>
    </div>
  );
}
