'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';

interface NavigationProps {
  categories?: { name: string; slug: string }[];
}

export default function Navigation({ categories }: NavigationProps) {
  const pathname = usePathname();

  const defaultCategories = [
    { name: 'होम', slug: '', path: '/' },
    { name: 'ताजा खबर', slug: 'latest', path: '/category/latest' },
    { name: 'उत्तर प्रदेश', slug: 'uttar-pradesh', path: '/category/uttar-pradesh' },
    { name: 'जौनपुर', slug: 'jaunpur', path: '/category/jaunpur' },
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

  const items = defaultCategories;

  return (
    <nav className="bg-gradient-to-r from-orange-400 via-amber-500 to-amber-500 text-stone-900 border-b-3 border-[#EA580C] shadow-sm">
      <div className="wrap flex items-center overflow-x-auto whitespace-nowrap no-scrollbar py-0">
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

        {items.map((item) => {
          if (item.path === '/') return null;
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`px-3 py-2 text-xs sm:text-sm font-extrabold transition-colors duration-150 ${
                isActive
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'hover:bg-[#EA580C] hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
