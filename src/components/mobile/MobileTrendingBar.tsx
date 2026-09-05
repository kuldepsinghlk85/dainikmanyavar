'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Flame } from 'lucide-react';

interface TrendingTopic {
  id?: string;
  name: string;
  url?: string;
}

const DEFAULT_TOPICS: TrendingTopic[] = [
  { name: 'नेपाल में बाढ़', url: '/mobile/search?q=नेपाल' },
  { name: 'ईरान जंग', url: '/mobile/search?q=ईरान' },
  { name: 'जन्माष्टमी', url: '/mobile/search?q=जन्माष्टमी' },
  { name: 'बारिश का मौसम', url: '/mobile/search?q=मौसम' },
  { name: 'T20 वर्ल्ड कप', url: '/mobile/search?q=क्रिकेट' },
  { name: 'जौनपुर विकास', url: '/mobile/search?q=जौनपुर' },
  { name: 'वाराणसी कॉरिडोर', url: '/mobile/search?q=वाराणसी' },
];

export default function MobileTrendingBar({ topics = DEFAULT_TOPICS }: { topics?: TrendingTopic[] }) {
  const items = topics.length > 0 ? topics : DEFAULT_TOPICS;

  return (
    <div className="bg-white dark:bg-[#141414] border-b border-stone-200 dark:border-stone-800 py-2 px-3 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-2xs transition-colors">
      {/* Trending Label */}
      <div className="flex items-center gap-1 text-[#E53935] font-black text-xs shrink-0 pr-1">
        <Flame className="w-4 h-4 fill-[#E53935]" />
        <span>ट्रेंडिंग</span>
      </div>

      <div className="w-px h-3.5 bg-stone-300 dark:bg-stone-700 shrink-0" />

      {/* Pill Links */}
      <div className="flex items-center gap-2 shrink-0">
        {items.map((topic, i) => (
          <Link
            key={topic.name + i}
            href={topic.url || `/mobile/search?q=${encodeURIComponent(topic.name)}`}
            className="inline-flex items-center gap-1 bg-stone-50 dark:bg-[#202020] hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 border border-stone-200 dark:border-stone-700/80 text-stone-800 dark:text-stone-200 text-[11.5px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap transition-all"
          >
            <span>{topic.name}</span>
            <ChevronRight className="w-3 h-3 text-stone-400 dark:text-stone-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
