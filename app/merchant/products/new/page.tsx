'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Package, Plus, Save, ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Medical Devices');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [sku, setSku] = useState(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [barcode, setBarcode] = useState('');
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await addProduct({
      name,
      category,
      subcategory,
      brand,
      description,
      price: Number(price),
      stock: Number(stock),
      sku,
      barcode,
      requiresPrescription,
      image: imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    });
    setIsLoading(false);
    router.push('/merchant/products');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Add New Product</h1>
          <p className="text-xs text-slate-500">Create product listing with pricing, inventory, and prescription flags.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Product Title / Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Omron Digital Thermometer"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-teal focus:outline-none"
            >
              <option value="Medical Devices">Medical Devices</option>
              <option value="Emergency & First Aid">Emergency & First Aid</option>
              <option value="Medicines">Medicines</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Baby Care">Baby Care</option>
              <option value="Supplements">Supplements & Vitamins</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Brand Name
            </label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Omron, HealthCheck"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Retail Price (₹ INR)
            </label>
            <Input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="199"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Initial Stock Units
            </label>
            <Input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="10"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              SKU Code
            </label>
            <Input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="SKU-9821"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Product Image URL
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Product Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write detailed usage instructions, features..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-brand-teal focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
            <input
              type="checkbox"
              id="prescriptionCheck"
              checked={requiresPrescription}
              onChange={(e) => setRequiresPrescription(e.target.checked)}
              className="w-4 h-4 text-brand-teal rounded accent-brand-teal"
            />
            <label htmlFor="prescriptionCheck" className="font-bold text-amber-900 cursor-pointer">
              Requires Doctor Prescription Upload (Rx Mandatory)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" variant="teal" size="lg" isLoading={isLoading} className="gap-2 shadow-md">
            <Save className="w-4 h-4" />
            <span>Publish Product to Catalog</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
