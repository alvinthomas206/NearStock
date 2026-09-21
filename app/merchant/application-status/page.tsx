'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import { Clock, ShieldCheck, CheckCircle2, XCircle, LogOut, ArrowRight, Store } from 'lucide-react';

export default function MerchantApplicationStatusPage() {
  const router = useRouter();
  const { user, updateMerchantStatus, logout } = useApp();
  const [autoApproved, setAutoApproved] = React.useState(false);

  const status = user?.merchantStatus || 'PENDING';

  // Automatically approve merchant in Firebase after showing the screen once
  React.useEffect(() => {
    if (user && user.id && status === 'PENDING' && !autoApproved) {
      const timer = setTimeout(async () => {
        await updateMerchantStatus(user.id, 'APPROVED');
        setAutoApproved(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, status, autoApproved, updateMerchantStatus]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F9FC] flex flex-col justify-between p-6">
      <div className="max-w-xl mx-auto w-full space-y-6 my-auto">
        <div className="flex items-center justify-between mb-2">
          <Logo size="md" />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 font-bold gap-1">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <Card className="p-8 bg-white border-slate-200 text-center space-y-5 shadow-card">
          {status === 'PENDING' && !autoApproved && (
            <>
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1">
                <Badge variant="warning" className="px-3 py-1 text-xs">
                  Verifying Store Registration
                </Badge>
                <h1 className="text-2xl font-black text-slate-900 pt-2">Registration Submitted</h1>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your store registration application has been received and uploaded to Firebase. Granting automatic approval...
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2">
                <span className="font-extrabold text-slate-800 block border-b border-slate-200 pb-1">
                  Application Summary:
                </span>
                <div className="text-slate-600 space-y-1">
                  <div><strong>Store Name:</strong> {user?.merchantRegistration?.shopName || 'Pharmacy Store'}</div>
                  <div><strong>Owner:</strong> {user?.name || user?.merchantRegistration?.ownerName}</div>
                  <div><strong>Category:</strong> {user?.merchantRegistration?.shopCategory || 'Pharmacy'}</div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl text-left space-y-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Automatic approval verification in progress...</span>
              </div>
            </>
          )}

          {(status === 'APPROVED' || autoApproved) && (
            <>
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <Badge variant="success" className="px-3 py-1 text-xs">
                  Account Approved & Active
                </Badge>
                <h1 className="text-2xl font-black text-slate-900 pt-2">Application Approved!</h1>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your merchant store is now verified and active in Firebase. You will not see this approval screen again on future logins.
                </p>
              </div>

              <Button
                variant="teal"
                size="lg"
                onClick={() => router.push('/merchant/overview')}
                className="w-full gap-2 font-extrabold shadow-lg"
              >
                <Store className="w-4 h-4" />
                <span>Enter Merchant Dashboard</span>
              </Button>
            </>
          )}

          {(status === 'REJECTED' || status === 'SUSPENDED') && (
            <>
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <Badge variant="danger" className="px-3 py-1 text-xs">
                  {status}
                </Badge>
                <h1 className="text-2xl font-black text-slate-900 pt-2">Application Status: {status}</h1>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your merchant application was {status.toLowerCase()}. Please contact NearStock support for document re-verification.
                </p>
              </div>

              <Button variant="outline" size="md" onClick={handleLogout} className="w-full">
                Return to Entry Screen
              </Button>
            </>
          )}
        </Card>
      </div>

      <div className="text-center text-xs text-slate-400">
        NearStock Merchant Application Portal • Secured Firebase Verification
      </div>
    </div>
  );
}
