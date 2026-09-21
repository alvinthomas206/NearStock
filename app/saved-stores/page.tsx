'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { StoreCard } from '@/components/customer/StoreCard';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SavedStoresPage() {
  const { stores, savedStoreIds } = useApp();
  const savedStores = stores.filter((s) => savedStoreIds.includes(s.id));

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          Saved Pharmacies
        </h1>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
      </div>

      {/* List */}
      {savedStores.length > 0 ? (
        <div className="space-y-3">
          {savedStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No saved pharmacies</h3>
          <p className="text-xs text-slate-500">
            Tap the heart icon on any store card to save your favorite local pharmacies for fast access.
          </p>
        </div>
      )}
    </div>
  );
}
