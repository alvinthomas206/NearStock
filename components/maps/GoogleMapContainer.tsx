'use client';

import React, { useState } from 'react';
import { Store } from '@/lib/types';
import { MapPin, Navigation, Phone, ExternalLink } from 'lucide-react';
import { formatDistanceKm } from '@/lib/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface MapProps {
  userLocation: { lat: number; lng: number };
  radiusKm: number;
  stores: Store[];
  selectedStoreId?: string;
  onSelectStore?: (store: Store) => void;
  className?: string;
}

export const GoogleMapContainer: React.FC<MapProps> = ({
  userLocation,
  radiusKm,
  stores,
  selectedStoreId,
  onSelectStore,
  className = 'h-[360px] w-full rounded-2xl overflow-hidden relative border border-slate-200 shadow-inner',
}) => {
  const [activeStore, setActiveStore] = useState<Store | null>(
    stores.find((s) => s.id === selectedStoreId) || null
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isRealApiKey = apiKey && !apiKey.includes('DemoKey');

  const openDirections = (store: Store) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className={className}>
      {isRealApiKey ? (
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=pharmacy+near+${userLocation.lat},${userLocation.lng}&zoom=14`}
        />
      ) : (
        /* Dynamic SVG Interactive Map Visualizer */
        <div className="relative w-full h-full bg-slate-900 bg-[radial-gradient(#1f9d8c_1px,transparent_1px)] [background-size:16px_16px] flex flex-col justify-between p-4 overflow-hidden">
          {/* Subtle Grid / Radar Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Radius Circle */}
            <div
              className="rounded-full border-2 border-brand-teal/40 bg-brand-teal/10 animate-pulse flex items-center justify-center"
              style={{
                width: `${Math.min(280, radiusKm * 45)}px`,
                height: `${Math.min(280, radiusKm * 45)}px`,
              }}
            >
              <span className="text-[10px] font-bold text-brand-teal bg-slate-900/80 px-2 py-0.5 rounded-full border border-brand-teal/30">
                {radiusKm} km radius
              </span>
            </div>
          </div>

          {/* User Location Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping" />
              <div className="w-5 h-5 bg-blue-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-white bg-slate-900/90 px-2 py-0.5 rounded-md mt-1 shadow-md border border-slate-700">
              You (Current Location)
            </span>
          </div>

          {/* Render Store Pins */}
          {stores.map((store, idx) => {
            // Calculate mock relative positions around center
            const offsets = [
              { x: -70, y: -60 },
              { x: 90, y: -30 },
              { x: -40, y: 70 },
            ];
            const pos = offsets[idx % offsets.length] || { x: 50, y: 50 };
            const isSelected = activeStore?.id === store.id;

            return (
              <button
                key={store.id}
                onClick={() => {
                  setActiveStore(store);
                  if (onSelectStore) onSelectStore(store);
                }}
                className="absolute z-30 transition-transform hover:scale-110 focus:outline-none"
                style={{
                  top: `calc(50% + ${pos.y}px)`,
                  left: `calc(50% + ${pos.x}px)`,
                }}
              >
                <div className="flex flex-col items-center group">
                  <div
                    className={`p-2 rounded-full shadow-lg transition-all border-2 ${
                      isSelected
                        ? 'bg-brand-teal text-white border-white scale-125 ring-4 ring-brand-teal/30'
                        : 'bg-white text-brand-navy border-brand-teal hover:bg-brand-tealLight'
                    }`}
                  >
                    <MapPin className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-[10px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700 shadow-md mt-0.5 max-w-[100px] truncate">
                    {store.name}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Top Bar Overlay */}
          <div className="relative z-30 flex items-center justify-between">
            <Badge variant="teal" className="shadow-md bg-slate-900/90 text-brand-teal border border-brand-teal/30">
              Interactive Google Maps View
            </Badge>
            <span className="text-[11px] text-slate-300 bg-slate-900/80 px-2 py-1 rounded-lg">
              {stores.length} Nearby Stores
            </span>
          </div>
        </div>
      )}

      {/* Selected Store Card Modal overlay */}
      {activeStore && (
        <div className="absolute bottom-3 left-3 right-3 z-40">
          <Card className="p-3 shadow-card bg-white/95 backdrop-blur-md border-brand-teal/30">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{activeStore.name}</h4>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                  {activeStore.formattedAddress}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="teal">{formatDistanceKm(activeStore.distanceKm)}</Badge>
                  <span className="text-[11px] text-emerald-600 font-semibold">● Open Now</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="teal"
                onClick={() => openDirections(activeStore)}
                className="gap-1 shadow-sm shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                Directions
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
