'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, Radio, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { reservations, stockRequests } = useApp();

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
      label: 'Requests',
      href: '/stock-requests',
      icon: Radio,
      badge: activeRequestsCount > 0 ? activeRequestsCount : null,
    },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 z-50 px-2 py-2 shadow-card">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-brand-teal font-bold bg-brand-tealLight/50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-teal text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
