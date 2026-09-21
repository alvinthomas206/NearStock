'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatCurrency, formatDistanceKm } from '@/lib/utils';
import { MapPin, ShoppingBag, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isAvailable = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <Card className="p-4 hover:border-brand-teal/40 transition-all flex flex-col justify-between">
      <div>
        {/* Product Image & Badges */}
        <div className="relative w-full h-36 bg-slate-100 rounded-xl overflow-hidden mb-3">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              No Image
            </div>
          )}

          {/* Rx Badge */}
          {product.requiresPrescription && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldAlert className="w-3 h-3" />
              <span>Prescription Req.</span>
            </div>
          )}

          {/* Stock Availability Pill */}
          <div className="absolute bottom-2 left-2">
            {isAvailable ? (
              <Badge variant={isLowStock ? 'warning' : 'success'} className="shadow-sm">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {product.stock} in stock
              </Badge>
            ) : (
              <Badge variant="danger" className="shadow-sm">
                <XCircle className="w-3 h-3 mr-1" />
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        {/* Store Name & Distance */}
        {product.store && (
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700 truncate max-w-[150px]">
              {product.store.name}
            </span>
            <span className="flex items-center gap-1 text-brand-teal font-medium">
              <MapPin className="w-3 h-3" />
              {formatDistanceKm(product.distanceKm ?? product.store.distanceKm)}
            </span>
          </div>
        )}

        {/* Product Title & Brand */}
        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
          {product.name}
        </h3>
        {product.brand && (
          <p className="text-xs text-slate-400 font-medium mb-2">{product.brand}</p>
        )}
      </div>

      {/* Price & Action Button */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Price</span>
          <span className="text-lg font-extrabold text-brand-navy">
            {formatCurrency(product.price)}
          </span>
        </div>

        <Link href={`/product/${product.id}`}>
          <Button
            size="sm"
            variant={isAvailable ? 'teal' : 'outline'}
            className="gap-1.5 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAvailable ? 'Reserve' : 'View Details'}</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
};
