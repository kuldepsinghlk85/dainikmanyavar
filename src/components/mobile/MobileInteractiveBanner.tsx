'use client';

import React from 'react';
import Link from 'next/link';

export default function MobileInteractiveBanner() {
  return (
    <div className="mx-3 my-2 bg-gradient-to-r from-stone-900 via-[#181818] to-stone-900 text-white rounded-xl p-3 border border-stone-800 shadow-md flex items-center justify-between gap-3">
      {/* Left: Crossword Matrix graphic */}
      <div className="grid grid-cols-3 gap-0.5 p-1 bg-stone-800/80 rounded border border-stone-700/60 shrink-0 select-none">
        <span className="w-4 h-4 text-[9px] font-black flex items-center justify-center bg-stone-900 text-stone-300 rounded-2xs">ख</span>
        <span className="w-4 h-4 text-[9px] font-black flex items-center justify-center bg-red-900/60 text-red-200 rounded-2xs">श</span>
        <span className="w-4 h-4 text-[9px] font-black flex items-center justify-center bg-stone-900 text-stone-300 rounded-2xs">र</span>
        <span className="w-4 h-4 text-[9px] font-black flex items-center justify-center bg-stone-900 text-stone-300 rounded-2xs">ओ</span>
        <span className="w-4 h-4 text-[9px] font-black flex items-center justify-center bg-stone-900 text-stone-300 rounded-2xs">ब</span>
        <span className="w-4 h-4 text-[9px] font-black flex items-center justify-center bg-stone-900 text-stone-300 rounded-2xs">ज</span>
        <span className="w-4 h-4 text-[9px] font-black flex items-center justify-center bg-stone-900 text-stone-300 rounded-2xs">द</span>
        <span className="w-4 h-4 text-[9px] font-black flex items-center justify-center bg-red-900/60 text-red-200 rounded-2xs">म</span>
        <span className="w-4 h-4 text-[9px] font-black flex items-center justify-center bg-stone-900 text-stone-300 rounded-2xs">क</span>
      </div>

      {/* Middle: Title & Subtitle */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[14px] font-black text-red-500 tracking-tight leading-tight flex items-center gap-1.5">
          <span>शब्दखोज</span>
        </h4>
        <p className="text-[10.5px] text-stone-300 font-medium truncate">
          छुपे हुए शब्दों को खोजें और जीतें
        </p>
      </div>

      {/* Right: Action Button */}
      <Link
        href="/epaper"
        className="bg-[#E53935] hover:bg-red-700 active:scale-95 text-white text-[11px] font-black px-3.5 py-1.5 rounded-lg shadow-sm shrink-0 transition-all"
      >
        अभी खेलें
      </Link>
    </div>
  );
}
