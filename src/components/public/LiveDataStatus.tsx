'use client';

import React from 'react';
import { FreshnessStatus, MarketSessionState } from '@/lib/live-data/types';
import { Clock, AlertCircle } from 'lucide-react';

interface LiveDataStatusProps {
  status: FreshnessStatus;
  updatedAt?: string | Date;
  isDelayed?: boolean;
  delayMinutes?: number;
  marketClosed?: boolean;
  marketClosedText?: string;
  marketState?: MarketSessionState;
  className?: string;
}

export default function LiveDataStatus({
  status,
  updatedAt,
  isDelayed = false,
  delayMinutes,
  marketClosed = false,
  marketClosedText,
  marketState,
  className = '',
}: LiveDataStatusProps) {
  const formatTime = (dt?: string | Date) => {
    if (!dt) return '';
    try {
      const d = new Date(dt);
      return d.toLocaleTimeString('hi-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  const timeStr = formatTime(updatedAt);

  // Market State Override
  const isMarketClosed = marketClosed || (marketState && marketState !== 'OPEN');
  if (isMarketClosed) {
    const label =
      marketClosedText ||
      (marketState === 'WEEKEND'
        ? 'सप्ताहांत (बंद)'
        : marketState === 'HOLIDAY'
        ? 'अवकाश (बंद)'
        : marketState === 'PRE_OPEN'
        ? 'प्री-ओपन सत्र'
        : 'बाजार बंद');

    return (
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${className}`}>
        <span className="px-2 py-0.5 rounded-full bg-stone-700 text-stone-200 border border-stone-600">
          {label}
        </span>
        {timeStr && <span className="text-stone-400">अंतिम: {timeStr}</span>}
      </div>
    );
  }

  // 2. Delayed Feed
  if (isDelayed) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${className}`}>
        <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
          {delayMinutes ? `${delayMinutes} मि. विलंबित` : 'विलंबित (Delayed)'}
        </span>
        {timeStr && <span className="text-stone-400">{timeStr}</span>}
      </div>
    );
  }

  // 3. Status Badges
  switch (status) {
    case 'LIVE':
      return (
        <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${className}`}>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            LIVE
          </span>
          {timeStr && <span className="text-stone-300 font-mono">{timeStr}</span>}
        </div>
      );

    case 'FRESH':
      return (
        <div className={`inline-flex items-center gap-1 text-[10px] text-stone-300 font-medium ${className}`}>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold text-[9px]">
            ताज़ा भाव
          </span>
          {timeStr && <span className="text-stone-400">आज {timeStr}</span>}
        </div>
      );

    case 'STALE':
      return (
        <div className={`inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-medium ${className}`}>
          <Clock className="w-3 h-3 text-amber-400" />
          <span>अंतिम अपडेट: {timeStr || 'पूर्व सत्र'}</span>
        </div>
      );

    case 'UNAVAILABLE':
    default:
      return (
        <div className={`inline-flex items-center gap-1 text-[10px] text-stone-400 ${className}`}>
          <AlertCircle className="w-3 h-3 text-stone-500" />
          <span>डेटा अपडेट हो रहा है</span>
        </div>
      );
  }
}
