'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 font-bold text-slate-600">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <Logo size="md" />
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4 text-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Privacy Policy (Draft)</h1>
            <p className="text-xs text-slate-500">How NearStock handles user location and reservation data.</p>
          </div>
        </div>

        <div className="space-y-3 text-slate-600 leading-relaxed">
          <p>
            NearStock is committed to protecting your privacy. We collect device location coordinates solely for the purpose of identifying nearby pharmacies and calculating distance metrics.
          </p>
          <p>
            Prescription uploads and booking information are accessible strictly to you and the fulfilling merchant store.
          </p>
        </div>
      </div>
    </div>
  );
}
