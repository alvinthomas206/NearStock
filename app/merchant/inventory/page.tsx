'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Layers, AlertTriangle, XCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function MerchantInventoryPage() {
  const { user, stores, products, updateStock } = useApp();
  const [editingStock, setEditingStock] = useState<{ [id: string]: number }>({});

  const merchantStoreIds = stores
    .filter((s) => s.ownerId === user?.id || s.id === `store-${user?.id?.substring(0, 8)}`)
    .map((s) => s.id);
  const primaryStoreId = merchantStoreIds[0] || (user?.id ? `store-${user.id.substring(0, 8)}` : '');
  const allowedStoreIds = user?.role === 'ADMIN' ? stores.map((s) => s.id) : (merchantStoreIds.length > 0 ? merchantStoreIds : [primaryStoreId]);

  const merchantProducts = products.filter((p) => allowedStoreIds.includes(p.storeId));

  const handleStockChange = (id: string, val: number) => {
    setEditingStock((prev) => ({ ...prev, [id]: val }));
  };

  const saveStock = async (id: string) => {
    const newStock = editingStock[id];
    if (newStock !== undefined) {
      await updateStock(id, newStock);
      const updated = { ...editingStock };
      delete updated[id];
      setEditingStock(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Inventory Stock Matrix</h1>
        <p className="text-xs text-slate-500">Real-time stock management, low stock warnings & batch updates.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-emerald-50 border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase block">In Stock Items</span>
            <span className="text-2xl font-black text-emerald-950">
              {merchantProducts.filter((p) => p.stock > 3).length}
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </Card>

        <Card className="p-4 bg-amber-50 border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase block">Low Stock (&le; 3)</span>
            <span className="text-2xl font-black text-amber-950">
              {merchantProducts.filter((p) => p.stock > 0 && p.stock <= 3).length}
            </span>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </Card>

        <Card className="p-4 bg-rose-50 border-rose-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-800 uppercase block">Out of Stock (0)</span>
            <span className="text-2xl font-black text-rose-950">
              {merchantProducts.filter((p) => p.stock === 0).length}
            </span>
          </div>
          <XCircle className="w-8 h-8 text-rose-600" />
        </Card>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">Quick Real-time Stock Matrix</h3>
          <span className="text-xs text-slate-400">Updates sync instantly to search API</span>
        </div>

        <div className="divide-y divide-slate-100">
          {merchantProducts.map((prod) => {
            const currentEditVal = editingStock[prod.id] ?? prod.stock;

            return (
              <div key={prod.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{prod.name}</span>
                    <Badge variant={prod.stock === 0 ? 'danger' : prod.stock <= 3 ? 'warning' : 'success'}>
                      {prod.stock} units
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">Category: {prod.category} • SKU: {prod.sku || 'N/A'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={currentEditVal}
                    onChange={(e) => handleStockChange(prod.id, Number(e.target.value))}
                    className="w-24 text-center font-bold"
                  />
                  <Button
                    size="sm"
                    variant={editingStock[prod.id] !== undefined ? 'teal' : 'outline'}
                    onClick={() => saveStock(prod.id)}
                    disabled={editingStock[prod.id] === undefined}
                    className="text-xs"
                  >
                    Update
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
