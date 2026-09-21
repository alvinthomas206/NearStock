'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';
import { StockRequestModal } from '@/components/customer/StockRequestModal';
import { Radio, Plus, ArrowLeft, Clock, Store, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function StockRequestsPage() {
  const { stockRequests, acceptStockOffer } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Radio className="w-5 h-5 text-brand-teal" />
          Smart Stock Requests
        </h1>
        <Button
          size="sm"
          variant="teal"
          onClick={() => setIsModalOpen(true)}
          className="gap-1 shadow-sm text-xs"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      <div className="bg-brand-tealLight border border-brand-teal/30 p-4 rounded-3xl text-xs text-brand-teal space-y-1">
        <span className="font-extrabold block">Broadcast Radar Active</span>
        <span>
          When an item is unavailable nearby, broadcast a request. Local pharmacy merchants get notified instantly to fulfill it.
        </span>
      </div>

      {/* Requests List */}
      {stockRequests.length > 0 ? (
        <div className="space-y-3">
          {stockRequests.map((req) => (
            <Card key={req.id} className="p-4 space-y-3 border-slate-200 hover:border-brand-teal transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Request ID: {req.id}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base">{req.productName}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Quantity: {req.quantity} units • Radius: {req.radiusKm} km
                  </p>
                </div>

                <Badge variant={req.status === 'OPEN' ? 'warning' : req.status === 'FULFILLED' ? 'default' : 'success'}>
                  {req.status}
                </Badge>
              </div>

              {req.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic">
                  &quot;{req.notes}&quot;
                </p>
              )}

              {/* Merchant Offers Section (NS-09) */}
              {req.offers && req.offers.length > 0 && (
                <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 space-y-2">
                  <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-emerald-600" />
                    Merchant Stock Offers Received ({req.offers.length}):
                  </span>
                  {req.offers.map((offer) => (
                    <div key={offer.id} className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 block">{offer.storeName}</span>
                        <span className="text-slate-500 text-[11px] block">{offer.storeAddress}</span>
                        <span className="text-brand-navy font-bold">Price: ₹{offer.price} • Available: {offer.availableQuantity} units</span>
                      </div>

                      {req.reservationId ? (
                        <Link href={`/reservations/${req.reservationId}`}>
                          <Button size="sm" variant="teal" className="text-xs py-1 h-8">
                            View Pickup Passcode
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          variant="teal"
                          onClick={async () => {
                            const res = await acceptStockOffer(req.id, offer.id);
                            if (res) {
                              alert(`Offer accepted! Reserved at ${offer.storeName}. Pickup Code: ${res.pickupCode}`);
                            }
                          }}
                          className="text-xs py-1 h-8 gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accept & Reserve
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Requested {formatRelativeTime(req.createdAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3 shadow-soft">
          <Radio className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No active stock requests</h3>
          <p className="text-xs text-slate-500">
            Can&apos;t find an item in search? Broadcast a Smart Stock Request to nearby merchants.
          </p>
          <Button variant="teal" size="sm" onClick={() => setIsModalOpen(true)} className="mx-auto">
            Create First Stock Request
          </Button>
        </div>
      )}

      {/* Modal */}
      <StockRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
