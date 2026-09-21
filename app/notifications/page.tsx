'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, CheckCircle2, ArrowLeft, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-teal" />
          Notifications
        </h1>
        {notifications.some((n) => !n.read) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={markAllNotificationsRead}
            className="text-xs text-brand-teal font-bold gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-4 transition-all border ${
                notif.read ? 'bg-white border-slate-100 opacity-80' : 'bg-brand-tealLight/30 border-brand-teal/40 font-medium'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">{notif.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.body}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>
                {!notif.read && (
                  <span className="w-2.5 h-2.5 bg-brand-teal rounded-full shrink-0 mt-1" />
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No notifications</h3>
          <p className="text-xs text-slate-500">
            You will receive updates here for reservation confirmations, document verification, and stock alerts.
          </p>
        </div>
      )}
    </div>
  );
}
