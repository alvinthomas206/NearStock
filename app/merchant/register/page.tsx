'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoogleMapContainer } from '@/components/maps/GoogleMapContainer';
import { useApp } from '@/lib/store';
import { parseCoordinatesFromGoogleMapsLink } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Store,
  User,
  MapPin,
  Clock,
  FileText,
  Upload,
  ShieldCheck,
  Save,
  AlertCircle,
} from 'lucide-react';

export default function MerchantRegisterPage() {
  const router = useRouter();
  const { submitMerchantRegistration, signup, userLocation } = useApp();

  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State (All 34 fields - Requirements 8 & 17)
  const [formData, setFormData] = useState({
    // Step 1: Owner / Contact & Password Authentication
    ownerName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    alternateMobile: '',
    // Step 2: Shop Details
    shopName: '',
    shopCategory: 'Pharmacy',
    shopDescription: '',
    shopLogoUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=600',
    // Step 3: Address & Map Location (NO visible Lat/Lng fields)
    buildingNo: '',
    street: '',
    locality: '',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pinCode: '560001',
    landmark: '',
    googleMapsLink: '',
    // Step 4: Business Hours
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    openingTime: '08:00',
    closingTime: '22:00',
    weeklyHoliday: 'Sunday',
    pickupInstructions: 'Show 4-digit passcode at counter 1.',
    // Step 5: Business Information & Pharmacy Licence
    gstin: '',
    businessLicenceNo: '',
    drugLicenceNo: '',
    drugLicenceExpiry: '',
    drugLicenceDocUrl: '',
    pharmacistName: '',
    pharmacistRegNo: '',
    // Step 6: Consents
    termsAccepted: false,
    privacyAccepted: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWorkingDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    setError('');
    if (currentStep === 1) {
      if (!formData.ownerName || !formData.mobile || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in Owner Name, Mobile Number, Email Address, Password, and Confirm Password.');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Confirm Password does not match Password.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.shopName || !formData.shopCategory) {
        setError('Please enter Shop Name and select a Shop Category.');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.buildingNo || !formData.street || !formData.pinCode) {
        setError('Please enter Shop Building/Number, Street, and PIN code.');
        return false;
      }
    }
    if (currentStep === 5 && formData.shopCategory === 'Pharmacy') {
      if (!formData.drugLicenceNo || !formData.pharmacistName) {
        setError('Pharmacy Category requires Drug Licence Number and Pharmacist Name.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(6, prev + 1));
    }
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.termsAccepted || !formData.privacyAccepted) {
      setError('You must accept the Merchant Terms and Privacy Policy to submit your application.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Requirement 8: Create Firebase Auth account, save merchant profile & submit application
      await signup({
        name: formData.ownerName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        role: 'MERCHANT',
        shopName: formData.shopName,
      });
      await submitMerchantRegistration(formData);
      setIsSubmitting(false);
      router.push('/merchant/application-status');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to submit registration application.');
    }
  };

  const stepsList = [
    { num: 1, label: 'Owner', icon: User },
    { num: 2, label: 'Shop', icon: Store },
    { num: 3, label: 'Location', icon: MapPin },
    { num: 4, label: 'Hours', icon: Clock },
    { num: 5, label: 'Licence', icon: FileText },
    { num: 6, label: 'Review', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-[#F5F9FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/signup" className="flex items-center gap-1 text-xs text-brand-navy font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Selection
          </Link>
          <Logo size="md" />
        </div>

        {/* Title */}
        <div className="bg-gradient-to-r from-brand-navy to-slate-800 text-white p-6 rounded-3xl shadow-card space-y-2">
          <Badge variant="teal" className="bg-brand-teal text-white border-none">
            Merchant Portal Onboarding
          </Badge>
          <h1 className="text-2xl font-black text-white">Merchant & Pharmacy Registration</h1>
          <p className="text-xs text-slate-300">
            Register your store on NearStock to enable local inventory search, reserve pickup holds & fulfill customer requests.
          </p>
        </div>

        {/* Multi-Step Progress Indicator */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between">
            {stepsList.map((s, idx) => {
              const Icon = s.icon;
              const isDone = step > s.num;
              const isCurrent = step === s.num;

              return (
                <div key={s.num} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-extrabold text-xs transition-all ${
                      isCurrent
                        ? 'bg-brand-teal text-white shadow-md scale-110'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      isCurrent ? 'text-brand-navy font-black' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Multi-Step Form Card */}
        <Card className="p-6 bg-white space-y-6">
          {/* STEP 1: OWNER DETAILS & AUTHENTICATION (Requirements 8 & 17) */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900">Step 1: Owner / Contact & Password</h3>
                <p className="text-xs text-slate-500">Provide owner contact details and Firebase Auth account password.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    1. Owner / Authorized Person Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    2. Primary Mobile Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    3. Email Address (Firebase Auth Login) *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="owner@pharmacy.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    6. Alternate Mobile Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.alternateMobile}
                    onChange={(e) => handleChange('alternateMobile', e.target.value)}
                    placeholder="+91 98765 00000"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    4. Password *
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    5. Confirm Password *
                  </label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SHOP DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900">Step 2: Shop Details</h3>
                <p className="text-xs text-slate-500">Define your shop category, description and photo.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      5. Shop Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.shopName}
                      onChange={(e) => handleChange('shopName', e.target.value)}
                      placeholder="e.g. Greenway Pharmacy"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      6. Shop Category *
                    </label>
                    <select
                      value={formData.shopCategory}
                      onChange={(e) => handleChange('shopCategory', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                    >
                      <option value="Pharmacy">Pharmacy / Chemist (Rx Medicines)</option>
                      <option value="Medical Supplies">Medical Equipment & Supplies</option>
                      <option value="Retail">Retail Store</option>
                      <option value="General Store">General Healthcare Store</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    7. Shop Description
                  </label>
                  <textarea
                    value={formData.shopDescription}
                    onChange={(e) => handleChange('shopDescription', e.target.value)}
                    rows={3}
                    placeholder="Describe your pharmacy services, emergency delivery, or specialization..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    8. Shop Photo / Logo (Image Preview)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {formData.shopLogoUrl ? (
                        <Image src={formData.shopLogoUrl} alt="Logo Preview" fill className="object-cover" />
                      ) : (
                        <Store className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        type="url"
                        value={formData.shopLogoUrl}
                        onChange={(e) => handleChange('shopLogoUrl', e.target.value)}
                        placeholder="Paste Image URL or select sample..."
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Upload or paste high quality storefront image URL for customer search view.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ADDRESS & MAP LOCATION (NO Visible Lat/Lng fields) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900">Step 3: Shop Address & Map Location</h3>
                <p className="text-xs text-slate-500">Provide physical store address and interactive map location pin.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    9. Building / Shop Number *
                  </label>
                  <Input
                    type="text"
                    value={formData.buildingNo}
                    onChange={(e) => handleChange('buildingNo', e.target.value)}
                    placeholder="e.g. Shop #42, Ground Floor"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    10. Street / Road *
                  </label>
                  <Input
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                    placeholder="e.g. Greenway Avenue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    11. Locality / Area
                  </label>
                  <Input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => handleChange('locality', e.target.value)}
                    placeholder="e.g. Ward 5, Central Park"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    12. City / Town
                  </label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Bengaluru"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    13. District
                  </label>
                  <Input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    placeholder="Bengaluru Urban"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    14. State
                  </label>
                  <Input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="Karnataka"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    15. PIN Code *
                  </label>
                  <Input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => handleChange('pinCode', e.target.value)}
                    placeholder="560001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    16. Landmark
                  </label>
                  <Input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => handleChange('landmark', e.target.value)}
                    placeholder="Opposite Metro Station"
                  />
                </div>
              </div>

              {/* Map Location Pin & Google Maps Link */}
              <div className="space-y-3 pt-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  17. Shop Location Pin (Interactive Google Map Pin)
                </label>
                <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                  <GoogleMapContainer
                    userLocation={userLocation}
                    radiusKm={5}
                    stores={[]}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    18. Google Maps Location Link
                  </label>
                  <Input
                    type="url"
                    value={formData.googleMapsLink}
                    onChange={(e) => handleChange('googleMapsLink', e.target.value)}
                    placeholder="e.g. https://maps.google.com/?q=12.9752,77.5982"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BUSINESS HOURS */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900">Step 4: Business Hours & Pickup Instructions</h3>
                <p className="text-xs text-slate-500">Define daily opening hours and customer pickup guidelines.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
                    19. Working Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                      const isChecked = formData.workingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleWorkingDayToggle(day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isChecked
                              ? 'bg-brand-teal text-white border-brand-teal'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      20. Opening Time
                    </label>
                    <Input
                      type="time"
                      value={formData.openingTime}
                      onChange={(e) => handleChange('openingTime', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      21. Closing Time
                    </label>
                    <Input
                      type="time"
                      value={formData.closingTime}
                      onChange={(e) => handleChange('closingTime', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      22. Weekly Holiday
                    </label>
                    <Input
                      type="text"
                      value={formData.weeklyHoliday}
                      onChange={(e) => handleChange('weeklyHoliday', e.target.value)}
                      placeholder="e.g. Sunday or None"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    23. Pickup Instructions for Customers
                  </label>
                  <textarea
                    value={formData.pickupInstructions}
                    onChange={(e) => handleChange('pickupInstructions', e.target.value)}
                    rows={2}
                    placeholder="Instructions shown to customers when reserving stock (e.g. Show passcode at counter 1)..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl p-3 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: BUSINESS & PHARMACY LICENCE INFORMATION */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900">Step 5: Business Information & Licence</h3>
                <p className="text-xs text-slate-500">Provide legal business registration and pharmacy licence documents.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    24. GSTIN (GST Number)
                  </label>
                  <Input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => handleChange('gstin', e.target.value)}
                    placeholder="29AAAAA0000A1Z5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    25. Business Registration / Trade Licence No.
                  </label>
                  <Input
                    type="text"
                    value={formData.businessLicenceNo}
                    onChange={(e) => handleChange('businessLicenceNo', e.target.value)}
                    placeholder="BL-987654321"
                  />
                </div>
              </div>

              {/* PHARMACY SPECIFIC FIELDS (Requirements 9 & 26-30) */}
              {formData.shopCategory === 'Pharmacy' && (
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-4 pt-4 mt-2">
                  <span className="text-xs font-extrabold text-emerald-900 block flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Pharmacy Category Requirements (Strict Verification)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                        26. Drug Licence Number *
                      </label>
                      <Input
                        type="text"
                        value={formData.drugLicenceNo}
                        onChange={(e) => handleChange('drugLicenceNo', e.target.value)}
                        placeholder="KA-BL-20B-123456"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                        27. Drug Licence Expiry Date
                      </label>
                      <Input
                        type="date"
                        value={formData.drugLicenceExpiry}
                        onChange={(e) => handleChange('drugLicenceExpiry', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                        29. Registered Pharmacist Name *
                      </label>
                      <Input
                        type="text"
                        value={formData.pharmacistName}
                        onChange={(e) => handleChange('pharmacistName', e.target.value)}
                        placeholder="e.g. Pharmacist Ramesh"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                        30. Pharmacist Registration Number
                      </label>
                      <Input
                        type="text"
                        value={formData.pharmacistRegNo}
                        onChange={(e) => handleChange('pharmacistRegNo', e.target.value)}
                        placeholder="KSPC-65432"
                      />
                    </div>
                  </div>

                  {/* 28. Drug Licence Document Upload */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                      28. Drug Licence Document (Private PDF / Image Upload)
                    </label>
                    <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Upload className="w-4 h-4 text-brand-teal" />
                        <span className="font-semibold">
                          {formData.drugLicenceDocUrl ? 'Licence Attached ✓' : 'Upload Drug Licence File'}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="teal"
                        onClick={() => {
                          handleChange('drugLicenceDocUrl', 'https://nearstock.app/docs/drug-licence-demo.pdf');
                          alert('Drug Licence document uploaded & securely attached.');
                        }}
                      >
                        {formData.drugLicenceDocUrl ? 'Attached' : 'Choose Document'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: REVIEW & SUBMIT + CONSENTS */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900">Step 6: Review & Submit Application</h3>
                <p className="text-xs text-slate-500">Review your registration information before final submission.</p>
              </div>

              {/* Information Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span>Owner & Shop Info</span>
                  <Badge variant="teal">{formData.shopCategory}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><strong>Owner:</strong> {formData.ownerName} ({formData.mobile})</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                  <div><strong>Shop Name:</strong> {formData.shopName}</div>
                  <div><strong>Address:</strong> {formData.buildingNo}, {formData.street}, {formData.city} - {formData.pinCode}</div>
                  <div><strong>Hours:</strong> {formData.openingTime} - {formData.closingTime}</div>
                  {formData.shopCategory === 'Pharmacy' && (
                    <div><strong>Drug Licence:</strong> {formData.drugLicenceNo || 'Attached'}</div>
                  )}
                </div>
              </div>

              {/* Consents (Requirements 10 & 31-32) */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                    className="mt-0.5 rounded text-brand-teal focus:ring-brand-teal"
                  />
                  <span className="text-xs text-slate-700">
                    31. I accept the <strong>NearStock Merchant Terms & Partner Operating Agreement</strong>.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacyAccepted}
                    onChange={(e) => handleChange('privacyAccepted', e.target.checked)}
                    className="mt-0.5 rounded text-brand-teal focus:ring-brand-teal"
                  />
                  <span className="text-xs text-slate-700">
                    32. I accept the <strong>NearStock Privacy Policy</strong> and confirm authorized representation of the store.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Form Actions Toolbar (Requirement 11) */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
            {step > 1 ? (
              <Button type="button" variant="outline" size="md" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => alert('Draft saved locally.')}
                className="text-slate-600 gap-1"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>

              {step < 6 ? (
                <Button type="button" variant="teal" size="md" onClick={handleNext} className="gap-1 font-extrabold">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="teal"
                  size="lg"
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                  className="gap-2 font-black shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Registration
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
