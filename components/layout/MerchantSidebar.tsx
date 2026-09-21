'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Store as StoreIcon,
  Package,
  Layers,
  ClipboardList,
  Receipt,
  Settings,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { Logo } from '../ui/logo';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';

export const MerchantSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { reservations, logout } = useApp();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const pendingBookingsCount = reservations.filter(
    (r) => r.status === 'PENDING' || r.status === 'CONFIRMED'
  ).length;

  const navItems = [
    { label: 'Overview', href: '/merchant/overview', icon: LayoutDashboard },
    { label: 'Store Profile', href: '/merchant/store', icon: StoreIcon },
    { label: 'Products Catalog', href: '/merchant/products', icon: Package },
    { label: 'Inventory Stock', href: '/merchant/inventory', icon: Layers },
    {
      label: 'Bookings & Pickup',
      href: '/merchant/bookings',
      icon: ClipboardList,
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
    },
    { label: 'Order History', href: '/merchant/orders', icon: Receipt },
    { label: 'Settings', href: '/merchant/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-brand-navy text-white min-h-screen flex flex-col justify-between p-4 shadow-xl">
      <div>
        <div className="px-3 py-4 border-b border-slate-700/50 mb-6">
          <Logo size="sm" className="[&_span]:text-white [&_.text-brand-navy]:text-white" />
          <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider bg-brand-teal text-white px-2 py-0.5 rounded">
            Merchant Portal
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-700/50">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors w-full text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Merchant Portal</span>
        </button>
      </div>
    </aside>
  );
};
