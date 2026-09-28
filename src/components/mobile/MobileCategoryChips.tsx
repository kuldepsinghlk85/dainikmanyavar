'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';

interface CategoryItem {
  id?: string;
  name: string;
  slug: string;
}

interface MobileCategoryChipsProps {
  categories?: CategoryItem[];
  activeSlug?: string;
  onOpenFilter?: () => void;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { name: 'होम', slug: 'home' },
  { name: 'ताज़ा ख़बरें', slug: 'latest' },
];

export default function MobileCategoryChips({
  categories,
  activeSlug,
  onOpenFilter,
}: MobileCategoryChipsProps) {
  const pathname = usePathname();
  const rawList = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const list = rawList.some((c) => c.slug === 'home' || c.slug === '')
    ? rawList
    : [{ name: 'होम', slug: 'home' }, ...rawList];

  return (
    <div className="bg-white dark:bg-[#121212] border-b border-stone-200 dark:border-stone-800 sticky top-[54px] z-30 shadow-2xs transition-colors">
      <div className="flex items-center justify-between px-2.5 py-2">
        {/* Horizontal Scrolling Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 mr-1">
          {list.map((cat) => {
            const isHome = cat.slug === 'home' || cat.slug === '';
            const href = isHome ? '/mobile' : `/mobile/category/${cat.slug}`;
            const isActive = isHome
              ? pathname === '/mobile' || pathname === '/'
              : activeSlug === cat.slug || pathname.includes(`/category/${cat.slug}`);

            return (
              <Link
                key={cat.slug}
                href={href}
                className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#E53935] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-[#1f1f1f] text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Sliders / Filter Icon matching Amar Ujala */}
        <button
          type="button"
          onClick={onOpenFilter}
          className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#1f1f1f] text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white shrink-0 transition-colors ml-1"
          title="श्रेणी कस्टमाइज़ करें"
          aria-label="श्रेणी कस्टमाइज़ करें"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
