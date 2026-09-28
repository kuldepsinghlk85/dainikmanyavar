'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import LiveDataStatus from './LiveDataStatus';
import { NormalizedCricketMatch } from '@/lib/live-data/types';

export default function CricketWidget() {
  const [matches, setMatches] = useState<NormalizedCricketMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCricketData = async () => {
    try {
      const res = await fetch('/api/live/cricket');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMatches(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch cricket live data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCricketData();

    // Listen for live SSE events if available
    let eventSource: EventSource | null = null;
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        eventSource = new EventSource('/api/live/stream');
        eventSource.addEventListener('cricket', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (Array.isArray(data)) setMatches(data);
          } catch (_) {}
        });
      } catch (_) {}
    }

    // Fallback polling every 45s only if a match is LIVE
    const interval = setInterval(() => {
      if (matches.some((m) => m.matchStatus === 'LIVE')) {
        fetchCricketData();
      }
    }, 45000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-stone-900 text-white p-5 rounded-2xl border border-stone-800 shadow-md space-y-3 animate-pulse">
        <div className="h-4 bg-stone-800 rounded w-1/2" />
        <div className="h-10 bg-stone-800 rounded" />
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return null;
  }

  const liveMatch = matches.find((m) => m.matchStatus === 'LIVE');
  const displayMatch = liveMatch || matches[0];
  const isMatchLive = displayMatch.matchStatus === 'LIVE';

  return (
    <div className="bg-stone-900 text-white p-5 rounded-2xl border border-stone-800 shadow-md space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-stone-800 pb-2">
        <h3 className="font-extrabold text-sm flex items-center gap-2 text-amber-400">
          <Trophy className="w-4 h-4" />
          <span>{isMatchLive ? 'क्रिकेट लाइव स्कोर (Live Match)' : 'क्रिकेट मैच अपडेट्स (Cricket)'}</span>
        </h3>
        <Link href="/cricket" className="text-xs text-orange-400 font-bold hover:underline flex items-center gap-1">
          <span>और देखें</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {/* Status & Tournament */}
        <div className="flex justify-between items-center text-[11px] text-stone-400">
          {isMatchLive ? (
            <LiveDataStatus
              status={displayMatch.meta?.freshnessStatus || 'LIVE'}
              updatedAt={displayMatch.meta?.providerUpdatedAt}
            />
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-bold text-[10px] border border-stone-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              मैच परिणाम (Final Result)
            </span>
          )}
          <span className="font-mono text-stone-400 truncate max-w-[140px] text-right">
            {displayMatch.tournament}
          </span>
        </div>

        {/* Match Title */}
        <h4 className="font-extrabold text-sm text-stone-100 line-clamp-1">{displayMatch.matchTitle}</h4>

        {/* Teams and Scores */}
        <div className="flex justify-between items-center text-xs font-mono py-2 px-3 bg-stone-950/80 rounded-xl border border-stone-800/80">
          <div className="flex flex-col">
            <span className="font-bold text-amber-300 text-sm">
              {displayMatch.teamA.code || displayMatch.teamA.name}
            </span>
            <span className="text-stone-300 text-xs font-medium">
              {displayMatch.teamA.score || '—'}
            </span>
          </div>

          <span className="text-stone-500 font-black text-xs">VS</span>

          <div className="flex flex-col text-right">
            <span className="font-bold text-amber-300 text-sm">
              {displayMatch.teamB.code || displayMatch.teamB.name}
            </span>
            <span className="text-stone-300 text-xs font-medium">
              {displayMatch.teamB.score || '—'}
            </span>
          </div>
        </div>

        {/* Status Text / Result */}
        <p className="text-[11px] text-orange-300 font-bold bg-stone-950 p-2 rounded-lg text-center leading-relaxed">
          {displayMatch.statusText || displayMatch.resultText || 'मैच समाप्त'}
        </p>

        {!isMatchLive && (
          <div className="text-[10px] text-stone-500 text-center italic">
            * वर्तमान में कोई लाइव अंतरराष्ट्रीय मुकाबला सक्रिय नहीं है।
          </div>
        )}

        {displayMatch.meta?.providerName && (
          <div className="text-[10px] text-stone-500 text-right">
            स्त्रोत: {displayMatch.meta.providerName}
          </div>
        )}
      </div>
    </div>
  );
}
