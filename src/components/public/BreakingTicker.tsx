'use client';

import React from 'react';

interface BreakingTickerProps {
  tickerText?: string;
}

export default function BreakingTicker({ tickerText }: BreakingTickerProps) {
  const defaultTicker =
    'UP में नई शिक्षा नीति को लेकर बड़ा फैसला | जौनपुर में विकास परियोजनाओं की समीक्षा | मानसून से कई जिलों में भारी बारिश | केंद्र सरकार का बड़ा फैसला';

  const text = tickerText || defaultTicker;

  return (
    <div className="border-b border-[#FED7AA] bg-[#FFFAF5] overflow-hidden">
      <div className="wrap flex items-center gap-3 py-2">
        <div className="bg-[#DC2626] text-white font-extrabold text-xs px-3 py-1.5 rounded-md whitespace-nowrap animate-pulse flex items-center gap-1.5">
          <span>⚡</span>
          <span>BREAKING NEWS</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap text-stone-800 text-sm font-medium">
          <div className="inline-block animate-marquee pl-4">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
