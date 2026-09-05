'use client';

import React from 'react';
import Link from 'next/link';

export default function MobileBrandLogo() {
  return (
    <Link href="/mobile" className="flex items-center gap-2 group select-none py-0.5">
      {/* Radiant Rising Sun Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 46 34" className="h-8 sm:h-9 w-auto drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="dmSunGrad" x1="23" y1="34" x2="23" y2="4" gradientUnits="userSpaceOnUse">
              <stop stopColor="#DC2626" />
              <stop offset="0.45" stopColor="#EA580C" />
              <stop offset="1" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="dmRayGrad" x1="23" y1="34" x2="23" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EA580C" />
              <stop offset="1" stopColor="#FDE047" />
            </linearGradient>
          </defs>

          {/* 9 Radiating Triangular Sunlight Rays */}
          <path d="M23 0L21.5 8H24.5L23 0Z" fill="url(#dmRayGrad)" />
          <path d="M12 4.5L13.5 11.5L15.5 10L12 4.5Z" fill="url(#dmRayGrad)" />
          <path d="M34 4.5L30.5 10L32.5 11.5L34 4.5Z" fill="url(#dmRayGrad)" />
          <path d="M3 14L9 16.5L8.8 14L3 14Z" fill="url(#dmRayGrad)" />
          <path d="M43 14L37.2 14L37 16.5L43 14Z" fill="url(#dmRayGrad)" />
          <path d="M6.5 24L12 22L11 20L6.5 24Z" fill="url(#dmRayGrad)" />
          <path d="M39.5 24L35 20L34 22L39.5 24Z" fill="url(#dmRayGrad)" />

          {/* Rising Half-Sun Disc */}
          <path d="M8 32C8 23.716 14.716 17 23 17C31.284 17 38 23.716 38 32H8Z" fill="url(#dmSunGrad)" />

          {/* Inner Golden Corona Glow */}
          <path d="M13 32C13 26.477 17.477 22 23 22C28.523 22 33 26.477 33 32H13Z" fill="#FEF08A" opacity="0.9" />

          {/* Core White-Gold Center */}
          <circle cx="23" cy="32" r="5" fill="#FFFFFF" opacity="0.75" />
        </svg>
      </div>

      {/* Typographic Masthead - Seamless on Dark & Light */}
      <div className="flex flex-col -space-y-0.5 justify-center">
        <h1 className="text-[20px] sm:text-[22px] font-black tracking-tight leading-none text-stone-900 dark:text-white font-sans transition-colors drop-shadow-xs">
          दैनिक मान्यवर
        </h1>
        <span className="text-[8.5px] font-black text-[#E53935] dark:text-[#EF5350] tracking-widest uppercase">
          निष्पक्ष • निर्भीक
        </span>
      </div>
    </Link>
  );
}
