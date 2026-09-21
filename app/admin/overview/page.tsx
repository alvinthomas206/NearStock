'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import { ShieldCheck, CheckCircle2, XCircle, LogOut, Store, ArrowLeft } from 'lucide-react';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { stores, updateMerchantStatus, user, logout } = useApp();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F9FC] p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Logo size="md" />
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 font-bold gap-1">
          <LogOut className="w-4 h-4" />
          Admin Sign Out
        </Button>
      </div>

      {/* Admin Title */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-800 text-white p-6 rounded-3xl shadow-card flex items-center justify-between">
        <div>
          <Badge variant="teal" className="bg-emerald-500 text-white border-none">
            System Administrator
          </Badge>
          <h1 className="text-2xl font-black text-white pt-1">Merchant Verification & Approvals</h1>
          <p className="text-xs text-slate-300 mt-1">Review pending merchant registrations, drug licences and approve storefront visibility.</p>
        </div>
      </div>

      {/* Stores Review List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">Registered Stores Applications</h2>

        <div className="grid grid-cols-1 gap-4">
          {stores.map((store) => {
            const currentStatus = store.status || 'APPROVED';
            return (
              <Card key={store.id} className="p-5 space-y-4 bg-white border-slate-200">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base">{store.name}</h3>
                      <Badge variant={currentStatus === 'APPROVED' ? 'success' : currentStatus === 'PENDING' ? 'warning' : 'danger'}>
                        {currentStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{store.formattedAddress}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Phone: {store.phone} • Owner ID: {store.ownerId}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-500 font-medium">
                    Store Visibility: <strong className={currentStatus === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}>
                      {currentStatus === 'APPROVED' ? 'Visible to Nearby Customers' : 'Hidden from Customer Search'}
                    </strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {currentStatus !== 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="teal"
                        onClick={async () => {
                          await updateMerchantStatus(store.ownerId, 'APPROVED');
                          alert(`${store.name} has been APPROVED and is now visible to customers.`);
                        }}
                        className="gap-1 font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Store
                      </Button>
                    )}

                    {currentStatus !== 'REJECTED' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          await updateMerchantStatus(store.ownerId, 'REJECTED');
                          alert(`${store.name} has been REJECTED.`);
                        }}
                        className="gap-1 font-bold"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject / Suspend
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
