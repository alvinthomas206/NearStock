'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Package, Plus, Search, Edit, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function MerchantProductsPage() {
  const { user, stores, products, updateStock } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const merchantStoreIds = stores
    .filter((s) => s.ownerId === user?.id || s.id === `store-${user?.id?.substring(0, 8)}`)
    .map((s) => s.id);
  const primaryStoreId = merchantStoreIds[0] || (user?.id ? `store-${user.id.substring(0, 8)}` : '');
  const allowedStoreIds = user?.role === 'ADMIN' ? stores.map((s) => s.id) : (merchantStoreIds.length > 0 ? merchantStoreIds : [primaryStoreId]);

  const merchantProducts = products.filter((p) => allowedStoreIds.includes(p.storeId));

  const filtered = merchantProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Products Catalog</h1>
          <p className="text-xs text-slate-500">Manage products, pricing, categories, and active availability status.</p>
        </div>

        <Link href="/merchant/products/new">
          <Button variant="teal" size="md" className="gap-2 shadow-md shrink-0">
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {/* Search toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by product name, category, SKU..."
          icon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">SKU / Rx</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4 text-right">Quick Stock Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <span className="font-extrabold text-slate-900 block text-sm">{prod.name}</span>
                    <span className="text-[10px] text-slate-400">{prod.brand || 'Generic'}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{prod.category}</Badge>
                  </td>
                  <td className="p-4 font-black text-brand-navy">
                    {formatCurrency(prod.price)}
                  </td>
                  <td className="p-4">
                    {prod.stock > 0 ? (
                      <Badge variant={prod.stock <= 3 ? 'warning' : 'success'}>
                        {prod.stock} in stock
                      </Badge>
                    ) : (
                      <Badge variant="danger">Out of Stock</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-slate-500 block">{prod.sku || 'N/A'}</span>
                    {prod.requiresPrescription && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        <ShieldAlert className="w-3 h-3" /> Rx Req
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 text-[11px]">
                    {formatDateTime(prod.updatedAt)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => updateStock(prod.id, Math.max(0, prod.stock - 1))}
                        className="w-7 h-7 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-slate-700"
                        title="Decrease Stock"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold">{prod.stock}</span>
                      <button
                        onClick={() => updateStock(prod.id, prod.stock + 1)}
                        className="w-7 h-7 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-slate-700"
                        title="Increase Stock"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
