'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
          <div className="p-3 bg-brand-tealLight text-brand-teal rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Terms of Service (Draft)</h1>
            <p className="text-xs text-slate-500">Terms governing pharmacy reservations and merchant listings.</p>
          </div>
        </div>

        <div className="space-y-3 text-slate-600 leading-relaxed">
          <p>
            NearStock provides real-time local pharmacy inventory discovery and reservation management. Reservations are holds for physical counter pickup and do not constitute online payment or mail delivery unless specified.
          </p>
          <p>
            Prescription medicines require valid doctor verification at the pharmacy counter prior to item release.
          </p>
        </div>
      </div>
    </div>
  );
}
