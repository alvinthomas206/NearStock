'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useApp } from '@/lib/store';
import { parseCoordinatesFromGoogleMapsLink } from '@/lib/utils';
import { GoogleMapContainer } from '@/components/maps/GoogleMapContainer';
import { LocationCoordinates } from '@/lib/types';
import {
  Store as StoreIcon,
  Phone,
  Clock,
  MapPin,
  Save,
  CheckCircle2,
  ShieldCheck,
  Lock,
  FileText,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MerchantStorePage() {
  const { user, stores, updateStoreProfile } = useApp();

  const reg = user?.merchantRegistration;
  const foundStore = stores.find((s) => s.ownerId === user?.id || s.id === `store-${user?.id?.substring(0, 8)}`);

  // Find store belonging to current merchant, merging signup/registration data
  const merchantStore = {
    id: foundStore?.id || `store-${user?.id?.substring(0, 8) || Date.now()}`,
    name: reg?.shopName || foundStore?.name || 'Pharmacy Store',
    category: foundStore?.category || reg?.shopCategory || 'Pharmacy',
    description: foundStore?.description || reg?.shopDescription || '',
    image: foundStore?.image || reg?.shopLogoUrl || 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=600',
    address: foundStore?.address || (reg ? `${reg.buildingNo || ''} ${reg.street || ''}`.trim() : user?.formattedAddress || ''),
    formattedAddress: foundStore?.formattedAddress || (reg ? `${reg.buildingNo || ''}, ${reg.street || ''}, ${reg.locality || ''}, ${reg.city || ''} ${reg.pinCode || ''}` : user?.formattedAddress || 'Bengaluru'),
    phone: foundStore?.phone || reg?.mobile || user?.mobile || '',
    alternateMobile: foundStore?.alternateMobile || reg?.alternateMobile || '',
    lat: foundStore?.lat || user?.locationLat || 12.9716,
    lng: foundStore?.lng || user?.locationLng || 77.5946,
    googlePlaceId: foundStore?.googlePlaceId || 'place_default',
    googleMapsLink: foundStore?.googleMapsLink || reg?.googleMapsLink || `https://maps.google.com/?q=${foundStore?.lat || user?.locationLat || 12.9716},${foundStore?.lng || user?.locationLng || 77.5946}`,
    buildingNo: foundStore?.buildingNo || reg?.buildingNo || '',
    street: foundStore?.street || reg?.street || '',
    locality: foundStore?.locality || reg?.locality || '',
    city: foundStore?.city || reg?.city || 'Bengaluru',
    district: foundStore?.district || reg?.district || '',
    state: foundStore?.state || reg?.state || 'Karnataka',
    pinCode: foundStore?.pinCode || reg?.pinCode || '',
    landmark: foundStore?.landmark || reg?.landmark || '',
    workingDays: foundStore?.workingDays || reg?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    openingTime: foundStore?.openingTime || reg?.openingTime || '08:00',
    closingTime: foundStore?.closingTime || reg?.closingTime || '22:00',
    openingHours: foundStore?.openingHours || (reg ? `${reg.openingTime || '08:00'} - ${reg.closingTime || '22:00'}` : '08:00 AM - 10:00 PM'),
    weeklyHoliday: foundStore?.weeklyHoliday || reg?.weeklyHoliday || 'Sunday',
    pickupInstructions: foundStore?.pickupInstructions || reg?.pickupInstructions || 'Show 4-digit passcode at counter.',
    gstin: foundStore?.gstin || reg?.gstin || '',
    businessLicenceNo: foundStore?.businessLicenceNo || reg?.businessLicenceNo || '',
    drugLicenceNo: foundStore?.drugLicenceNo || reg?.drugLicenceNo || '',
    drugLicenceExpiry: foundStore?.drugLicenceExpiry || reg?.drugLicenceExpiry || '',
    drugLicenceDocUrl: foundStore?.drugLicenceDocUrl || reg?.drugLicenceDocUrl || '',
    pharmacistName: foundStore?.pharmacistName || reg?.pharmacistName || '',
    pharmacistRegNo: foundStore?.pharmacistRegNo || reg?.pharmacistRegNo || '',
    ownerId: user?.id || '',
    status: foundStore?.status || user?.merchantStatus || 'PENDING',
  };

  // Editable Form State
  const [shopName, setShopName] = useState(merchantStore.name || '');
  const [shopDescription, setShopDescription] = useState(merchantStore.description || '');
  const [shopLogoUrl, setShopLogoUrl] = useState(merchantStore.image || 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=600');
  const [phone, setPhone] = useState(merchantStore.phone || user?.mobile || '');
  const [alternateMobile, setAlternateMobile] = useState(merchantStore.alternateMobile || '');
  const [address, setAddress] = useState(merchantStore.address || '');
  const [googleMapsLink, setGoogleMapsLink] = useState(merchantStore.googleMapsLink || `https://maps.google.com/?q=${merchantStore.lat},${merchantStore.lng}`);
  
  const [location, setLocation] = useState<LocationCoordinates>({
    lat: merchantStore.lat,
    lng: merchantStore.lng,
    formattedAddress: merchantStore.formattedAddress || merchantStore.address,
  });

  const [workingDays, setWorkingDays] = useState<string[]>(
    merchantStore.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  );
  const [openingTime, setOpeningTime] = useState(merchantStore.openingTime || '08:00');
  const [closingTime, setClosingTime] = useState(merchantStore.closingTime || '22:00');
  const [weeklyHoliday, setWeeklyHoliday] = useState(merchantStore.weeklyHoliday || 'Sunday');
  const [pickupInstructions, setPickupInstructions] = useState(merchantStore.pickupInstructions || 'Show 4-digit passcode at counter.');
  
  const [gstin, setGstin] = useState(merchantStore.gstin || '');
  const [businessLicenceNo, setBusinessLicenceNo] = useState(merchantStore.businessLicenceNo || '');

  // Pharmacy-specific fields
  const [drugLicenceNo, setDrugLicenceNo] = useState(merchantStore.drugLicenceNo || '');
  const [drugLicenceExpiry, setDrugLicenceExpiry] = useState(merchantStore.drugLicenceExpiry || '');
  const [drugLicenceDocUrl, setDrugLicenceDocUrl] = useState(merchantStore.drugLicenceDocUrl || '');
  const [pharmacistName, setPharmacistName] = useState(merchantStore.pharmacistName || '');
  const [pharmacistRegNo, setPharmacistRegNo] = useState(merchantStore.pharmacistRegNo || '');

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-extract latitude and longitude whenever the Google Maps Link changes
  const handleGoogleMapsLinkChange = (linkVal: string) => {
    setGoogleMapsLink(linkVal);
    const parsedCoords = parseCoordinatesFromGoogleMapsLink(linkVal);
    if (parsedCoords) {
      setLocation((prev) => ({
        ...prev,
        lat: parsedCoords.lat,
        lng: parsedCoords.lng,
      }));
    }
  };

  // Sync uploaded registration data & merchantStore changes to form state
  React.useEffect(() => {
    if (merchantStore) {
      if (merchantStore.name) setShopName(merchantStore.name);
      if (merchantStore.description) setShopDescription(merchantStore.description);
      if (merchantStore.image) setShopLogoUrl(merchantStore.image);
      if (merchantStore.phone) setPhone(merchantStore.phone);
      if (merchantStore.alternateMobile) setAlternateMobile(merchantStore.alternateMobile);
      if (merchantStore.address) setAddress(merchantStore.address);
      if (merchantStore.googleMapsLink) {
        setGoogleMapsLink(merchantStore.googleMapsLink);
        const parsedCoords = parseCoordinatesFromGoogleMapsLink(merchantStore.googleMapsLink);
        if (parsedCoords) {
          setLocation({
            lat: parsedCoords.lat,
            lng: parsedCoords.lng,
            formattedAddress: merchantStore.formattedAddress || merchantStore.address || 'Bengaluru',
          });
        } else {
          setLocation({
            lat: merchantStore.lat || 12.9716,
            lng: merchantStore.lng || 77.5946,
            formattedAddress: merchantStore.formattedAddress || merchantStore.address || 'Bengaluru',
          });
        }
      } else {
        setLocation({
          lat: merchantStore.lat || 12.9716,
          lng: merchantStore.lng || 77.5946,
          formattedAddress: merchantStore.formattedAddress || merchantStore.address || 'Bengaluru',
        });
      }
      if (merchantStore.workingDays) setWorkingDays(merchantStore.workingDays);
      if (merchantStore.openingTime) setOpeningTime(merchantStore.openingTime);
      if (merchantStore.closingTime) setClosingTime(merchantStore.closingTime);
      if (merchantStore.weeklyHoliday) setWeeklyHoliday(merchantStore.weeklyHoliday);
      if (merchantStore.pickupInstructions) setPickupInstructions(merchantStore.pickupInstructions);

      // Section 4 Business Registration & Pharmacy Licence Information from Firebase
      setGstin(merchantStore.gstin || reg?.gstin || '');
      setBusinessLicenceNo(merchantStore.businessLicenceNo || reg?.businessLicenceNo || '');
      setDrugLicenceNo(merchantStore.drugLicenceNo || reg?.drugLicenceNo || '');
      setDrugLicenceExpiry(merchantStore.drugLicenceExpiry || reg?.drugLicenceExpiry || '');
      setDrugLicenceDocUrl(merchantStore.drugLicenceDocUrl || reg?.drugLicenceDocUrl || '');
      setPharmacistName(merchantStore.pharmacistName || reg?.pharmacistName || '');
      setPharmacistRegNo(merchantStore.pharmacistRegNo || reg?.pharmacistRegNo || '');
    }
  }, [foundStore, user]);

  const handleDayToggle = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await updateStoreProfile(merchantStore.id, {
      name: shopName,
      description: shopDescription,
      image: shopLogoUrl,
      phone,
      alternateMobile,
      address,
      formattedAddress: location.formattedAddress,
      lat: location.lat,
      lng: location.lng,
      googleMapsLink,
      workingDays,
      openingTime,
      closingTime,
      openingHours: `${openingTime} - ${closingTime}`,
      weeklyHoliday,
      pickupInstructions,
      gstin,
      businessLicenceNo,
      drugLicenceNo,
      drugLicenceExpiry,
      drugLicenceDocUrl,
      pharmacistName,
      pharmacistRegNo,
    });

    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Edit Store Profile</h1>
          <p className="text-xs text-slate-500">
            Update store information, operating hours, location pin, and pharmacy licence details.
          </p>
        </div>
        <Badge variant="teal" className="bg-brand-navy text-white px-3 py-1">
          Store Status: {merchantStore.status || 'APPROVED'}
        </Badge>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Store Profile Saved & Updated Successfully!</span>
        </div>
      )}

      {/* Protected Fields Notice (Requirement 10) */}
      <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          <strong>Protected System Fields:</strong> Owner ID ({merchantStore.ownerId || 'System'}), Approval Status, and Admin Roles cannot be modified directly.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: STORE IDENTIFICATION & DESCRIPTION */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            1. Store Identity & Description
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Shop Name *
              </label>
              <Input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Greenway Pharmacy"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Primary Phone Number *
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Alternate Mobile Number
              </label>
              <Input
                value={alternateMobile}
                onChange={(e) => setAlternateMobile(e.target.value)}
                placeholder="+91 98765 00000"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Shop Photo / Logo Image URL
              </label>
              <Input
                value={shopLogoUrl}
                onChange={(e) => setShopLogoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Shop Description
            </label>
            <textarea
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
              rows={3}
              placeholder="Describe services, emergency stock availability..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
            />
          </div>
        </Card>

        {/* SECTION 2: LOCATION & MAP PIN */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            2. Shop Address & Location Pin
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Street Address / Building
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="42 Greenway Avenue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Google Maps Location Link
              </label>
              <Input
                value={googleMapsLink}
                onChange={(e) => handleGoogleMapsLinkChange(e.target.value)}
                placeholder="https://maps.google.com/?q=12.9716,77.5946"
              />
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Extracted Pin Coordinates:</span>
                <span className="font-mono font-bold text-brand-teal bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Map Preview */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase">
              Google Maps Location Pin Preview
            </label>
            <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <GoogleMapContainer
                userLocation={{ lat: location.lat, lng: location.lng }}
                radiusKm={2}
                stores={[{ ...merchantStore, lat: location.lat, lng: location.lng, name: shopName }]}
              />
            </div>
          </div>
        </Card>

        {/* SECTION 3: WORKING HOURS & PICKUP INSTRUCTIONS */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            3. Business Hours & Pickup Guidelines
          </h3>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
              Working Days
            </label>
            <div className="flex flex-wrap gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const isChecked = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isChecked
                        ? 'bg-brand-teal text-white border-brand-teal shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Opening Time
              </label>
              <Input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Closing Time
              </label>
              <Input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Weekly Holiday
              </label>
              <Input
                value={weeklyHoliday}
                onChange={(e) => setWeeklyHoliday(e.target.value)}
                placeholder="Sunday"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Pickup Instructions for Customers
            </label>
            <textarea
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              rows={2}
              placeholder="Instructions displayed to customers when reserving stock..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl p-3 focus:outline-none"
            />
          </div>
        </Card>

        {/* SECTION 4: GSTIN & PHARMACY LICENCE INFORMATION */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            4. Business Registration & Pharmacy Licence Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                GSTIN (GST Number)
              </label>
              <Input
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="29AAAAA0000A1Z5"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Business Registration / Licence No.
              </label>
              <Input
                value={businessLicenceNo}
                onChange={(e) => setBusinessLicenceNo(e.target.value)}
                placeholder="BL-987654321"
              />
            </div>
          </div>

          <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-4 pt-4 mt-2">
            <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pharmacy Licence & Pharmacist Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                  Drug Licence Number
                </label>
                <Input
                  value={drugLicenceNo}
                  onChange={(e) => setDrugLicenceNo(e.target.value)}
                  placeholder="KA-BL-20B-123456"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                  Drug Licence Expiry Date
                </label>
                <Input
                  type="date"
                  value={drugLicenceExpiry}
                  onChange={(e) => setDrugLicenceExpiry(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                  Pharmacist Name
                </label>
                <Input
                  value={pharmacistName}
                  onChange={(e) => setPharmacistName(e.target.value)}
                  placeholder="Pharmacist Name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                  Pharmacist Registration Number
                </label>
                <Input
                  value={pharmacistRegNo}
                  onChange={(e) => setPharmacistRegNo(e.target.value)}
                  placeholder="KSPC-65432"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Action */}
        <Button
          type="submit"
          variant="teal"
          size="lg"
          isLoading={isLoading}
          className="w-full gap-2 shadow-lg font-black text-sm py-3"
        >
          <Save className="w-5 h-5" />
          <span>Save & Update Store Profile</span>
        </Button>
      </form>
    </div>
  );
}
