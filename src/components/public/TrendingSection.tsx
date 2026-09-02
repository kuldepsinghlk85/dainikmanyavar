'use client';

import React from 'react';
import Link from 'next/link';
import { formatCount } from '@/lib/utils';

interface TrendingItem {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
}

interface TrendingSectionProps {
  items?: TrendingItem[];
}

export default function TrendingSection({ items }: TrendingSectionProps) {
  const defaultItems = [
    { id: '1', title: 'यूपी में नई शिक्षा नीति लागू, स्कूलों में स्मार्ट बोर्ड', slug: 'up-schools-digital-education-smart-boards-2026', viewCount: 24100 },
    { id: '2', title: 'जौनपुर में पुलिस की बड़ी कार्रवाई, गिरोह गिरफ्तार', slug: 'jaunpur-police-action-gang-busted', viewCount: 18700 },
    { id: '3', title: 'मानसून का कहर, कई गांव जलमग्न हुए', slug: 'monsoon-heavy-rainfall-up-districts-alert', viewCount: 16300 },
    { id: '4', title: 'किसानों के लिए बड़ी राहत की घोषणा', slug: 'farmers-income-boost-new-subsidy-scheme', viewCount: 14900 },
    { id: '5', title: 'भारतीय वायुसेना की नई ताकत से सरहद मजबूत', slug: 'indian-air-force-new-fighter-jets-induction', viewCount: 12800 },
  ];

  const trendingList = items && items.length > 0 ? items : defaultItems;

  return (
    <aside className="border border-[#E8E8E8] rounded-xl p-4 bg-white shadow-soft">
      <div className="flex justify-between items-center border-b-2 border-[#F97316] pb-2 mb-3.5">
        <h3 className="text-xl font-bold text-[#171717]">🔥 ट्रेंडिंग न्यूज़</h3>
        <Link href="/category/latest" className="text-xs text-[#EA580C] font-semibold hover:underline">
          और देखें →
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {trendingList.slice(0, 5).map((item, index) => (
          <Link
            key={item.id || item.slug}
            href={`/news/${item.slug}`}
            className="grid grid-cols-[30px_1fr_auto] gap-2.5 items-center border-b border-stone-100 pb-2.5 last:border-0 hover:bg-orange-50/50 p-1.5 rounded transition-colors group"
          >
            <span className="w-7 h-7 bg-[#F97316] text-white font-extrabold text-xs rounded flex items-center justify-center">
              {index + 1}
            </span>
            <b className="text-sm text-stone-800 group-hover:text-[#F97316] line-clamp-2 leading-snug font-semibold">
              {item.title}
            </b>
            <span className="text-xs text-stone-400 font-medium whitespace-nowrap">
              {formatCount(item.viewCount)}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
