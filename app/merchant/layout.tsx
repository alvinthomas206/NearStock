'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { MerchantSidebar } from '@/components/layout/MerchantSidebar';
import { MerchantHeader } from '@/components/layout/MerchantHeader';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useApp();

  const isRegisterPage = pathname === '/merchant/register';
  const isStatusPage = pathname === '/merchant/application-status';

  // Allow standalone un-nested layout for register & application-status pages
  if (isRegisterPage || isStatusPage) {
    return <>{children}</>;
  }

  // Loading state guard to prevent layout flash during auth initialization
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F9FC] flex flex-col items-center justify-center p-6">
        <div className="text-xs font-bold text-slate-400 animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
          <span>Verifying merchant session...</span>
        </div>
      </div>
    );
  }

  // Role Protection Check (Requirement 16)
  if (isLoaded && (!user || user.role === 'CUSTOMER')) {
    return (
      <div className="min-h-screen bg-[#F5F9FC] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-rose-200 shadow-soft space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Unauthorized Portal Access</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current account is registered as a Customer. Customer accounts do not have permission to access the Merchant Portal.
          </p>
          <Button variant="teal" size="md" onClick={() => router.push('/dashboard')} className="w-full gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Customer Dashboard</span>
          </Button>
        </div>
      </div>
    );
  }

  // Pending / Unapproved Merchant Check (Requirement 12 & 20)
  if (isLoaded && user && user.role === 'MERCHANT' && user.merchantStatus !== 'APPROVED') {
    return (
      <div className="min-h-screen bg-[#F5F9FC] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-amber-200 shadow-soft space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Application Pending Approval</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your store registration status is &quot;{user.merchantStatus || 'PENDING'}&quot;. You will receive full dashboard access once approved by Admin.
          </p>
          <Button variant="teal" size="md" onClick={() => router.push('/merchant/application-status')} className="w-full">
            View Application Status
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans antialiased text-slate-800">
      <MerchantSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MerchantHeader />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
