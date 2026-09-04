'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';
import AdBanner from './AdBanner';

interface HeaderProps {
  festivalBanner?: {
    enabled: boolean;
    imageUrl?: string;
    title?: string;
    linkUrl?: string;
  };
}

export default function Header({ festivalBanner }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [siteBanner, setSiteBanner] = useState<any>(null);
  const [siteLogo, setSiteLogo] = useState<string>('/logo.png');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.site_logo) {
            setSiteLogo(data.data.site_logo);
          }
          setSiteBanner({
            enabled: data.data.festival_banner_enabled === 'true',
            imageUrl: data.data.festival_banner_image,
            title: data.data.festival_banner_title,
            linkUrl: data.data.festival_banner_link || '#',
          });
        }
      })
      .catch(() => {});
  }, []);

  // Default Festival Wish Banner
  const defaultBanner = {
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    title: '🎁 रक्षाबंधन पर्व की हार्दिक शुभकामनाएं! | दैनिक मान्यवर परिवार',
    linkUrl: '#',
  };

  const banner = siteBanner || festivalBanner || defaultBanner;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="py-2.5 bg-white border-b border-stone-100">
      <div className="wrap flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Prominent Brand Logo */}
        <div className="flex items-center justify-center lg:justify-start">
          <Link href="/" className="block">
            <Image
              src={siteLogo || '/logo.png'}
              alt="दैनिक मान्यवर"
              width={460}
              height={100}
              priority
              unoptimized
              className="h-12 sm:h-14 md:h-15 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Daily Theme / Festival Wish Banner (GIF / Image Upload) */}
        {banner.enabled && (
          <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white px-3.5 py-1.5 rounded-xl shadow-xs border border-orange-400 max-w-sm h-[52px]">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/20">
              <Image
                src={banner.imageUrl || defaultBanner.imageUrl}
                alt="Festival Wish Banner"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[9px] uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.2 rounded-full w-fit mb-0.5">
                <Sparkles className="w-2.5 h-2.5 text-yellow-200 animate-pulse" />
                <span>विशेष पर्व संदेश</span>
              </div>
              <p className="text-[11px] font-bold leading-tight line-clamp-2 drop-shadow-sm">
                {banner.title || defaultBanner.title}
              </p>
            </div>
          </div>
        )}

        {/* Header Ad Slot & Search / WhatsApp */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Compact Header Advertisement Block (Fixed 52px height) */}
          <div className="hidden xl:flex items-center justify-center h-[52px] max-h-[52px] overflow-hidden flex-shrink-0">
            <AdBanner position="header_wide" sizeText="Header Ad Slot (468×60)" className="relative w-[220px] sm:w-[300px] xl:w-[360px] h-[52px] rounded-lg overflow-hidden border border-stone-200 group shadow-xs flex-shrink-0" />
          </div>

          {/* Search Bar & WhatsApp Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="flex flex-1 sm:w-48 lg:w-56">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="खबर खोजें..."
                className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-l-lg focus:outline-none focus:border-[#F97316]"
              />
              <button
                type="submit"
                aria-label="खोजें"
                className="bg-[#F97316] text-white px-3 py-1.5 rounded-r-lg hover:bg-[#EA580C] transition-colors flex items-center justify-center cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            <a
              href="https://wa.me/919336181297"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#16A34A] hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs whitespace-nowrap text-center transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
