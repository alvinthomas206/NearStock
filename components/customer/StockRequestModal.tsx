'use client';

import React, { useState } from 'react';
import { Radio, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useApp } from '@/lib/store';

interface StockRequestModalProps {
  initialProductName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const StockRequestModal: React.FC<StockRequestModalProps> = ({
  initialProductName = '',
  isOpen,
  onClose,
}) => {
  const { createStockRequest, searchRadius } = useApp();
  const [productName, setProductName] = useState(initialProductName);
  const [quantity, setQuantity] = useState(1);
  const [radiusKm, setRadiusKm] = useState(searchRadius || 5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setIsSubmitting(true);
    await createStockRequest({
      productName,
      quantity,
      radiusKm,
      notes,
    });
    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
          <div className="p-2.5 bg-brand-tealLight rounded-2xl text-brand-teal">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Smart Stock Request</h3>
            <p className="text-xs text-slate-500">
              Notify all pharmacies within {radiusKm} km radius
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce mb-3" />
            <h4 className="font-bold text-slate-900 text-lg">Request Sent!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Local merchants have been notified. You will get a push alert as soon as a store confirms availability.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Product / Medicine Name
              </label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Paracetamol 500mg, Pulse Oximeter"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quantity Required
                </label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Broadcasting Radius
                </label>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Math.min(100, Math.max(1, Number(e.target.value))))}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-teal focus:outline-none font-semibold"
                >
                  <option value={1}>1 km radius</option>
                  <option value={2}>2 km radius</option>
                  <option value={5}>5 km radius</option>
                  <option value={10}>10 km radius</option>
                  <option value={25}>25 km radius</option>
                  <option value={50}>50 km radius</option>
                  <option value={75}>75 km radius</option>
                  <option value={100}>100 km radius (Max)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Prefer tablet strips of 10s, urgent delivery needed..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-brand-teal focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
              <AlertCircle className="w-4 h-4 text-brand-teal shrink-0" />
              <span>
                Merchants will respond with price and instant reservation link.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="teal"
                isLoading={isSubmitting}
                className="gap-2 shadow-md"
              >
                <Send className="w-4 h-4" />
                Broadcast Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
