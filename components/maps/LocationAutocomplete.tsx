'use client';

import React, { useState } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LocationCoordinates } from '@/lib/types';
import { DEFAULT_LOCATION } from '@/lib/mock-data';

interface LocationAutocompleteProps {
  onSelectLocation: (coords: LocationCoordinates) => void;
  defaultValue?: string;
  placeholder?: string;
}

const PRESET_LOCATIONS: LocationCoordinates[] = [
  {
    lat: 12.9716,
    lng: 77.5946,
    formattedAddress: 'MG Road Metro Station, Central City, Bengaluru 560001',
  },
  {
    lat: 12.9352,
    lng: 77.6245,
    formattedAddress: 'Koramangala 5th Block, 80 Feet Road, Bengaluru 560095',
  },
  {
    lat: 12.9784,
    lng: 77.6408,
    formattedAddress: 'Indiranagar 100 Feet Road, Bengaluru 560038',
  },
  {
    lat: 19.076,
    lng: 72.8777,
    formattedAddress: 'Bandra West, Hill Road, Mumbai 400050',
  },
  {
    lat: 28.6139,
    lng: 77.209,
    formattedAddress: 'Connaught Place, New Delhi 110001',
  },
];

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onSelectLocation,
  defaultValue = '',
  placeholder = 'Enter city, locality or pin code...',
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<LocationCoordinates[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 1) {
      const filtered = PRESET_LOCATIONS.filter((loc) =>
        loc.formattedAddress.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.length ? filtered : PRESET_LOCATIONS);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (loc: LocationCoordinates) => {
    setQuery(loc.formattedAddress);
    onSelectLocation(loc);
    setIsOpen(false);
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            formattedAddress: 'Current Live GPS Location',
          };
          setQuery(coords.formattedAddress);
          onSelectLocation(coords);
          setIsLocating(false);
        },
        () => {
          // Fallback if denied or unavailable
          onSelectLocation(DEFAULT_LOCATION);
          setQuery(DEFAULT_LOCATION.formattedAddress);
          setIsLocating(false);
        }
      );
    } else {
      onSelectLocation(DEFAULT_LOCATION);
      setQuery(DEFAULT_LOCATION.formattedAddress);
      setIsLocating(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <Input
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          icon={<Search className="w-4 h-4 text-brand-teal" />}
          onFocus={() => {
            setSuggestions(PRESET_LOCATIONS);
            setIsOpen(true);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={getCurrentLocation}
          isLoading={isLocating}
          title="Use Current GPS Location"
          className="shrink-0 border-brand-teal/30 text-brand-teal hover:bg-brand-tealLight"
        >
          <Navigation className="w-4 h-4" />
          <span className="hidden sm:inline">GPS</span>
        </Button>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-12 z-50 bg-white rounded-2xl border border-slate-200 shadow-card py-2 max-h-60 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Suggested Locations (Google Places API)
          </div>
          {suggestions.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-brand-tealLight/50 flex items-center gap-2.5 transition-colors border-b border-slate-50 last:border-0"
            >
              <MapPin className="w-4 h-4 text-brand-teal shrink-0" />
              <span className="text-xs font-medium text-slate-800 truncate">
                {loc.formattedAddress}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
