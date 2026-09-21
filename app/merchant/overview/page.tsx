'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  ClipboardList,
  Plus,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MerchantOverviewPage() {
  const { user, stores, products, reservations, stockRequests, updateReservationStatus } = useApp();

  const merchantStoreIds = stores
    .filter((s) => s.ownerId === user?.id || s.id === `store-${user?.id?.substring(0, 8)}`)
    .map((s) => s.id);
  const primaryStoreId = merchantStoreIds[0] || (user?.id ? `store-${user.id.substring(0, 8)}` : '');
  const allowedStoreIds = user?.role === 'ADMIN' ? stores.map((s) => s.id) : (merchantStoreIds.length > 0 ? merchantStoreIds : [primaryStoreId]);

  const merchantProducts = products.filter((p) => allowedStoreIds.includes(p.storeId));
  const merchantReservations = reservations.filter((r) => allowedStoreIds.includes(r.storeId));

  const totalProducts = merchantProducts.length;
  const totalStock = merchantProducts.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = merchantProducts.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const outOfStockCount = merchantProducts.filter((p) => p.stock === 0).length;

  const activeBookings = merchantReservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'READY_FOR_PICKUP' || r.status === 'PENDING'
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>
          <p className="text-xs text-slate-500">Real-time store metrics, inventory alerts & pickup bookings.</p>
        </div>
        <Link href="/merchant/products/new">
          <Button variant="teal" size="md" className="gap-2 shadow-md">
            <Plus className="w-4 h-4" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-white border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Total Items</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalProducts}</p>
          <span className="text-[10px] text-slate-400">Active SKUs catalog</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Total Units</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalStock}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Available for pickup</span>
        </Card>

        <Card className="p-4 bg-white border-amber-200 bg-amber-50/40 space-y-2">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase">Low Stock</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-900">{lowStockCount}</p>
          <span className="text-[10px] text-amber-700 font-semibold">≤ 3 units remaining</span>
        </Card>

        <Card className="p-4 bg-white border-rose-200 bg-rose-50/40 space-y-2">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-bold uppercase">Out of Stock</span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-900">{outOfStockCount}</p>
          <span className="text-[10px] text-rose-700 font-semibold">Needs restock</span>
        </Card>

        <Card className="p-4 bg-white border-brand-teal/30 bg-brand-tealLight/30 space-y-2">
          <div className="flex items-center justify-between text-brand-teal">
            <span className="text-xs font-bold uppercase">Active Bookings</span>
            <div className="p-2 bg-brand-teal text-white rounded-xl">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-navy">{activeBookings.length}</p>
          <span className="text-[10px] text-brand-teal font-semibold">Holds pending pickup</span>
        </Card>
      </div>

      {/* Active Bookings Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Incoming Reservation Bookings</h3>
            <Link href="/merchant/bookings" className="text-xs text-brand-teal font-bold hover:underline flex items-center gap-1">
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
            {reservations.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {reservations.slice(0, 5).map((res) => (
                  <div key={res.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{res.product?.name}</span>
                        <Badge variant="teal">{res.pickupCode}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Customer: {res.customerName} ({res.customerMobile}) • Qty: {res.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={res.status === 'CONFIRMED' ? 'teal' : 'default'}>
                        {res.status}
                      </Badge>
                      {res.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="teal"
                          onClick={() => updateReservationStatus(res.id, 'READY_FOR_PICKUP')}
                          className="text-xs py-1 h-8"
                        >
                          Mark Ready
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">No customer reservations yet.</div>
            )}
          </div>
        </div>

        {/* Nearby Broadcast Requests Feed */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Customer Stock Requests</h3>
          <div className="space-y-3">
            {stockRequests.map((req) => (
              <Card key={req.id} className="p-4 space-y-2 border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{req.productName}</h4>
                    <p className="text-xs text-slate-500">Qty Needed: {req.quantity} units • Radius: {req.radiusKm} km</p>
                  </div>
                  <Badge variant={req.status === 'OPEN' ? 'warning' : 'success'}>{req.status}</Badge>
                </div>
                {req.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic">&quot;{req.notes}&quot;</p>
                )}
                <p className="text-xs text-slate-600 font-semibold">Customer: {req.customerName || 'Local Customer'}</p>

                {req.status === 'OPEN' ? (
                  <Button
                    size="sm"
                    variant="teal"
                    onClick={() => {
                      const priceStr = prompt(`Enter offer price in ₹ for ${req.productName}:`, '199');
                      if (!priceStr) return;
                      const price = parseFloat(priceStr);
                      if (isNaN(price)) return;

                      const currentStoreId = merchantStoreIds[0] || (user?.id ? `store-${user.id.substring(0, 8)}` : '');
                      useApp().submitStockOffer({
                        requestId: req.id,
                        storeId: currentStoreId,
                        price,
                        availableQuantity: req.quantity,
                        notes: 'Item available in store stock',
                      });
                      alert('Stock offer sent to customer!');
                    }}
                    className="w-full text-xs mt-2 gap-1.5"
                  >
                    <span>Send Stock Offer</span>
                  </Button>
                ) : (
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg font-bold border border-emerald-200 text-center mt-2">
                    ✓ Offer Submitted ({req.offers?.length || 1} offer)
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
