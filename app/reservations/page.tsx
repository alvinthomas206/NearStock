'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ReservationCard } from '@/components/customer/ReservationCard';
import { ShoppingBag, ArrowLeft, CheckCircle2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReservationsListPage() {
  const { user, reservations } = useApp();
  const [tab, setTab] = useState<'active' | 'past'>('active');

  if (!user) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-soft my-6">
        <div className="p-4 bg-brand-tealLight text-brand-teal rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Sign In to View Reservations</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Please sign in to access your active store reservations, pickup passcodes, and pickup deadlines.
        </p>
        <div className="pt-2 flex justify-center">
          <Link href="/">
            <Button variant="teal" size="md">
              Sign In / Register
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeReservations = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'READY_FOR_PICKUP' || r.status === 'PENDING'
  );

  const pastReservations = reservations.filter(
    (r) => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'EXPIRED'
  );

  const displayedList = tab === 'active' ? activeReservations : pastReservations;

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-brand-teal" />
          My Reservations
        </h1>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Home
          </Button>
        </Link>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
        <button
          onClick={() => setTab('active')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            tab === 'active' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-500'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Active ({activeReservations.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            tab === 'past' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-500'
          }`}
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          History ({pastReservations.length})
        </button>
      </div>

      {/* Reservations List */}
      {displayedList.length > 0 ? (
        <div className="space-y-3">
          {displayedList.map((res) => (
            <ReservationCard key={res.id} reservation={res} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3 shadow-soft">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No {tab} reservations</h3>
          <p className="text-xs text-slate-500">
            {tab === 'active'
              ? 'Find nearby items and reserve them for 30-minute instant hold.'
              : 'You have no past completed or cancelled reservations.'}
          </p>
          <Link href="/search" className="block pt-2">
            <Button variant="teal" size="sm" className="mx-auto">
              Find Items Nearby
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
