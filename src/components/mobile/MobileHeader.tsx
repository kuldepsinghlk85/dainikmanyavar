'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, Search, X, Newspaper, Share2, User } from 'lucide-react';
import { HeaderButtonsConfig, DEFAULT_MOBILE_MENU_CONFIG } from '@/lib/mobileMenuDefaults';

interface MobileHeaderProps {
  onOpenDrawer?: () => void;
  config?: HeaderButtonsConfig;
}

export default function MobileHeader({
  onOpenDrawer,
  config = DEFAULT_MOBILE_MENU_CONFIG.header,
}: MobileHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [logoSrc, setLogoSrc] = useState<string>('/logo.png');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.site_logo) {
          setLogoSrc(data.data.site_logo);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSearch(false);
    }
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'दैनिक मान्यवर - निष्पक्ष एवं निर्भीक समाचार',
          text: 'दैनिक मान्यवर पर पढ़ें उत्तर प्रदेश व देश की ताज़ा ख़बरें।',
          url: window.location.href,
        });
      } catch (_) {}
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('दैनिक मान्यवर: ' + window.location.href)}`, '_blank');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
      {/* Top Main Bar */}
      <div className="flex items-center justify-between px-3 py-2 min-h-[56px]">
        {/* Left: Menu & ePaper */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {config.menuButton !== false && (
            <button
              onClick={onOpenDrawer}
              className="p-1.5 -ml-1 text-stone-700 hover:text-stone-950 active:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="मेन्यू खोलें"
            >
              <Menu className="w-5 h-5 text-stone-800" />
            </button>
          )}

          {config.epaperBadge !== false && (
            <Link
              href="/epaper"
              className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 text-[#C2410C] font-black text-[11px] px-2 py-1 rounded-full border border-orange-200 transition-colors"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>ई-पेपर</span>
            </Link>
          )}
        </div>

        {/* Center: Brand Logo */}
        <div className="flex-1 flex justify-center px-1 py-0.5">
          <Link href="/mobile" className="block">
            <Image
              src={logoSrc || '/logo.png'}
              alt="दैनिक मान्यवर"
              width={220}
              height={50}
              priority
              unoptimized
              className="h-9 sm:h-11 w-auto max-h-11 max-w-[170px] sm:max-w-[210px] object-contain"
            />
          </Link>
        </div>

        {/* Right: Search & Share */}
        <div className="flex items-center gap-1">
          {config.searchButton !== false && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-stone-700 hover:text-[#EA580C] active:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="खोजें"
            >
              {showSearch ? (
                <X className="w-5 h-5 text-stone-700" />
              ) : (
                <Search className="w-5 h-5 text-stone-700" />
              )}
            </button>
          )}

          {config.shareButton !== false && (
            <button
              onClick={handleShareApp}
              className="p-2 text-stone-700 hover:text-green-600 active:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="शेयर करें"
            >
              <Share2 className="w-4 h-4 text-stone-700" />
            </button>
          )}

          <Link
            href="/user/dashboard"
            className="p-2 text-stone-700 hover:text-[#EA580C] active:bg-stone-100 rounded-full transition-colors"
            aria-label="पाठक प्रोफ़ाइल"
          >
            <User className="w-4.5 h-4.5 text-stone-700" />
          </Link>
        </div>
      </div>

      {/* Expandable Search Input */}
      {showSearch && (
        <div className="px-3.5 pb-2.5 pt-0.5 bg-stone-50 border-t border-stone-100 animate-in fade-in duration-150">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="समाचार, मुद्दा या कीवर्ड खोजें..."
              autoFocus
              className="w-full pl-9 pr-16 py-2 bg-white text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:border-[#EA580C] text-stone-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-[#EA580C] text-white text-xs font-bold rounded-lg hover:bg-orange-700"
            >
              खोजें
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
