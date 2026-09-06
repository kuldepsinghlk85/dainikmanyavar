'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Bell, Sun, Moon } from 'lucide-react';
import { HeaderButtonsConfig, DEFAULT_MOBILE_MENU_CONFIG } from '@/lib/mobileMenuDefaults';
import { useMobileTheme } from './MobileThemeProvider';
import MobileBrandLogo from './MobileBrandLogo';

interface MobileHeaderProps {
  onOpenDrawer?: () => void;
  config?: HeaderButtonsConfig;
}

export default function MobileHeader({
  config = DEFAULT_MOBILE_MENU_CONFIG.header,
}: MobileHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { theme, toggleTheme } = useMobileTheme();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/mobile/search?q=${encodeURIComponent(query.trim())}`);
      setShowSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors shadow-xs">
      {/* Top Main Bar matching Amar Ujala */}
      <div className="flex items-center justify-between px-3 py-2 min-h-[54px]">
        {/* Left: Restructured Vector Brand Logo (No white box, completely transparent!) */}
        <div className="flex-1 min-w-0 pr-2">
          <MobileBrandLogo />
        </div>

        {/* Right Action Icons matching Amar Ujala */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 1. Amar Ujala Style Rich Gold & Red Coin Badge */}
          <Link
            href="/epaper"
            title="दैनिक मान्यवर ई-पेपर और विशेषांक"
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFD700] via-[#F59E0B] to-[#B45309] p-[2px] shadow-sm active:scale-95 transition-transform flex items-center justify-center shrink-0"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#991B1B] via-[#DC2626] to-[#7F1D1D] flex items-center justify-center text-[#FEF08A] border border-amber-300/40 shadow-inner">
              <span className="text-[12px] font-black leading-none drop-shadow-xs font-serif">
                म
              </span>
            </div>
          </Link>

          {/* 2. Search Icon */}
          {config.searchButton !== false && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1.5 text-stone-700 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors cursor-pointer"
              aria-label="खोजें"
            >
              {showSearch ? (
                <X className="w-5 h-5" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          )}

          {/* 3. Notification Bell with Red Dot */}
          <button
            onClick={() => router.push('/mobile/category/latest')}
            className="p-1.5 text-stone-700 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 rounded-full relative transition-colors cursor-pointer"
            aria-label="ताज़ा अपडेट्स"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E53935] ring-2 ring-white dark:ring-[#121212]" />
          </button>

          {/* 4. Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-stone-700 dark:text-amber-400 hover:text-stone-950 dark:hover:text-amber-300 rounded-full transition-colors cursor-pointer"
            aria-label={theme === 'dark' ? 'लाइट थीम चालू करें' : 'डार्क थीम चालू करें'}
            title={theme === 'dark' ? 'लाइट मोड (दैनिक भास्कर)' : 'डार्क मोड (अमर उजाला)'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5 text-stone-700" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {showSearch && (
        <div className="px-3.5 pb-2.5 pt-1 bg-stone-50 dark:bg-[#181818] border-t border-stone-200 dark:border-stone-800 animate-in fade-in duration-150">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="समाचार, मुद्दा या कीवर्ड खोजें..."
              autoFocus
              className="w-full pl-9 pr-16 py-2 bg-white dark:bg-stone-900 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 focus:outline-none focus:border-red-500 text-stone-900 dark:text-white"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-[#E53935] hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              खोजें
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
