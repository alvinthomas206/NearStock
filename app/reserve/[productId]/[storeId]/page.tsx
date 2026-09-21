'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/lib/store';
import { calculateReservationFeeDetails, formatCurrency, formatPaiseToRupees } from '@/lib/utils';
import {
  ArrowLeft,
  ShoppingBag,
  ShieldAlert,
  Upload,
  CheckCircle2,
  Clock,
  QrCode,
  AlertTriangle,
  Info,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ReservePage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const storeId = params.storeId as string;

  const { products, stores, createReservation } = useApp();

  const product = products.find((p) => p.id === productId);
  const store = stores.find((s) => s.id === storeId);

  const [quantity, setQuantity] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<number>(60); // 60 or 120
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string>('');
  
  // Payment step state
  const [isQrStep, setIsQrStep] = useState<boolean>(false);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Configured QR settings (Requirement 5)
  const qrUrl = process.env.NEXT_PUBLIC_RESERVATION_PAYMENT_QR_URL || '';
  const upiId = process.env.NEXT_PUBLIC_PAYMENT_UPI_ID || 'nearstock@upi';
  const displayName = process.env.NEXT_PUBLIC_PAYMENT_DISPLAY_NAME || 'NearStock Reservations';

  if (!product || !store) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-slate-600">Product or Store not found.</p>
        <Button variant="teal" size="sm" onClick={() => router.push('/search')}>
          Back to Search
        </Button>
      </div>
    );
  }

  // Calculate reservation fees server/utility logic (Requirements 1, 2, 20)
  const feeDetails = calculateReservationFeeDetails(product.price, quantity, durationMinutes);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
      setDocumentUrl(URL.createObjectURL(file));
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (product.requiresPrescription && !documentFile) {
      alert('Please upload your prescription document before proceeding.');
      return;
    }
    setIsQrStep(true);
  };

  const handleHavePaidSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newRes = await createReservation({
        productId: product.id,
        storeId: store.id,
        quantity,
        durationMinutes,
        documentUrl,
        paymentReference: paymentReference || `QR-PAY-${Date.now().toString().slice(-6)}`,
      });
      setIsSubmitting(false);
      router.push(`/reservations/${newRes.id}`);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err.message || 'Failed to submit reservation payment.');
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (isQrStep) setIsQrStep(false);
            else router.back();
          }}
          className="p-2 text-slate-600 hover:bg-white rounded-full transition-colors border border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">
            {isQrStep ? 'NearStock Fee Payment' : 'Confirm Product Reservation'}
          </h1>
          <p className="text-xs text-slate-500">
            {isQrStep ? 'Step 2: Pay Reservation Charges via QR' : 'Step 1: Select Duration & Review Breakdown'}
          </p>
        </div>
      </div>

      {!isQrStep ? (
        <>
          {/* Mandatory Payment Notice Banner (Requirement 1) */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex items-start gap-3 shadow-xs">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-extrabold block text-amber-950 mb-0.5">Important Payment Notice:</span>
              <span>"Product payment is made directly to the store. NearStock collects only the reservation charges."</span>
            </div>
          </div>

          {/* Product Summary */}
          <Card className="p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{store.name}</span>
                <h3 className="font-extrabold text-slate-900 text-base">{product.name}</h3>
                {product.brand && (
                  <p className="text-xs text-slate-500">Brand: {product.brand}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block font-bold">Unit Price</span>
                <span className="text-lg font-black text-brand-navy">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>

            {/* Quantity Picker (Requirement 24: min 1, max available stock) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Select Quantity</span>
                <span className="text-[10px] text-slate-400">Available stock: {product.stock}</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 bg-white text-slate-800 font-bold rounded-lg shadow-xs flex items-center justify-center text-sm disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-sm font-extrabold px-3">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 bg-white text-slate-800 font-bold rounded-lg shadow-xs flex items-center justify-center text-sm disabled:opacity-40"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* CUSTOMER RESERVATION DURATION SELECTION (Requirement 2) */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Select Reservation Duration:</span>
                <span className="text-[10px] text-emerald-600 font-bold">First 1 Hour FREE</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDurationMinutes(60)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    durationMinutes === 60
                      ? 'border-brand-teal bg-brand-tealLight/50 ring-2 ring-brand-teal/30 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900">1 Hour</span>
                    <Badge variant="teal" className="bg-emerald-500 text-white text-[9px] px-1.5 py-0">
                      FREE
                    </Badge>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Standard hold time (₹0 extra)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDurationMinutes(120)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    durationMinutes === 120
                      ? 'border-brand-teal bg-brand-tealLight/50 ring-2 ring-brand-teal/30 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900">2 Hours</span>
                    <span className="text-xs font-black text-brand-navy">+ ₹10</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Extended hold time (₹10 extra)</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Prescription Document Upload Section if required */}
          {product.requiresPrescription && (
            <Card className="p-4 space-y-3 border-amber-300 bg-amber-50/50">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Prescription Upload Required</span>
              </div>
              <p className="text-xs text-amber-900">
                This medicine requires a valid doctor prescription document to comply with pharmacy regulations.
              </p>

              <div className="border-2 border-dashed border-amber-300 rounded-2xl p-4 text-center bg-white">
                {documentFile ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{documentFile.name} Uploaded</span>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-1 block">
                    <Upload className="w-6 h-6 text-amber-600 mx-auto" />
                    <span className="text-xs font-bold text-slate-700 block">
                      Click to Upload Prescription (PDF/Image)
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </Card>
          )}

          {/* RESERVATION PRICE SUMMARY (Requirement 6) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Reservation Price Breakdown
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Product price</span>
                <span>{formatCurrency(product.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity</span>
                <span>{quantity}x</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800">
                <span>Product total</span>
                <span>{formatPaiseToRupees(feeDetails.productSubtotalPaise)}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <span>Reservation fee (1%)</span>
                <span className="font-semibold text-slate-800">{formatPaiseToRupees(feeDetails.reservationFeePaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Reservation duration</span>
                <span className="font-semibold text-slate-800">{durationMinutes === 120 ? '2 Hours' : '1 Hour'}</span>
              </div>
              <div className="flex justify-between">
                <span>Extra duration charge</span>
                <span className="font-semibold text-slate-800">{formatPaiseToRupees(feeDetails.extraReservationTimeFeePaise)}</span>
              </div>

              {/* PAY NOW vs PAY AT STORE */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-sm font-black text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <span>Pay NearStock Now:</span>
                  <span className="text-base">{formatPaiseToRupees(feeDetails.amountPayableNowPaise)}</span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-700 p-2 bg-slate-50 rounded-xl">
                  <span>Pay Store at Pickup:</span>
                  <span className="text-sm font-extrabold text-brand-navy">{formatPaiseToRupees(feeDetails.amountPayableAtStorePaise)}</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="teal"
            size="lg"
            onClick={handleProceedToPayment}
            className="w-full gap-2 shadow-lg font-black text-sm"
          >
            <span>Proceed to NearStock QR Payment ({formatPaiseToRupees(feeDetails.amountPayableNowPaise)})</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      ) : (
        /* STEP 2: QR PAYMENT (Requirement 4 & 5) */
        <div className="space-y-5">
          <Card className="p-6 text-center space-y-4 border-brand-teal/30 shadow-card">
            <Badge variant="teal" className="bg-brand-navy text-white px-3 py-1">
              NearStock QR Payment
            </Badge>

            <div>
              <span className="text-xs text-slate-500 block">Total Amount Payable Now</span>
              <span className="text-3xl font-black text-brand-navy block">
                {formatPaiseToRupees(feeDetails.amountPayableNowPaise)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                (Includes 1% Fee {formatPaiseToRupees(feeDetails.reservationFeePaise)} + Duration Charge {formatPaiseToRupees(feeDetails.extraReservationTimeFeePaise)})
              </span>
            </div>

            {/* QR CODE DISPLAY OR CONFIGURATION WARNING (Requirement 5) */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 inline-block mx-auto max-w-sm w-full">
              {qrUrl ? (
                <div className="space-y-3">
                  <div className="relative w-48 h-48 mx-auto border-4 border-white rounded-2xl shadow-md overflow-hidden bg-white">
                    <Image src={qrUrl} alt="NearStock Payment QR Code" fill className="object-contain" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Scan QR Code with any UPI App</p>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-amber-50 rounded-2xl border border-amber-300 text-left">
                  <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Payment QR Configuration Warning</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    NEXT_PUBLIC_RESERVATION_PAYMENT_QR_URL is not set in environment settings.
                    Please scan using the UPI ID below:
                  </p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-200 text-left space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">UPI ID:</span>
                  <span className="font-mono font-bold text-slate-800">{upiId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Merchant Name:</span>
                  <span className="font-bold text-slate-800">{displayName}</span>
                </div>
              </div>
            </div>

            {/* Payment Screenshot / Reference Number */}
            <div className="space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700">
                UPI Reference Number / UTR (Optional)
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. 123456789012 or UPI Ref ID"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
              <span className="text-[10px] text-slate-400 block">
                Enter reference number after completing payment in your UPI app.
              </span>
            </div>

            {/* "I Have Paid" Button (Requirement 4) */}
            <Button
              variant="teal"
              size="lg"
              onClick={handleHavePaidSubmit}
              isLoading={isSubmitting}
              className="w-full gap-2 shadow-lg font-black text-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>I Have Paid</span>
            </Button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Clicking "I Have Paid" submits your payment status as <strong>PAYMENT_SUBMITTED</strong>. Payment verification will be processed by store management.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
