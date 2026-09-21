'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ProductCard } from '@/components/customer/ProductCard';
import { GoogleMapContainer } from '@/components/maps/GoogleMapContainer';
import { StockRequestModal } from '@/components/customer/StockRequestModal';
import {
  Search as SearchIcon,
  Map,
  List,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCat = searchParams.get('category') || '';

  const { products, stores, userLocation, searchRadius, updateSearchRadius } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'availability'>('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isStockRequestOpen, setIsStockRequestOpen] = useState(false);

  // Attach store details to products
  const productsWithStore = useMemo(() => {
    return products.map((prod) => {
      const store = stores.find((s) => s.id === prod.storeId);
      return {
        ...prod,
        store,
        distanceKm: store?.distanceKm ?? 1.0,
      };
    });
  }, [products, stores]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return productsWithStore
      .filter((p) => {
        const matchesQuery =
          !query ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.brand?.toLowerCase().includes(query.toLowerCase());

        const matchesCat = !selectedCategory || p.category === selectedCategory;
        const matchesStock = !inStockOnly || p.stock > 0;
        const matchesDistance = (p.distanceKm ?? 0) <= searchRadius;

        return matchesQuery && matchesCat && matchesStock && matchesDistance;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'availability') return b.stock - a.stock;
        return 0;
      });
  }, [productsWithStore, query, selectedCategory, inStockOnly, searchRadius, sortBy]);

  return (
    <div className="space-y-4 pb-6">
      {/* Header Search Input */}
      <div className="space-y-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search digital thermometer, cotton, etc..."
            icon={<SearchIcon className="w-4 h-4 text-brand-teal" />}
          />
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-500'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-500'
              }`}
              title="Map View"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1 scrollbar-none text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3 py-1.5 rounded-full font-bold transition-colors border ${
                inStockOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              In Stock Only
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-full focus:outline-none"
            >
              <option value="distance">Sort: Nearest</option>
              <option value="price">Sort: Price Low to High</option>
              <option value="availability">Sort: Highest Stock</option>
            </select>

            {/* Radius Selector up to 100 KM (Requirement 7) */}
            <select
              value={searchRadius}
              onChange={(e) => updateSearchRadius(Number(e.target.value))}
              className="bg-brand-tealLight border border-brand-teal/40 text-brand-navy font-black px-2.5 py-1.5 rounded-full focus:outline-none"
            >
              <option value={1}>Radius: 1 KM</option>
              <option value={2}>Radius: 2 KM</option>
              <option value={5}>Radius: 5 KM</option>
              <option value={10}>Radius: 10 KM</option>
              <option value={25}>Radius: 25 KM</option>
              <option value={50}>Radius: 50 KM</option>
              <option value={75}>Radius: 75 KM</option>
              <option value={100}>Radius: 100 KM (Max)</option>
            </select>
          </div>

          <Badge variant="teal" className="shrink-0 bg-brand-navy text-white">
            Active Radius: {searchRadius} km
          </Badge>
        </div>
      </div>

      {/* Main Content: Map or List */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <GoogleMapContainer
            userLocation={userLocation}
            radiusKm={searchRadius}
            stores={stores}
          />

          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Products Found ({filteredProducts.length})
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredProducts.length} local items</span>
            {query && <span>Filter: &quot;{query}&quot;</span>}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-4 shadow-soft">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">No Local Stock Found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  None of the pharmacies within {searchRadius} km currently list &quot;{query || 'this item'}&quot; in active stock.
                </p>
              </div>

              <Button
                variant="teal"
                size="md"
                onClick={() => setIsStockRequestOpen(true)}
                className="gap-2 shadow-md mx-auto"
              >
                <Radio className="w-4 h-4" />
                <span>Send Smart Stock Request</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Stock Request Modal */}
      <StockRequestModal
        initialProductName={query}
        isOpen={isStockRequestOpen}
        onClose={() => setIsStockRequestOpen(false)}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
