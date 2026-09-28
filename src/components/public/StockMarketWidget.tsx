'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import LiveDataStatus from './LiveDataStatus';
import { StockMarketResponse } from '@/lib/live-data/types';

export default function StockMarketWidget() {
  const [market, setMarket] = useState<StockMarketResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarket = async () => {
    try {
      const res = await fetch('/api/live/markets');
      const json = await res.json();
      if (json.success && json.data) {
        setMarket(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch stock market data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();

    // Listen for live SSE updates
    let eventSource: EventSource | null = null;
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        eventSource = new EventSource('/api/live/stream');
        eventSource.addEventListener('market', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (data?.indices) setMarket(data);
          } catch (_) {}
        });
      } catch (_) {}
    }

    // Refresh every 60s if market is open
    const interval = setInterval(() => {
      if (market?.marketSession.state === 'OPEN') {
        fetchMarket();
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-3 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/2" />
        <div className="h-16 bg-slate-950 rounded-xl" />
      </div>
    );
  }

  if (!market || !market.indices?.sensex) return null;

  const { sensex, nifty50 } = market.indices;
  const isMarketClosed = market.marketSession.state !== 'OPEN';

  return (
    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
      {/* Header */}
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

      {/* Session State Bar */}
      <div className="flex items-center justify-between text-[11px]">
        <LiveDataStatus
          status={market.meta?.freshnessStatus || (isMarketClosed ? 'FRESH' : 'LIVE')}
          updatedAt={market.meta?.providerUpdatedAt}
          marketClosed={isMarketClosed}
          marketClosedText={market.marketSession.labelHindi}
        />
        {market.marketSession.nextSessionTime && (
          <span className="text-[10px] text-slate-400">
            {market.marketSession.nextSessionTime}
          </span>
        )}
      </div>

      {/* Indices Grid: SENSEX & NIFTY 50 */}
      <div className="grid grid-cols-2 gap-2">
        {/* SENSEX */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block">BSE SENSEX</span>
          <span className="text-sm font-mono font-black text-white block">
            {sensex.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-0.5 ${
                sensex.isUp
                  ? 'text-emerald-400 bg-emerald-950 border-emerald-800'
                  : 'text-red-400 bg-red-950 border-red-800'
              }`}
            >
              {sensex.isUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
              <span>
                {sensex.change >= 0 ? '+' : ''}{sensex.change.toFixed(2)} ({sensex.changePercent}%)
              </span>
            </span>
          </div>
        </div>

        {/* NIFTY 50 */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block">NSE NIFTY 50</span>
          <span className="text-sm font-mono font-black text-white block">
            {nifty50.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-0.5 ${
                nifty50.isUp
                  ? 'text-emerald-400 bg-emerald-950 border-emerald-800'
                  : 'text-red-400 bg-red-950 border-red-800'
              }`}
            >
              {nifty50.isUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
              <span>
                {nifty50.change >= 0 ? '+' : ''}{nifty50.change.toFixed(2)} ({nifty50.changePercent}%)
              </span>
            </span>
          </div>
        </div>
      </div>

      {market.meta?.providerName && (
        <div className="text-[9px] text-slate-500 text-right font-medium">
          स्त्रोत: {market.meta.providerName}
        </div>
      )}
    </div>
  );
}
