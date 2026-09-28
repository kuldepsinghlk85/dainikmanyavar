'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Video, Film, Menu, Crown } from 'lucide-react';
import { BottomNavItem } from '@/lib/mobileMenuDefaults';

interface MobileBottomNavProps {
  onOpenDrawer?: () => void;
  onOpenSearch?: () => void;
  items?: BottomNavItem[];
}

export default function MobileBottomNav({
  onOpenDrawer,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  const isHome = pathname === '/mobile';
  const isVideo = pathname.includes('/category/video');
  const isEpaper = pathname.includes('/epaper');
  const isManoranjan = pathname.includes('/manoranjan');

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
          href="/mobile/category/video"
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
            href="/mobile/epaper"
            title="दैनिक मान्यवर ई-पेपर संस्करण"
            className={`w-12 h-12 rounded-full -mt-5 bg-[#1e1e1e] dark:bg-[#181818] border-2 shadow-lg shadow-black/30 flex flex-col items-center justify-center active:scale-95 transition-transform group ${
              isEpaper ? 'border-[#EA580C] ring-2 ring-orange-500/50' : 'border-amber-400/90'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-amber-300 font-serif font-black text-sm leading-none mt-0.5 drop-shadow-xs">
              म
            </span>
          </Link>
          <span className={`text-[9.5px] mt-0.5 font-bold leading-tight ${isEpaper ? 'text-[#EA580C] font-black' : 'text-stone-600 dark:text-stone-400'}`}>
            ई-पेपर
          </span>
        </div>

        {/* 4. मनोरंजन (Entertainment) */}
        <Link
          href="/mobile/manoranjan"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isManoranjan
              ? 'text-[#EA580C] font-black'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium'
          }`}
        >
          <Film className={`w-5 h-5 ${isManoranjan ? 'fill-orange-500/20' : ''}`} />
          <span className="text-[10px] mt-0.5">मनोरंजन</span>
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
