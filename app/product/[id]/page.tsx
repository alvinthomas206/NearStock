'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { formatCurrency, formatDistanceKm } from '@/lib/utils';
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Navigation,
  Phone,
  Store as StoreIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { products, stores } = useApp();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="font-bold text-slate-800 text-lg">Product Not Found</h3>
        <Link href="/search">
          <Button variant="teal" size="sm">
            Back to Search
          </Button>
        </Link>
      </div>
    );
  }

  const store = stores.find((s) => s.id === product.storeId);
  const isAvailable = product.stock > 0;

  const openDirections = () => {
    if (store) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <Badge variant="teal">{product.category}</Badge>
      </div>

      {/* Main Image Banner */}
      <div className="relative w-full h-56 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-soft">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-contain p-4" />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
        )}

        {/* Rx Badge */}
        {product.requiresPrescription && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Prescription Required</span>
          </div>
        )}
      </div>

      {/* Title & Pricing */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-snug">{product.name}</h1>
            {product.brand && (
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Brand: {product.brand}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-brand-navy">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
          {product.description}
        </p>

        {/* Stock Status & Freshness Indicator (NS-10) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-700 block">Stock Status:</span>
            <span className="text-[10px] text-slate-400 font-semibold block">Last Stock Sync: 15 mins ago</span>
          </div>
          {isAvailable ? (
            <Badge variant="success" className="px-3 py-1 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {product.stock} units in stock
            </Badge>
          ) : (
            <Badge variant="danger" className="px-3 py-1 text-xs">
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Out of stock
            </Badge>
          )}
        </div>
      </div>

      {/* Store Location Card */}
      {store && (
        <Card className="p-4 bg-gradient-to-br from-white to-slate-50 border-brand-teal/30">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2.5 bg-brand-tealLight text-brand-teal rounded-2xl shrink-0">
              <StoreIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">{store.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{store.formattedAddress}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-brand-teal font-bold text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  {formatDistanceKm(store.distanceKm)}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">● Open Now</span>
                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">★ {store.rating || 4.8} (Demo)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <a
              href={`tel:${store.phone}`}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              Call Pharmacy
            </a>
            <Button size="sm" variant="outline" onClick={openDirections} className="gap-1.5 text-xs">
              <Navigation className="w-3.5 h-3.5 text-brand-teal" />
              Directions
            </Button>
          </div>
        </Card>
      )}

      {/* Dynamic Exact Product Comparison Panel (NS-08) */}
      <Card className="p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <StoreIcon className="w-4 h-4 text-brand-teal" />
            <span>Compare Exact Product Nearby</span>
          </h3>
          <span className="text-[10px] font-bold text-brand-teal bg-brand-tealLight px-2 py-0.5 rounded-full">
            Canonical Matching
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Comparing availability & price for &quot;{product.name}&quot; across local verified pharmacies:
        </p>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
          {products
            .filter(
              (p) =>
                p.category === product.category &&
                (p.name.toLowerCase().includes(product.name.toLowerCase()) ||
                  product.name.toLowerCase().includes(p.name.toLowerCase()))
            )
            .map((compProd) => {
              const compStore = stores.find((s) => s.id === compProd.storeId);
              const compAvailable = compProd.stock > 0;
              return (
                <div
                  key={compProd.id}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">
                      {compStore?.name || 'Local Pharmacy'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {compProd.brand ? `${compProd.brand} • ` : ''}
                      {formatDistanceKm(compStore?.distanceKm)} away
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-black text-brand-navy block">
                        {formatCurrency(compProd.price)}
                      </span>
                      <span
                        className={`text-[10px] font-bold block ${
                          compAvailable ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        {compAvailable ? `${compProd.stock} in stock` : 'Out of Stock'}
                      </span>
                    </div>

                    <Link href={`/reserve/${compProd.id}/${compProd.storeId}`}>
                      <Button
                        size="sm"
                        variant={compAvailable ? 'teal' : 'ghost'}
                        disabled={!compAvailable}
                        className="text-xs px-2.5 py-1 h-8"
                      >
                        Reserve
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Action Footer Button */}
      <div className="pt-2">
        <Link href={`/reserve/${product.id}/${product.storeId}`}>
          <Button
            variant="teal"
            size="lg"
            disabled={!isAvailable}
            className="w-full gap-2 shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isAvailable ? 'Reserve for Pickup (Hold 30 Mins)' : 'Item Out of Stock'}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
