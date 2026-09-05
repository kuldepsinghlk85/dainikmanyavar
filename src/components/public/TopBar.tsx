'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TopBar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentDate = mounted
    ? new Date().toLocaleDateString('hi-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '26 अगस्त 2026';

  return (
    <div className="bg-[#FFF7ED] border-b border-[#FED7AA] text-xs font-sans text-stone-700">
      <div className="wrap flex flex-wrap justify-between items-center py-1.5 gap-2">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs" suppressHydrationWarning>
          <span>📅 {currentDate}</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">📍 उत्तर प्रदेश</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-[11px] sm:text-xs">
          <Link
            href="/mobile"
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1"
          >
            <span>📱 मोबाइल संस्करण</span>
          </Link>
          <span className="text-stone-300 hidden sm:inline">|</span>
          <Link href="/category/latest" className="hover:text-[#EA580C] font-medium hidden sm:inline">
            ताज़ा ख़बरें
          </Link>
          <span className="text-stone-300 hidden sm:inline">|</span>
          <Link href="/video" className="hover:text-[#EA580C] font-medium hidden sm:inline">
            वीडियो बुलेटिन
          </Link>
          <span className="text-stone-300 hidden sm:inline">|</span>
          <Link href="/epaper" className="text-[#EA580C] font-bold hover:underline">
            🗞️ ई-पेपर
          </Link>
          <span className="text-stone-300">|</span>
          <span className="text-stone-400 cursor-not-allowed select-none" title="पृष्ठ शीघ्र उपलब्ध होगा">
            हमारे बारे में
          </span>
          <span className="text-stone-300">|</span>
          <Link href="/contact" className="hover:text-[#EA580C] font-semibold text-stone-700">
            संपर्क करें
          </Link>
        </div>
      </div>
    </div>
  );
}
