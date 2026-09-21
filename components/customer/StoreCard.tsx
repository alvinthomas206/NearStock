'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Store } from '@/lib/types';
import { formatDistanceKm } from '@/lib/utils';
import { MapPin, Phone, Star, Navigation, Heart } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useApp } from '@/lib/store';

interface StoreCardProps {
  store: Store;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const { savedStoreIds, toggleSaveStore } = useApp();
  const isSaved = savedStoreIds.includes(store.id);

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="p-4 hover:border-brand-teal/40 transition-all">
      <div className="flex gap-3">
        {/* Store Thumbnail */}
        <div className="relative w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
          {store.image ? (
            <Image src={store.image} alt={store.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Store
            </div>
          )}
        </div>

        {/* Store Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="font-bold text-slate-900 text-sm truncate">{store.name}</h4>
            <button
              type="button"
              onClick={() => toggleSaveStore(store.id)}
              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
              title={isSaved ? 'Remove from Saved' : 'Save Store'}
            >
              <Heart
                className={`w-4 h-4 ${
                  isSaved ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-slate-500 truncate mt-0.5">{store.formattedAddress}</p>

          <div className="flex items-center gap-3 mt-2 text-xs">
            <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{store.rating || 4.8}</span>
            </div>
            <span className="flex items-center gap-1 text-brand-teal font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              {formatDistanceKm(store.distanceKm)}
            </span>
            <Badge variant="teal" className="text-[10px] py-0">
              Open
            </Badge>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <a
          href={`tel:${store.phone}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-slate-500" />
          Call Store
        </a>

        <Button
          size="sm"
          variant="teal"
          onClick={openDirections}
          className="flex-1 gap-1.5 text-xs shadow-xs"
        >
          <Navigation className="w-3.5 h-3.5" />
          Directions
        </Button>
      </div>
    </Card>
  );
};
