'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-[700px] justify-between p-4 py-8">
      <div>
        <div className="flex items-center justify-between mb-8">
          <Logo size="md" />
          <Link href="/login" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
        </div>

        <div className="space-y-2 mb-6">
          <h2 className="text-2xl font-black text-brand-navy">Reset Password</h2>
          <p className="text-xs text-slate-500">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Check Your Inbox</h3>
            <p className="text-xs text-slate-600">
              We have sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link href="/login" className="block pt-2">
              <Button variant="teal" size="md" className="w-full">
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                placeholder="your-email@example.com"
                required
              />
            </div>

            <Button type="submit" variant="teal" size="lg" className="w-full shadow-lg">
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
