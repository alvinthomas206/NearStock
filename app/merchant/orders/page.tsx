'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Receipt, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MerchantOrdersPage() {
  const { user, stores, reservations } = useApp();

  const merchantStoreIds = stores
    .filter((s) => s.ownerId === user?.id || s.id === `store-${user?.id?.substring(0, 8)}`)
    .map((s) => s.id);
  const primaryStoreId = merchantStoreIds[0] || (user?.id ? `store-${user.id.substring(0, 8)}` : '');
  const allowedStoreIds = user?.role === 'ADMIN' ? stores.map((s) => s.id) : (merchantStoreIds.length > 0 ? merchantStoreIds : [primaryStoreId]);

  const completedOrders = reservations.filter(
    (r) => allowedStoreIds.includes(r.storeId) && (r.status === 'COMPLETED' || r.status === 'CONFIRMED')
  );

  const totalRevenue = completedOrders.reduce(
    (acc, r) => acc + (r.product ? r.product.price * r.quantity : 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Order Transactions History</h1>
          <p className="text-xs text-slate-500">Record of completed pickup reservations and counter sales.</p>
        </div>
        <Card className="p-3 px-5 bg-brand-tealLight border-brand-teal/30">
          <span className="text-[10px] uppercase font-bold text-brand-teal block">Gross Revenue</span>
          <span className="text-xl font-black text-brand-navy">{formatCurrency(totalRevenue)}</span>
        </Card>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Item Reserved</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Passcode</th>
                <th className="p-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {completedOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{ord.id}</td>
                  <td className="p-4">{ord.customerName}</td>
                  <td className="p-4 font-bold text-slate-900">{ord.product?.name}</td>
                  <td className="p-4">{ord.quantity}</td>
                  <td className="p-4 font-black text-brand-navy">
                    {ord.product ? formatCurrency(ord.product.price * ord.quantity) : ''}
                  </td>
                  <td className="p-4">
                    <Badge variant="teal">{ord.pickupCode}</Badge>
                  </td>
                  <td className="p-4 text-slate-400">{formatDateTime(ord.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
