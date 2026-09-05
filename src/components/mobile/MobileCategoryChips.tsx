'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CategoryItem {
  id?: string;
  name: string;
  slug: string;
}

interface MobileCategoryChipsProps {
  categories?: CategoryItem[];
  activeSlug?: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { name: 'होम', slug: 'home' },
  { name: 'ताज़ा ख़बरें', slug: 'latest' },
  { name: 'जौनपुर', slug: 'jaunpur' },
  { name: 'उत्तर प्रदेश', slug: 'uttar-pradesh' },
  { name: 'वाराणसी', slug: 'varanasi' },
  { name: 'राजनीति', slug: 'rajneeti' },
  { name: 'देश', slug: 'desh' },
  { name: 'शिक्षा', slug: 'shiksha' },
  { name: 'स्वास्थ्य', slug: 'swasthya' },
  { name: 'अर्थजगत', slug: 'arthjagat' },
  { name: 'क्रिकेट', slug: 'cricket' },
  { name: 'राशिफल', slug: 'horoscope' },
];

export default function MobileCategoryChips({ categories, activeSlug }: MobileCategoryChipsProps) {
  const pathname = usePathname();
  const list = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="bg-white border-b border-stone-200 sticky top-[53px] z-30 shadow-2xs">
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-3 no-scrollbar scroll-smooth">
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
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 active:bg-stone-300'
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
