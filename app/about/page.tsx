'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Users, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Alvin Thomas',
      role: 'Project Lead & Lead Full-Stack Architect',
      initials: 'AT',
      bio: 'Leading system architecture, real-time inventory management, and backend data flows.',
    },
    {
      name: 'Adona T Sajan',
      role: 'UI/UX & Mobile Interface Developer',
      initials: 'AS',
      bio: 'Crafting hyper-local map discovery, responsive design system, and counter pickup passcodes.',
    },
    {
      name: 'Leah Anna Bino',
      role: 'Backend & Firestore Data Engineer',
      initials: 'LB',
      bio: 'Engineering atomic hold transactions, merchant stock requests, and real-time synchronization.',
    },
    {
      name: 'Devanandha',
      role: 'Product Strategy & Quality Specialist',
      initials: 'D',
      bio: 'Ensuring pharmacy catalog accuracy, verification workflows, and user journey optimization.',
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 font-bold text-slate-600">
            <ArrowLeft className="w-4 h-4" />
            Back to Entry
          </Button>
        </Link>
        <Logo size="md" showTagline />
      </div>

      {/* Hero Banner Card */}
      <div className="bg-gradient-to-br from-brand-navy via-slate-800 to-slate-900 text-white p-8 rounded-3xl space-y-4 shadow-card text-center relative overflow-hidden">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mx-auto flex items-center justify-center mb-2 overflow-hidden p-2">
          <Image
            src="/logo.jpeg"
            alt="NearStock Logo"
            width={70}
            height={70}
            className="object-contain rounded-xl"
          />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
          About NearStock
        </span>

        <h1 className="text-3xl font-black tracking-tight text-white max-w-lg mx-auto">
          Hyper-Local Pharmacy Inventory & Instant Pickup
        </h1>

        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          NearStock bridges local customers with verified neighbourhood pharmacies. Search real-time stock, hold vital medicines for 30 minutes, or broadcast Smart Stock Requests to nearby merchants.
        </p>
      </div>

      {/* Mission & Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2 border-slate-200">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl w-fit">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Hyper-Local Focus</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Instant proximity search using precise coordinates to locate medicine stock within your chosen radius.
          </p>
        </Card>

        <Card className="p-5 space-y-2 border-slate-200">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Guaranteed Holds</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Atomic reservation holds with instant 4-digit pickup passcodes, preventing out-of-stock pharmacy trips.
          </p>
        </Card>

        <Card className="p-5 space-y-2 border-slate-200">
          <div className="p-2 bg-teal-50 text-brand-teal rounded-xl w-fit">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Smart Stock Requests</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Broadcast hard-to-find medicine requests directly to local pharmacy owners to receive instant fulfillment offers.
          </p>
        </Card>
      </div>

      {/* Team Members Section (Section F) */}
      <div className="space-y-4 pt-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-teal uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Meet the Creators</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">NearStock Project Team</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <Card
              key={member.name}
              className="p-5 flex items-start gap-4 hover:border-brand-teal transition-all shadow-soft"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-navy to-slate-800 text-white font-black text-base flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
                {member.initials}
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">{member.name}</h3>
                <span className="text-xs font-bold text-brand-teal block">{member.role}</span>
                <p className="text-xs text-slate-500 leading-relaxed">{member.bio}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation Return */}
      <div className="text-center pt-6">
        <Link href="/">
          <Button variant="teal" size="lg" className="shadow-lg">
            Return to NearStock Entry
          </Button>
        </Link>
      </div>
    </div>
  );
}
