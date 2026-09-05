'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Video, Newspaper, Menu, Crown } from 'lucide-react';
import { BottomNavItem, DEFAULT_MOBILE_MENU_CONFIG } from '@/lib/mobileMenuDefaults';

interface MobileBottomNavProps {
  onOpenDrawer?: () => void;
  onOpenSearch?: () => void;
  items?: BottomNavItem[];
}

export default function MobileBottomNav({
  onOpenDrawer,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  const isHome = pathname === '/mobile' || pathname === '/';
  const isVideo = pathname.includes('/video');
  const isEpaper = pathname.includes('/epaper');

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg mx-auto">
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {/* 1. होम (Home) */}
        <Link
          href="/mobile"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isHome
              ? 'text-[#E53935] font-black'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'fill-[#E53935]' : ''}`} />
          <span className="text-[10px] mt-0.5">होम</span>
        </Link>

        {/* 2. वीडियो (Video) */}
        <Link
          href="/video"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isVideo
              ? 'text-[#E53935] font-black'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium'
          }`}
        >
          <Video className={`w-5 h-5 ${isVideo ? 'fill-[#E53935]' : ''}`} />
          <span className="text-[10px] mt-0.5">वीडियो</span>
        </Link>

        {/* 3. Center Elevated Button with Golden Crown + 'म' (Amar Ujala style) */}
        <div className="flex flex-col items-center justify-center relative">
          <Link
            href="/epaper"
            title="दैनिक मान्यवर प्रीमियम व ई-पेपर"
            className="w-12 h-12 rounded-full -mt-6 bg-[#1e1e1e] dark:bg-[#181818] border-2 border-amber-400/90 shadow-lg shadow-black/40 flex flex-col items-center justify-center active:scale-95 transition-transform group"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-amber-300 font-serif font-black text-sm leading-none mt-0.5 drop-shadow-xs">
              म
            </span>
          </Link>
        </div>

        {/* 4. ई-पेपर (ePaper) */}
        <Link
          href="/epaper"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isEpaper
              ? 'text-[#E53935] font-black'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium'
          }`}
        >
          <Newspaper className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">ई-पेपर</span>
        </Link>

        {/* 5. मेन्यू (Menu) */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">मेन्यू</span>
        </button>
      </div>
    </nav>
  );
}
