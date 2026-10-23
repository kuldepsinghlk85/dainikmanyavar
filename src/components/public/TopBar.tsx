'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Youtube, Instagram, Facebook } from 'lucide-react';
import { OFFICIAL_SOCIAL_LINKS } from '@/lib/social';

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
          <span className="hidden sm:inline text-stone-300">|</span>
          <span className="hidden sm:inline">📍 उत्तर प्रदेश</span>
          <span className="hidden md:inline text-stone-300">|</span>

          {/* Top Bar Quick Social Follow Icons */}
          <div className="hidden md:flex items-center gap-1.5 pl-1">
            <span className="text-[10px] text-stone-400 font-bold">फॉलो करें:</span>
            <a
              href={OFFICIAL_SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF0000] hover:scale-115 transition-transform"
              title="यूट्यूब: @DainikManyavarOfficial"
            >
              <Youtube className="w-3.5 h-3.5" />
            </a>
            <a
              href={OFFICIAL_SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E4405F] hover:scale-115 transition-transform"
              title="इंस्टाग्राम: @dainikmanyavarofficial"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a
              href={OFFICIAL_SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1877F2] hover:scale-115 transition-transform"
              title="फेसबुक: दैनिक मान्यवर"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a
              href={OFFICIAL_SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:scale-115 transition-transform text-xs"
              title="व्हाट्सएप: +91 93361 81297"
            >
              💬
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-[11px] sm:text-xs">
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
          <span className="text-stone-300">|</span>
          <Link href="/user/dashboard" className="text-[#EA580C] font-black hover:underline flex items-center gap-1">
            <span>👤 पाठक खाता</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
