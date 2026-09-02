'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowUpRight, ArrowRight } from 'lucide-react';

export default function StockMarketWidget() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stock-market')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setUpdates(data.data);
      })
      .catch(() => {});
  }, []);

  const latest = updates[0];

  return (
    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-400">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>शेयर बाजार (Stock Market)</span>
        </h3>
        <Link href="/stock-market" className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1">
          <span>और देखें</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block">SENSEX</span>
          <span className="text-base font-mono font-black text-white">85,240.50</span>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>+480.20 (+0.57%)</span>
          </span>
        </div>
      </div>

      {latest && (
        <a href="/stock-market" className="block space-y-1 group">
          <h4 className="font-bold text-xs text-slate-200 group-hover:text-emerald-400 line-clamp-2 leading-snug">
            {latest.title}
          </h4>
        </a>
      )}
    </div>
  );
}
