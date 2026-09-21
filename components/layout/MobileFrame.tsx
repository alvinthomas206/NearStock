'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CustomerHeader } from './CustomerHeader';
import { BottomNav } from './BottomNav';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const pathname = usePathname();

  const isAuthPage = ['/login', '/signup', '/forgot-password'].some((p) =>
    pathname.startsWith(p)
  );
  const isOnboarding = pathname === '/onboarding';
  const isMerchantPage = pathname.startsWith('/merchant');
  const isLanding = pathname === '/';

  // Merchant pages: render as-is
  if (isMerchantPage) {
    return <>{children}</>;
  }

  // Auth pages & landing page: centered card layout
  if (isAuthPage || isOnboarding || isLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.4)] overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // Customer app pages: full-width desktop layout
  return (
    <div className="min-h-screen bg-[#F5F9FC] text-slate-800 flex flex-col antialiased">
      <CustomerHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        {children}
      </main>

      {/* Bottom nav only on mobile */}
      <BottomNav />
    </div>
  );
};
