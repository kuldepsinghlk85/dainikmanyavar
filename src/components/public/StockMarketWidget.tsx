'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

export default function StockMarketWidget() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [live, setLive] = useState<any>({
    sensex: { value: '85,240.50', change: '+480.20 (+0.57%)', isUp: true },
  });

  useEffect(() => {
    fetch('/api/stock-market')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.data) setUpdates(data.data);
          if (data.live) setLive(data.live);
        }
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
          <span className="text-base font-mono font-black text-white">{live.sensex.value}</span>
        </div>
        <div className="text-right">
          <span className={`text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-0.5 ${
            live.sensex.isUp
              ? 'text-emerald-400 bg-emerald-950 border-emerald-800'
              : 'text-red-400 bg-red-950 border-red-800'
          }`}>
            {live.sensex.isUp ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>{live.sensex.change}</span>
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
