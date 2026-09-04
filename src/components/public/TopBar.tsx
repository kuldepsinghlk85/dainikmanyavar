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
      <div className="wrap flex flex-wrap justify-between items-center py-2 gap-2">
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <span>📅 {currentDate}</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">📍 उत्तर प्रदेश</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/category/latest" className="hover:text-[#EA580C] font-medium">
            ताज़ा ख़बरें
          </Link>
          <span className="text-stone-300">|</span>
          <Link href="/video" className="hover:text-[#EA580C] font-medium">
            वीडियो बुलेटिन
          </Link>
          <span className="text-stone-300">|</span>
          <Link href="/epaper" className="text-[#EA580C] font-bold hover:underline">
            🗞️ ई-पेपर
          </Link>
          <span className="text-stone-300">|</span>
          <span className="text-stone-400 cursor-not-allowed select-none" title="पृष्ठ शीघ्र उपलब्ध होगा">
            हमारे बारे में
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-400 cursor-not-allowed select-none" title="पृष्ठ शीघ्र उपलब्ध होगा">
            संपर्क करें
          </span>
        </div>
      </div>
    </div>
  );
}
