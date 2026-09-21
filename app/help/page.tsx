'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, HelpCircle, Phone, Mail, MessageSquare, ShieldCheck } from 'lucide-react';

export default function HelpPage() {
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

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-3 bg-brand-tealLight text-brand-teal rounded-2xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Help & Support Center</h1>
            <p className="text-xs text-slate-500">Frequently asked questions and pharmacy pickup assistance.</p>
          </div>
        </div>

        <div className="space-y-4 text-xs divide-y divide-slate-100">
          <div className="pt-2 space-y-1">
            <h3 className="font-extrabold text-slate-900 text-sm">How does NearStock pickup work?</h3>
            <p className="text-slate-600 leading-relaxed">
              When you reserve an item, the local pharmacy holds it for you and generates a unique 4-digit pass code. Show this passcode at the store counter to collect your item.
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <h3 className="font-extrabold text-slate-900 text-sm">How long is my reservation held?</h3>
            <p className="text-slate-600 leading-relaxed">
              Reservations are held for 30 minutes awaiting merchant confirmation, and up to 120 minutes post-confirmation for store pickup.
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <h3 className="font-extrabold text-slate-900 text-sm">What is a Smart Stock Request?</h3>
            <p className="text-slate-600 leading-relaxed">
              If an item is out of stock in your nearby search, broadcast a Smart Stock Request. Nearby pharmacy owners will be notified instantly and can send you direct availability offers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
