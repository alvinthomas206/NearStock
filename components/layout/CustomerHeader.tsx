'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  Bell,
  ChevronDown,
  Home,
  Search,
  ShoppingBag,
  Radio,
  Bookmark,
  User,
  Store as StoreIcon,
  LogOut,
} from 'lucide-react';
import { Logo } from '../ui/logo';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';

export const CustomerHeader: React.FC = () => {
  const pathname = usePathname();
  const { userLocation, notifications, reservations, stockRequests, user, logout } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const activeReservationsCount = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'READY_FOR_PICKUP' || r.status === 'PENDING'
  ).length;

  const activeRequestsCount = stockRequests.filter((s) => s.status === 'OPEN').length;

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    {
      label: 'Bookings',
      href: '/reservations',
      icon: ShoppingBag,
      badge: activeReservationsCount > 0 ? activeReservationsCount : null,
    },
    {
      label: 'Stock Requests',
      href: '/stock-requests',
      icon: Radio,
      badge: activeRequestsCount > 0 ? activeRequestsCount : null,
    },
    { label: 'Saved Stores', href: '/saved-stores', icon: Bookmark },
  ];

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="shrink-0 flex items-center">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all relative',
                    isActive
                      ? 'text-brand-teal bg-brand-tealLight/60 font-extrabold'
                      : 'text-slate-600 hover:text-brand-navy hover:bg-slate-100/80'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="bg-brand-teal text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border border-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Location, Notifications, Profile & Merchant Portal */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Location selector */}
          <Link
            href="/onboarding"
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 transition-colors px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 max-w-[150px] sm:max-w-[200px] truncate"
            title={userLocation.formattedAddress}
          >
            <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0" />
            <span className="truncate">{userLocation.formattedAddress.split(',')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative p-2 text-slate-600 hover:text-brand-navy hover:bg-slate-100 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </Link>

          {/* Profile Quick Link */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1.5 pl-2 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full transition-all text-xs font-bold text-slate-700"
          >
            <div className="w-6 h-6 rounded-full bg-brand-navy text-white flex items-center justify-center font-black text-[10px]">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="max-w-[100px] truncate">{user?.name || 'Profile'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
