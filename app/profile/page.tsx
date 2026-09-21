'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  User,
  MapPin,
  Sliders,
  ShoppingBag,
  Radio,
  Heart,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userLocation, searchRadius, logout } = useApp();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-soft my-6">
        <div className="p-4 bg-brand-tealLight text-brand-teal rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Please sign in to access your personal profile, active reservations, and saved pharmacy locations.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link href="/">
            <Button variant="teal" size="md">
              Sign In / Register
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-800 text-white p-5 rounded-3xl shadow-card space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-brand-teal text-white font-black text-xl rounded-full flex items-center justify-center border-2 border-white/20">
            {user.name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-extrabold">{user.name}</h2>
            <p className="text-xs text-slate-300">{user.email}</p>
            <p className="text-xs text-brand-teal font-semibold mt-0.5">{user.mobile}</p>
          </div>
        </div>
      </div>

      {/* Location & Radius Card */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-teal" />
            Active Pickup Location
          </h3>
          <Link href="/onboarding" className="text-xs text-brand-teal font-bold hover:underline">
            Edit
          </Link>
        </div>
        <p className="text-xs text-slate-600 font-medium leading-tight">
          {userLocation.formattedAddress}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Search Distance Limit:</span>
          <span className="font-extrabold text-brand-teal bg-brand-tealLight px-2 py-0.5 rounded-full">
            {searchRadius} km radius
          </span>
        </div>
      </Card>

      {/* Quick Navigation Menu Links */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden divide-y divide-slate-100 text-xs">
        <Link
          href="/reservations"
          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-slate-800 font-bold">
            <ShoppingBag className="w-4 h-4 text-brand-teal" />
            <span>Active Reservations & Passcodes</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/stock-requests"
          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-slate-800 font-bold">
            <Radio className="w-4 h-4 text-brand-teal" />
            <span>Smart Stock Requests</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/saved-stores"
          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-slate-800 font-bold">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Saved Pharmacies</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/notifications"
          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-slate-800 font-bold">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Notification Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/about"
          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-slate-800 font-bold">
            <HelpCircle className="w-4 h-4 text-brand-teal" />
            <span>About NearStock & Help Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={handleLogout}
          className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of NearStock</span>
        </Button>
      </div>
    </div>
  );
}
