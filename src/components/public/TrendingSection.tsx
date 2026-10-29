'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCount, formatHindiTimeAgo } from '@/lib/utils';
import SectionHeaderBar, { HeaderThemeConfig } from './SectionHeaderBar';
import { ExternalLink } from 'lucide-react';

interface TrendingItem {
  id: string;
  title: string;
  slug: string;
  newsId?: number;
  viewCount: number;
  publishedAt?: string | Date;
}

interface TrendingSectionProps {
  items?: TrendingItem[];
  articles?: TrendingItem[];
  themeConfig?: HeaderThemeConfig;
}

export default function TrendingSection({ items, articles, themeConfig }: TrendingSectionProps) {
  const defaultItems: TrendingItem[] = [
    { id: '1', title: 'यूपी में नई शिक्षा नीति लागू, स्कूलों में स्मार्ट डिजिटल बोर्ड', slug: 'up-schools-digital-education-smart-boards-2026', viewCount: 24100 },
    { id: '2', title: 'जौनपुर में पुलिस की बड़ी कार्रवाई, गिरोह गिरफ्तार', slug: 'jaunpur-police-action-gang-busted', viewCount: 18700 },
    { id: '3', title: 'पूर्वांचल एक्सप्रेस-वे से चंदौली और सोनभद्र भी जुड़ेंगे, सीएम योगी का बड़ा एलान', slug: 'purvanchal-expressway-chandauli-sonbhadra', viewCount: 16300 },
    { id: '4', title: 'किसानों के लिए बड़ी राहत: केंद्र सरकार ने धान व गेहूं के एमएसपी में की वृद्धि', slug: 'farmers-income-boost-new-subsidy-scheme', viewCount: 14900 },
    { id: '5', title: 'भारतीय वायुसेना की नई ताकत से सरहद मजबूत', slug: 'indian-air-force-new-fighter-jets-induction', viewCount: 12800 },
  ];

  const trendingList = (articles && articles.length > 0) ? articles : (items && items.length > 0) ? items : defaultItems;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let timer: NodeJS.Timeout | null = null;

    const startScroll = () => {
      timer = setInterval(() => {
        if (isPaused) return;
        if (!el) return;

        // Loop back to top smoothly when reaching bottom
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
          el.scrollTop = 0;
        } else {
          el.scrollTop += 1;
        }
      }, 45);
    };

    startScroll();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPaused, trendingList.length]);

  return (
    <aside className="border border-[#E8E8E8] rounded-xl p-4 bg-white shadow-soft">
      <SectionHeaderBar
        title="🔥 ट्रेंडिंग न्यूज़"
        action={
          <Link
            href="/latest-news"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#EA580C] font-bold hover:underline flex items-center gap-1 group"
            title="सभी ताज़ा समाचार नई टैब में देखें (20, 50, 100 सूची)"
          >
            <span>और देखें</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        }
        themeConfig={themeConfig}
      />

      {/* Live Scrolling News List Container */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex flex-col gap-2 mt-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-200 select-none"
        title="स्क्रॉल करें या रोक कर पढ़ें"
      >
        {trendingList.map((item, index) => {
          const isLatestFirst = index === 0;

          return (
            <Link
              key={item.id || item.slug}
              href={`/news/${item.newsId || item.slug}`}
              className={`grid grid-cols-[30px_1fr] gap-2.5 items-center border-b border-stone-100 pb-2.5 last:border-0 p-2 rounded-xl transition-all group ${
                isLatestFirst ? 'bg-orange-50/70 border-orange-200 hover:bg-orange-100/70' : 'hover:bg-stone-50'
              }`}
            >
              <span
                className={`w-7 h-7 text-xs font-black rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                  isLatestFirst
                    ? 'bg-[#EA580C] text-white ring-2 ring-orange-300'
                    : 'bg-stone-100 text-stone-700 group-hover:bg-[#EA580C] group-hover:text-white transition-colors'
                }`}
              >
                {index + 1}
              </span>

              <div className="min-w-0">
                <b className="text-xs sm:text-[13px] text-stone-900 group-hover:text-[#EA580C] line-clamp-2 leading-snug font-bold">
                  {item.title}
                </b>
                {item.publishedAt && (
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    ⏱ {formatHindiTimeAgo(item.publishedAt)}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Action Button to Open Full Dedicated Listing */}
      <Link
        href="/latest-news"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 w-full py-2 px-3 bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-orange-200 rounded-xl text-center text-xs font-black text-stone-700 hover:text-[#EA580C] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
      >
        <span>⚡ सभी ताज़ा समाचार (20 / 50 / 100 लिस्टिंग)</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </aside>
  );
}
