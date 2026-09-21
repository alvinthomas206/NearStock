'use client';

import React from 'react';
import Link from 'next/link';
import { Reservation } from '@/lib/types';
import { formatCurrency, formatRelativeTime, isExpired } from '@/lib/utils';
import { ShoppingBag, Clock, Navigation, QrCode, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useApp } from '@/lib/store';

interface ReservationCardProps {
  reservation: Reservation;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation }) => {
  const { cancelReservation } = useApp();

  const productName = reservation.productName || reservation.product?.name || 'Item Reservation';
  const unitPrice = reservation.unitPrice ?? reservation.product?.price ?? 0;
  const totalPrice = reservation.totalPrice ?? (unitPrice * reservation.quantity);
  const storeName = reservation.storeName || reservation.store?.name || 'Local Pharmacy';

  const pickupExpiryDeadline = reservation.pickupExpiresAt || reservation.expiresAt;
  const expired = isExpired(pickupExpiryDeadline);

  const statusVariants: Record<Reservation['status'], 'teal' | 'warning' | 'success' | 'danger' | 'default'> = {
    PENDING: 'warning',
    CONFIRMED: 'teal',
    READY_FOR_PICKUP: 'success',
    COMPLETED: 'default',
    CANCELLED: 'danger',
    EXPIRED: 'danger',
  };

  const openDirections = () => {
    if (reservation.store) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${reservation.store.lat},${reservation.store.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="p-4 border-l-4 border-l-brand-teal hover:border-brand-teal transition-all">
      <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Booking ID: {reservation.id}
          </span>
          <h4 className="font-extrabold text-slate-900 text-base">{productName}</h4>
          {reservation.productBrand && (
            <span className="text-[10px] text-slate-400 font-semibold block">Brand: {reservation.productBrand}</span>
          )}
          <p className="text-xs text-slate-600 font-bold mt-1">
            Qty: {reservation.quantity} × {formatCurrency(unitPrice)} = <span className="text-brand-navy font-black">{formatCurrency(totalPrice)}</span>
          </p>
        </div>

        <Badge variant={expired && (reservation.status === 'CONFIRMED' || reservation.status === 'READY_FOR_PICKUP') ? 'danger' : statusVariants[reservation.status]}>
          {expired && (reservation.status === 'CONFIRMED' || reservation.status === 'READY_FOR_PICKUP') ? 'EXPIRED' : reservation.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Store details & Pickup code */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl mb-3 border border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Pickup Store</span>
          <span className="text-xs font-bold text-slate-800 truncate block">
            {storeName}
          </span>
          <span className="text-[10px] text-slate-500 truncate block">{reservation.storeAddress || reservation.store?.formattedAddress}</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Pickup Pass Code</span>
          <span className="text-sm font-black text-brand-teal tracking-widest flex items-center justify-end gap-1">
            <QrCode className="w-3.5 h-3.5" />
            {reservation.pickupCode}
          </span>
        </div>
      </div>

      {/* Distinct Deadline Timers (NS-05) */}
      {reservation.status === 'PENDING' && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mb-3 border border-amber-200">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Awaiting merchant confirmation (30-min confirmation window).</span>
        </div>
      )}

      {(reservation.status === 'CONFIRMED' || reservation.status === 'READY_FOR_PICKUP') && !expired && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg mb-3 border border-emerald-200">
          <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pickup Deadline Active: 120-min store pickup window open.</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Link href={`/reservations/${reservation.id}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full text-xs">
            View Details
          </Button>
        </Link>

        {reservation.store && (
          <Button size="sm" variant="teal" onClick={openDirections} className="gap-1 text-xs">
            <Navigation className="w-3.5 h-3.5" />
            Directions
          </Button>
        )}

        {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && !expired && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => cancelReservation(reservation.id)}
            className="text-rose-600 hover:bg-rose-50 p-2"
            title="Cancel Reservation"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};
