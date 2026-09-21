'use client';

import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useApp } from '@/lib/store';

export const MerchantHeader: React.FC = () => {
  const { stores, user } = useApp();
  const merchantStore = stores.find((s) => s.ownerId === user?.id);
  const currentStoreName = user?.merchantRegistration?.shopName || merchantStore?.name || 'My Store / Pharmacy';
  const currentStoreAddress =
    (user?.merchantRegistration?.city ? `${user.merchantRegistration.locality ? user.merchantRegistration.locality + ', ' : ''}${user.merchantRegistration.city}` : '') ||
    merchantStore?.formattedAddress ||
    'Store Location';

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{currentStoreName}</h2>
          <p className="text-xs text-slate-500">{currentStoreAddress}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, SKU..."
            className="pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs w-64 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
          />
        </div>

        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <div className="w-9 h-9 bg-brand-navy text-white rounded-full flex items-center justify-center font-bold text-sm">
            M
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800">Store Manager</p>
            <p className="text-[10px] text-emerald-600 font-semibold">● Store Online</p>
          </div>
        </div>
      </div>
    </header>
  );
};
