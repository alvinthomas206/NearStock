'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCheck, Store, ArrowLeft, ArrowRight, ShieldCheck, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function SignUpSelectionPage() {
  const router = useRouter();
  const { signup } = useApp();
  const [accountType, setAccountType] = useState<'CUSTOMER' | 'MERCHANT' | null>(null);

  // Customer Signup State (Requirements 16 & 24)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !mobile.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Confirm Password does not match Password.');
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        name,
        email,
        mobile,
        password,
        role: 'CUSTOMER',
      });
      setIsLoading(false);
      router.push('/onboarding');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to create customer account.');
    }
  };

  return (
    <div className="flex flex-col min-h-[600px] justify-between p-6 max-w-md mx-auto">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-1 text-xs text-brand-navy font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <Logo size="sm" />
        </div>

        {/* Step 1: Account Type Selection */}
        {!accountType ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-brand-navy">Create Account</h2>
              <p className="text-xs text-slate-500 font-semibold">
                How would you like to use NearStock?
              </p>
            </div>

            <div className="space-y-3">
              {/* Customer Option */}
              <button
                type="button"
                onClick={() => setAccountType('CUSTOMER')}
                className="w-full bg-white border-2 border-slate-200 hover:border-brand-teal p-5 rounded-3xl text-left transition-all group shadow-soft flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-brand-teal group-hover:text-white transition-colors">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Customer Account</h3>
                    <p className="text-xs text-slate-500">Find nearby stock, reserve items & request medicines.</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-teal shrink-0" />
              </button>

              {/* Merchant / Shop Owner Option */}
              <button
                type="button"
                onClick={() => router.push('/merchant/register')}
                className="w-full bg-white border-2 border-slate-200 hover:border-brand-teal p-5 rounded-3xl text-left transition-all group shadow-soft flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-tealLight text-brand-teal rounded-2xl group-hover:bg-brand-teal group-hover:text-white transition-colors">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Merchant / Shop Owner</h3>
                    <p className="text-xs text-slate-500">Register pharmacy or store, manage inventory & bookings.</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-teal shrink-0" />
              </button>
            </div>
          </div>
        ) : (
          /* Customer Signup Form (Requirements 16 & 24) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAccountType(null)}
                className="text-xs text-brand-teal font-bold hover:underline flex items-center gap-1"
              >
                ← Change Account Type
              </button>
              <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Customer Registration
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-brand-navy">Customer Sign Up</h2>
              <p className="text-xs text-slate-500">Create your customer account using Firebase Auth.</p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCustomerSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-4 h-4 text-slate-400" />}
                  placeholder="e.g. Alvin Thomas"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Mobile Number *
                </label>
                <Input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  icon={<Phone className="w-4 h-4 text-slate-400" />}
                  placeholder="+91 98765 00000"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4 text-slate-400" />}
                  placeholder="yourname@domain.com"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Password *
                </label>
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

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Confirm Password *
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4 text-slate-400" />}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" variant="teal" size="lg" isLoading={isLoading} className="w-full shadow-lg font-extrabold mt-2 gap-2">
                <span>Create Customer Account</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Footer Navigation Link */}
      <div className="text-center pt-6 border-t border-slate-100 mt-6">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-teal font-extrabold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
