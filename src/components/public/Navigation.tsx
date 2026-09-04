'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper } from 'lucide-react';

export interface NavCategoryItem {
  id?: string;
  name: string;
  slug: string;
  order?: number;
  isHeaderMenu?: boolean;
}

interface NavigationProps {
  categories?: NavCategoryItem[];
}

const DEFAULT_NAV_ITEMS: { name: string; slug: string; path: string }[] = [
  { name: 'होम', slug: 'home', path: '/' },
  { name: 'ताजा खबर', slug: 'latest', path: '/category/latest' },
  { name: 'उत्तर प्रदेश', slug: 'uttar-pradesh', path: '/category/uttar-pradesh' },
  { name: 'राजनीति', slug: 'rajneeti', path: '/category/rajneeti' },
  { name: 'देश', slug: 'desh', path: '/category/desh' },
  { name: 'शिक्षा', slug: 'shiksha', path: '/category/shiksha' },
  { name: 'स्वास्थ्य', slug: 'swasthya', path: '/category/swasthya' },
  { name: 'अर्थजगत', slug: 'arthjagat', path: '/category/arthjagat' },
  { name: 'क्रिकेट', slug: 'cricket', path: '/cricket' },
  { name: 'खेल', slug: 'sports', path: '/sports' },
  { name: 'राशिफल', slug: 'horoscope', path: '/horoscope' },
  { name: 'शेयर बाजार', slug: 'stock-market', path: '/stock-market' },
  { name: 'सोना-चांदी', slug: 'gold-silver', path: '/gold-silver' },
  { name: 'अन्य', slug: 'anya', path: '/category/anya' },
];

function getCategoryPath(slug: string): string {
  const cleanSlug = (slug || '').toLowerCase().trim();
  if (cleanSlug === '' || cleanSlug === 'home' || cleanSlug === 'होम') return '/';
  if (cleanSlug === 'latest' || cleanSlug === 'ताजा-खबर') return '/category/latest';
  if (cleanSlug === 'cricket' || cleanSlug === 'क्रिकेट') return '/cricket';
  if (cleanSlug === 'horoscope' || cleanSlug === 'राशिफल') return '/horoscope';
  if (cleanSlug === 'stock-market' || cleanSlug === 'शेयर-बाजार') return '/stock-market';
  if (cleanSlug === 'gold-silver' || cleanSlug === 'सोना-चांदी') return '/gold-silver';
  if (cleanSlug === 'sports' || cleanSlug === 'खेल') return '/sports';
  return `/category/${slug}`;
}

export default function Navigation({ categories: initialCategories }: NavigationProps) {
  const pathname = usePathname();
  const [dbCategories, setDbCategories] = useState<NavCategoryItem[] | null>(
    initialCategories && initialCategories.length > 0 ? initialCategories : null
  );

  // Fetch active menu categories dynamically if not passed via props or to keep updated
  useEffect(() => {
    fetch('/api/categories?menuOnly=true')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          setDbCategories(resData.data);
        }
      })
      .catch(() => {});
  }, []);

  // Compute active navigation items
  const menuItems = useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories
        .filter((c) => c.isHeaderMenu !== false)
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
        .map((c) => ({
          name: c.name,
          slug: c.slug,
          path: getCategoryPath(c.slug),
        }));
    }
    return DEFAULT_NAV_ITEMS;
  }, [dbCategories]);

  return (
    <nav className="bg-gradient-to-r from-orange-400 via-amber-500 to-amber-500 text-stone-900 border-b-3 border-[#EA580C] shadow-sm sticky top-0 z-40">
      <div className="wrap flex items-center justify-between gap-1 sm:gap-2 py-0">
        {/* Left Side: Red Home Button + Category Links (Horizontally Scrollable) */}
        <div className="flex items-center overflow-x-auto whitespace-nowrap no-scrollbar py-0 flex-1 min-w-0">
          {/* Red Home Icon Button */}
          <Link
            href="/"
            className={`px-3 py-2 text-white bg-[#DC2626] hover:bg-red-700 font-bold transition-colors flex items-center justify-center flex-shrink-0 ${
              pathname === '/' ? 'bg-[#B91C1C]' : ''
            }`}
            title="होम"
          >
            <Home className="w-4 h-4" />
          </Link>

          {menuItems.map((item) => {
            if (item.path === '/') return null;
            const isActive =
              pathname === item.path ||
              (item.path !== '/' && pathname.startsWith(item.path));

            return (
              <Link
                key={item.slug || item.name}
                href={item.path}
                className={`px-3 py-2 text-xs sm:text-sm font-extrabold transition-colors duration-150 flex items-center gap-1 flex-shrink-0 ${
                  isActive
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'hover:bg-[#EA580C] hover:text-white'
                }`}
              >
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Side: Dedicated Part for "आज का अखबार" (E-Paper) */}
        <div className="flex items-center flex-shrink-0 pl-1.5 sm:pl-2 py-1">
          <Link
            href="/epaper"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all duration-200 shadow-md ${
              pathname === '/epaper'
                ? 'bg-red-700 text-white ring-2 ring-white/60'
                : 'bg-slate-900 hover:bg-black text-amber-300 hover:text-amber-200 border border-amber-400/50 hover:scale-[1.03] active:scale-95'
            }`}
            title="आज का ई-पेपर (Newspaper) पढ़ें"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <Newspaper className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap">आज का अखबार</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
