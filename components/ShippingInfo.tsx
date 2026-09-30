'use client'

import { Truck, Clock, Shield, Package } from 'lucide-react'

interface ShippingInfoProps {
  shipping_cost: number;
  shipping_time_min?: number;
  shipping_time_max?: number;
  free_shipping_over?: number;
  ships_from?: string;
  product_price: number;
}

export default function ShippingInfo({ 
  shipping_cost, 
  shipping_time_min, 
  shipping_time_max,
  free_shipping_over,
  ships_from,
  product_price
}: ShippingInfoProps) {
  const isFreeShipping = free_shipping_over !== null && product_price >= (free_shipping_over || Infinity);
  
  const formatShippingTime = () => {
    if (!shipping_time_min && !shipping_time_max) return null;
    const min = shipping_time_min || shipping_time_max;
    const max = shipping_time_max || shipping_time_min;
    if (min === max) return `${min} days`;
    return `${min}–${max} days`;
  };

  return (
    <div className="space-y-4">
      {/* Delivery estimate */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-noir-900/30 border border-noir-800">
        <Truck className="text-rose shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm font-medium text-noir-100">
            {isFreeShipping ? 'Free shipping' : `$${shipping_cost.toFixed(2)} shipping`}
          </p>
          {formatShippingTime() && (
            <p className="text-xs text-noir-400 mt-0.5">
              Estimated delivery: <span className="text-emerald-400">{formatShippingTime()}</span>
            </p>
          )}
          {ships_from && (
            <p className="text-xs text-noir-500 mt-1">
              Ships from {ships_from}
            </p>
          )}
          {!isFreeShipping && free_shipping_over && (
            <p className="text-xs text-noir-500 mt-1">
              Free shipping on orders over ${free_shipping_over}
            </p>
          )}
        </div>
      </div>

      {/* Policies */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-noir-900/20">
          <Shield className="text-rose" size={16} />
          <span className="text-xs text-noir-300">Purchase protection</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-noir-900/20">
          <Package className="text-rose" size={16} />
          <span className="text-xs text-noir-300">Discreet packaging</span>
        </div>
      </div>
    </div>
  );
}
