'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ProductCard } from '@/components/customer/ProductCard';
import { StoreCard } from '@/components/customer/StoreCard';
import { ReservationCard } from '@/components/customer/ReservationCard';
import { StockRequestModal } from '@/components/customer/StockRequestModal';
import {
  Search,
  SlidersHorizontal,
  Pill,
  Thermometer,
  Sparkles,
  HeartPulse,
  Radio,
  MapPin,
  ChevronRight,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { products, stores, reservations, user, isLoaded, userLocation, searchRadius } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isStockRequestOpen, setIsStockRequestOpen] = useState(false);

  // Redirect non-customer roles to their respective dashboards
  React.useEffect(() => {
    if (isLoaded && user) {
      if (user.role === 'MERCHANT') {
        if (user.merchantStatus === 'APPROVED') {
          router.push('/merchant/overview');
        } else {
          router.push('/merchant/application-status');
        }
      } else if (user.role === 'ADMIN') {
        router.push('/admin/overview');
      }
    }
  }, [isLoaded, user, router]);

  const activeReservations = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'READY_FOR_PICKUP' || r.status === 'PENDING'
  );

  const categories = [
    { name: 'All Products', icon: Sparkles, cat: '' },
    { name: 'Medical Devices', icon: Thermometer, cat: 'Medical Devices' },
    { name: 'Emergency & Aid', icon: HeartPulse, cat: 'Emergency & First Aid' },
    { name: 'Medicines', icon: Pill, cat: 'Medicines' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner + Search */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-card">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-teal/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 left-24 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-md border border-emerald-500/30 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Pharmacy Network Live
          </span>

          <h1 className="text-3xl font-black leading-tight mb-1">
            Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-300 text-sm mb-5">
            Find medicines & stock nearby in minutes. Within{' '}
            <span className="text-brand-teal font-bold">{searchRadius} km</span> of{' '}
            {userLocation.formattedAddress.split(',')[0]}.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-xl">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thermometer, cotton roll, paracetamol..."
              icon={<Search className="w-4 h-4 text-brand-teal" />}
              className="bg-white text-slate-900 shadow-md h-11"
            />
            <Button type="submit" variant="teal" className="shrink-0 h-11 px-5 shadow-md">
              Search
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/search')}
              className="shrink-0 h-11 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Nearby Stores', value: stores.length, icon: MapPin, color: 'text-blue-600 bg-blue-50' },
          { label: 'Products Available', value: products.filter(p => p.stock > 0).length, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Active Reservations', value: activeReservations.length, icon: ShoppingBag, color: 'text-amber-600 bg-amber-50' },
          { label: 'Search Radius', value: `${searchRadius} km`, icon: Radio, color: 'text-brand-teal bg-brand-tealLight' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4 shadow-soft">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Reservations */}
      {activeReservations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Active Reservation Passcode
            </h2>
            <Link href="/reservations" className="text-xs text-brand-teal font-bold hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeReservations.slice(0, 2).map(r => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Products (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() =>
                    router.push(item.cat ? `/search?category=${encodeURIComponent(item.cat)}` : '/search')
                  }
                  className="flex items-center gap-2 bg-white hover:bg-brand-tealLight border border-slate-200 px-4 py-2 rounded-full text-sm font-semibold text-slate-700 shadow-xs transition-colors"
                >
                  <Icon className="w-4 h-4 text-brand-teal" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Featured Products */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Featured Nearby Products</h2>
                <p className="text-xs text-slate-400">Real-time availability within {searchRadius} km</p>
              </div>
              <Link href="/search" className="text-sm text-brand-teal font-bold hover:underline flex items-center gap-0.5">
                Explore All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sidebar (1/3 width) */}
        <div className="space-y-5">
          {/* Smart Stock Request */}
          <div className="bg-gradient-to-br from-brand-tealLight to-emerald-50 border border-brand-teal/30 p-5 rounded-3xl shadow-soft">
            <div className="flex items-center gap-2 text-brand-teal font-bold text-sm mb-2">
              <Radio className="w-4 h-4 animate-pulse" />
              Can&apos;t find an item nearby?
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Broadcast a Smart Request to all pharmacies within {searchRadius} km.
            </p>
            <Button
              variant="teal"
              className="w-full gap-2 shadow-sm"
              onClick={() => setIsStockRequestOpen(true)}
            >
              <Radio className="w-4 h-4" />
              Send Smart Request
            </Button>
          </div>

          {/* Nearby Stores */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-teal" />
                Nearby Pharmacies
              </h2>
            </div>
            <div className="space-y-3">
              {stores.slice(0, 4).map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Request Modal */}
      <StockRequestModal
        isOpen={isStockRequestOpen}
        onClose={() => setIsStockRequestOpen(false)}
      />
    </div>
  );
}
