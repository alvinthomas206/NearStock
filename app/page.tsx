'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  const router = useRouter();
  const { user, isLoaded } = useApp();

  // Automatic session routing for authenticated users
  useEffect(() => {
    if (user) {
      if (user.role === 'MERCHANT') {
        if (user.merchantStatus === 'APPROVED') {
          router.push('/merchant/overview');
        } else {
          router.push('/merchant/application-status');
        }
      } else if (user.role === 'ADMIN') {
        router.push('/admin/overview');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xs font-bold text-slate-400 animate-pulse">Loading NearStock...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-6 text-center">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-soft space-y-6">
        {/* NearStock Logo & Name */}
        <div className="flex flex-col items-center gap-3">
          <Logo size="lg" />
          <h1 className="text-2xl font-black text-brand-navy tracking-tight mt-1">NearStock</h1>
          <p className="text-xs font-bold text-brand-teal uppercase tracking-wider bg-brand-tealLight/60 px-3 py-1 rounded-full border border-brand-teal/20">
            Find it nearby. Reserve it. Get it.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Link href="/signup" className="block w-full">
            <Button variant="teal" size="lg" className="w-full shadow-md text-sm font-extrabold">
              Sign Up
            </Button>
          </Link>

          <Link href="/login" className="block w-full">
            <Button variant="outline" size="lg" className="w-full border-slate-300 text-brand-navy text-sm font-extrabold hover:bg-slate-50">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
