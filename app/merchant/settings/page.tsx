'use client';

import React, { useState } from 'react';
import { Settings, Save, Bell, Shield, Clock, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function MerchantSettingsPage() {
  const [holdMinutes, setHoldMinutes] = useState(30);
  const [allowInstantHold, setAllowInstantHold] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Merchant Settings</h1>
        <p className="text-xs text-slate-500">Configure pre-booking hold duration, alert preferences & merchant account details.</p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl">
          Settings Saved Successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-5">
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Clock className="w-4 h-4 text-brand-teal" />
            Pre-Booking & Reservation Hold Duration
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Hold Expiry Time (Minutes)
            </label>
            <select
              value={holdMinutes}
              onChange={(e) => setHoldMinutes(Number(e.target.value))}
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-teal focus:outline-none"
            >
              <option value={15}>15 Minutes Hold</option>
              <option value={30}>30 Minutes Hold (Default)</option>
              <option value={45}>45 Minutes Hold</option>
              <option value={60}>60 Minutes Hold</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <span className="font-bold text-slate-800 text-xs block">Enable Instant Hold without Prior Payment</span>
              <span className="text-[10px] text-slate-400">Allow customers to reserve items for pickup without upfront card payment</span>
            </div>
            <input
              type="checkbox"
              checked={allowInstantHold}
              onChange={(e) => setAllowInstantHold(e.target.checked)}
              className="w-4 h-4 text-brand-teal rounded accent-brand-teal"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Bell className="w-4 h-4 text-brand-teal" />
            Order Alert Notifications
          </h3>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <span className="font-bold text-slate-800 text-xs block">Real-time SMS & Audio Alerts</span>
              <span className="text-[10px] text-slate-400">Receive instant push notifications when a new stock request or booking arrives</span>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 text-brand-teal rounded accent-brand-teal"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="teal" size="lg" className="gap-2 shadow-md">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
