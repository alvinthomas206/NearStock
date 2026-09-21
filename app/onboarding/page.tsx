'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { LocationAutocomplete } from '@/components/maps/LocationAutocomplete';
import { MapPin, Navigation, Sliders, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { LocationCoordinates } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { userLocation, updateLocation, searchRadius, updateSearchRadius } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates>(userLocation);
  const [radius, setRadius] = useState<number>(searchRadius || 5);

  const handleSave = () => {
    updateLocation(selectedLocation);
    updateSearchRadius(radius);
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-[750px] justify-between p-4 py-6">
      <div>
        <div className="mb-6">
          <Logo size="md" showTagline />
        </div>

        <div className="space-y-1 mb-6">
          <h2 className="text-2xl font-black text-brand-navy">Set Pickup Location</h2>
          <p className="text-xs text-slate-500">
            NearStock calculates real-time pharmacy distances and stock availability based on your location.
          </p>
        </div>

        {/* Location Selector */}
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase">
              <MapPin className="w-4 h-4 text-brand-teal" />
              <span>Search Locality or Address</span>
            </label>

            <LocationAutocomplete
              defaultValue={selectedLocation.formattedAddress}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
            />

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 flex items-start gap-2">
              <Navigation className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Selected Address:</span>
                <span className="text-slate-600 leading-tight block mt-0.5">
                  {selectedLocation.formattedAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Search Radius Options (Requirement 7: Max 100 KM) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase">
                <Sliders className="w-4 h-4 text-brand-teal" />
                <span>Search Radius (Max 100 KM)</span>
              </label>
              <span className="text-sm font-black text-brand-teal bg-brand-tealLight px-2.5 py-0.5 rounded-full">
                {radius} km
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
              {[1, 2, 5, 10, 25, 50, 75, 100].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    radius === r
                      ? 'bg-brand-teal text-white border-brand-teal shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}k
                </button>
              ))}
            </div>

            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={radius}
              onChange={(e) => setRadius(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-teal mt-2"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
              <span>100 km (Max)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <Button
          variant="teal"
          size="lg"
          onClick={handleSave}
          className="w-full gap-2 shadow-lg"
        >
          <span>Confirm Location & Start Searching</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
