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
          <span className="hidden sm:inline">📍 जौनपुर, उत्तर प्रदेश</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/about" className="hover:text-[#EA580C]">हमारे बारे में</Link>
          <Link href="/contact" className="hover:text-[#EA580C]">संपर्क करें</Link>
          <Link href="/advertise" className="hover:text-[#EA580C]">विज्ञापन</Link>
          <Link href="/submit-article" className="hover:text-[#EA580C]">लेख भेजें</Link>
        </div>
      </div>
    </div>
  );
}
