'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coins, ArrowUpRight, ArrowRight } from 'lucide-react';

export default function GoldSilverWidget() {
  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/gold-silver')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setPrices(data.data);
      })
      .catch(() => {});
  }, []);

  const varanasi = prices.find((p) => p.city === 'वाराणसी') || prices[0];

  return (
    <div className="bg-amber-500 text-white p-5 rounded-2xl shadow-md space-y-3">
      <div className="flex justify-between items-center border-b border-amber-400 pb-2">
        <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-yellow-100">
          <Coins className="w-4 h-4 text-yellow-100" />
          <span>सोना-चांदी भाव (Commodity Rates)</span>
        </h3>
        <Link href="/gold-silver" className="text-xs text-amber-950 font-extrabold hover:underline flex items-center gap-1">
          <span>सभी शहर</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {varanasi && (
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-white/20 p-2.5 rounded-xl border border-white/30 text-xs">
            <div>
              <span className="text-[10px] font-bold text-amber-950 block">{varanasi.city} - 24K सोना</span>
              <span className="font-mono font-black text-white text-base">₹{varanasi.gold24K.toLocaleString('hi-IN')}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-950 block">चांदी / kg</span>
              <span className="font-mono font-black text-white text-base">₹{varanasi.silver.toLocaleString('hi-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
