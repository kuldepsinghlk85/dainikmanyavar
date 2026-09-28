'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coins, ArrowRight } from 'lucide-react';
import LiveDataStatus from './LiveDataStatus';
import { BullionRatesResponse } from '@/lib/live-data/types';

export default function GoldSilverWidget() {
  const [rates, setRates] = useState<BullionRatesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/live/bullion');
      const json = await res.json();
      if (json.success && json.data) {
        setRates(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch bullion rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();

    // Listen for live SSE updates
    let eventSource: EventSource | null = null;
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        eventSource = new EventSource('/api/live/stream');
        eventSource.addEventListener('bullion', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (data?.gold24K) setRates(data);
          } catch (_) {}
        });
      } catch (_) {}
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-amber-500 text-white p-5 rounded-2xl shadow-md space-y-3 animate-pulse">
        <div className="h-4 bg-amber-400 rounded w-2/3" />
        <div className="h-14 bg-amber-400/50 rounded-xl" />
      </div>
    );
  }

  if (!rates || !rates.gold24K) return null;

  return (
    <div className="bg-amber-500 text-white p-5 rounded-2xl shadow-md space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-amber-400 pb-2">
        <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-yellow-100">
          <Coins className="w-4 h-4 text-yellow-100" />
          <span>सोना-चांदी भाव (Bullion Rates)</span>
        </h3>
        <Link href="/gold-silver" className="text-xs text-amber-950 font-extrabold hover:underline flex items-center gap-1">
          <span>सभी शहर</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <LiveDataStatus
            status={rates.meta?.freshnessStatus || 'FRESH'}
            updatedAt={rates.meta?.providerUpdatedAt}
            className="text-amber-950"
          />
          <span className="text-[10px] text-amber-950 font-bold">
            {rates.gold24K.city || 'वाराणसी / उत्तर प्रदेश'}
          </span>
        </div>

        {/* Rates Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* 24K Gold */}
          <div className="bg-white/20 p-2.5 rounded-xl border border-white/30 text-xs">
            <span className="text-[10px] font-bold text-amber-950 block">24K शुद्ध सोना / 10g</span>
            <span className="font-mono font-black text-white text-base">
              ₹{rates.gold24K.price.toLocaleString('hi-IN')}
            </span>
            {rates.gold24K.change !== 0 && (
              <span className={`text-[10px] font-bold block ${rates.gold24K.change > 0 ? 'text-amber-950' : 'text-stone-900'}`}>
                {rates.gold24K.change > 0 ? '▲' : '▼'} ₹{Math.abs(rates.gold24K.change)}
              </span>
            )}
          </div>

          {/* Silver */}
          <div className="bg-white/20 p-2.5 rounded-xl border border-white/30 text-xs">
            <span className="text-[10px] font-bold text-amber-950 block">चांदी (Silver) / 1kg</span>
            <span className="font-mono font-black text-white text-base">
              ₹{rates.silver.price.toLocaleString('hi-IN')}
            </span>
            {rates.silver.change !== 0 && (
              <span className={`text-[10px] font-bold block ${rates.silver.change > 0 ? 'text-amber-950' : 'text-stone-900'}`}>
                {rates.silver.change > 0 ? '▲' : '▼'} ₹{Math.abs(rates.silver.change)}
              </span>
            )}
          </div>
        </div>

        {rates.meta?.providerName && (
          <div className="text-[9px] text-amber-900 text-right font-medium">
            स्त्रोत: {rates.meta.providerName}
          </div>
        )}
      </div>
    </div>
  );
}
