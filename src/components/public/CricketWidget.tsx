'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Radio, ArrowRight } from 'lucide-react';

export default function CricketWidget() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/cricket')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setMatches(data.data);
      })
      .catch(() => {});
  }, []);

  if (!matches || matches.length === 0) return null;

  const liveMatch = matches.find((m) => m.matchStatus === 'LIVE') || matches[0];

  return (
    <div className="bg-stone-900 text-white p-5 rounded-2xl border border-stone-800 shadow-md space-y-3">
      <div className="flex justify-between items-center border-b border-stone-800 pb-2">
        <h3 className="font-extrabold text-sm flex items-center gap-2 text-amber-400">
          <Trophy className="w-4 h-4" />
          <span>क्रिकेट अपडेट (Cricket Live Scores)</span>
        </h3>
        <Link href="/cricket" className="text-xs text-orange-400 font-bold hover:underline flex items-center gap-1">
          <span>और देखें</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-[11px] text-stone-400 font-mono">
          <span className="bg-red-600 text-white px-2 py-0.2 rounded font-black text-[9px] animate-pulse">LIVE</span>
          <span>{liveMatch.tournament}</span>
        </div>

        <h4 className="font-extrabold text-sm text-stone-100 line-clamp-1">{liveMatch.matchTitle}</h4>

        <div className="flex justify-between items-center text-xs font-mono py-1">
          <span className="font-bold text-amber-300">{liveMatch.teamA} {liveMatch.scoreA}</span>
          <span className="text-stone-500 font-black">vs</span>
          <span className="font-bold text-amber-300">{liveMatch.teamB} {liveMatch.scoreB}</span>
        </div>

        <p className="text-[11px] text-orange-300 font-bold bg-stone-950 p-2 rounded-lg text-center">
          {liveMatch.resultText || liveMatch.newsHeadline || 'रोमांचक मैच जारी'}
        </p>
      </div>
    </div>
  );
}
