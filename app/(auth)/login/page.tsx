'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, UserCheck, Store, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/lib/store';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPortal = searchParams.get('portal') === 'merchant' ? 'MERCHANT' : 'CUSTOMER';

  const { login, user, isLoaded } = useApp();
  const [portal, setPortal] = useState<'CUSTOMER' | 'MERCHANT'>(initialPortal);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Automatic session routing for authenticated users
  useEffect(() => {
    if (isLoaded && user) {
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
  }, [isLoaded, user, router]);

  const handlePortalSwitch = (selectedPortal: 'CUSTOMER' | 'MERCHANT') => {
    setPortal(selectedPortal);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password) {
      setError('Please enter both Email Address and Password.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password, portal);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      let msg = 'Failed to sign in. Please check your credentials.';
      if (err.message) msg = err.message;
      setError(msg);
    }
  };

  return (
    <div className="flex flex-col min-h-[600px] justify-between p-6 max-w-md mx-auto">
      <div>
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-1 text-xs text-brand-navy font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <Logo size="sm" />
        </div>

        <div className="text-center space-y-1 mb-6">
          <h2 className="text-xl font-black text-brand-navy">
            {portal === 'MERCHANT' ? 'Merchant Portal Login' : 'Customer Portal Login'}
          </h2>
          <p className="text-xs text-slate-500">
            Enter your authenticated account credentials.
          </p>
        </div>

        {/* Portal Selection Tabs (Requirement 11, 12, 13) */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => handlePortalSwitch('CUSTOMER')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              portal === 'CUSTOMER' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => handlePortalSwitch('MERCHANT')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              portal === 'MERCHANT' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-4 h-4 text-brand-teal" />
            Merchant Login
          </button>
        </div>

        {/* Dynamic Portal Header Info */}
        <div className={`p-3 rounded-2xl text-xs font-semibold mb-4 border flex items-center gap-2 ${
          portal === 'CUSTOMER'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-teal-50 text-brand-teal border-brand-teal/30'
        }`}>
          {portal === 'CUSTOMER' ? (
            <>
              <UserCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Customer Portal — Access local stock search, holds & requests.</span>
            </>
          ) : (
            <>
              <Store className="w-4 h-4 shrink-0 text-brand-teal" />
              <span>Merchant Portal — Business dashboard for store inventory & orders.</span>
            </>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              placeholder="e.g. name@example.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Password *
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-brand-teal font-bold hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4 text-slate-400" />}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="teal" size="lg" isLoading={isLoading} className="w-full shadow-lg font-extrabold mt-2">
            {portal === 'CUSTOMER' ? 'Sign In as Customer' : 'Sign In as Merchant'}
          </Button>
        </form>
      </div>

      <div className="text-center pt-6 border-t border-slate-100 mt-6">
        <p className="text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href={portal === 'MERCHANT' ? '/merchant/register' : '/signup'}
            className="text-brand-teal font-extrabold hover:underline"
          >
            {portal === 'MERCHANT' ? 'Register Merchant Store' : 'Create Customer Account'}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400 font-bold">Loading portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
