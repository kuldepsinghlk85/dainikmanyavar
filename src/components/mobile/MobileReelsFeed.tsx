'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Play } from 'lucide-react';

interface ReelItem {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  duration?: string;
  category?: string;
}

interface MobileReelsFeedProps {
  reels?: ReelItem[];
  title?: string;
  viewAllLink?: string;
}

const DEFAULT_REELS: ReelItem[] = [
  {
    id: 'reel-1',
    title: 'बॉलीवुड सितारे: जानिए इस हफ्ते की सबसे बड़ी वायरल गॉसिप',
    slug: 'bollywood-viral-reels-1',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    duration: '1:00',
    category: 'बॉलीवुड',
  },
  {
    id: 'reel-2',
    title: 'वाराणसी घाट पर उमड़ी भारी भीड़, देव दीपावली की तैयारियां शुरू',
    slug: 'varanasi-ghat-dev-deepawali',
    thumbnail: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=400&q=80',
    duration: '0:54',
    category: 'वाराणसी',
  },
  {
    id: 'reel-3',
    title: 'क्रिकेट अपडेट: रोमांचक मैच में भारत की शानदार जीत का वो पल',
    slug: 'cricket-match-winning-moment',
    thumbnail: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3ce?auto=format&fit=crop&w=400&q=80',
    duration: '1:35',
    category: 'क्रिकेट',
  },
  {
    id: 'reel-4',
    title: 'मौसम रिपोर्ट: पहाड़ों में बर्फबारी से मैदानी इलाकों में बढ़ी ठंड',
    slug: 'weather-update-snowfall',
    thumbnail: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=400&q=80',
    duration: '1:20',
    category: 'मौसम',
  },
  {
    id: 'reel-5',
    title: 'नई टेक्नोलॉजी: AI से चलने वाला भारत का पहला डिजिटल स्मार्ट रोबोट',
    slug: 'new-ai-robot-india',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80',
    duration: '1:12',
    category: 'टेक',
  },
];

export default function MobileReelsFeed({
  reels = [],
  title = 'बॉलीवुड REEL',
  viewAllLink = '/video',
}: MobileReelsFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = reels && reels.length > 0 ? reels : DEFAULT_REELS;

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white dark:bg-[#141414] py-3.5 my-2 border-y border-stone-200 dark:border-stone-800 shadow-2xs transition-colors">
      {/* Header matching Image 2 */}
      <div className="flex items-center justify-between px-3.5 mb-2.5">
        <h3 className="text-[16px] font-black tracking-tight text-stone-900 dark:text-white flex items-center gap-1.5">
          <span>{title}</span>
        </h3>
        <Link
          href={viewAllLink}
          className="border border-[#E53935] text-[#E53935] hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95 font-extrabold text-[11px] px-2.5 py-0.5 rounded transition-all"
        >
          सभी देखें
        </Link>
      </div>

      {/* Horizontal Carousel with 9:16 Vertical Cards */}
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto px-3.5 no-scrollbar scroll-smooth"
        >
          {items.map((reel, idx) => (
            <Link
              key={reel.id || idx}
              href={`/mobile/news/${reel.slug}`}
              className="w-32 sm:w-36 shrink-0 aspect-[9/15] relative rounded-xl overflow-hidden shadow-md bg-stone-950 group/card block border border-stone-200/50 dark:border-stone-800"
            >
              {/* Background Thumbnail */}
              <Image
                src={reel.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'}
                alt={reel.title}
                fill
                unoptimized
                className="object-cover group-hover/card:scale-105 transition-transform duration-300"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20" />

              {/* Centered Circular Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-black/50 border border-white/90 text-white flex items-center justify-center backdrop-blur-xs shadow-md group-hover/card:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>

              {/* Duration Badge at Bottom Right */}
              {reel.duration && (
                <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded">
                  {reel.duration}
                </span>
              )}

              {/* Reel Title at Bottom */}
              <div className="absolute bottom-0 inset-x-0 p-2.5 z-10">
                <p className="text-[11.5px] font-extrabold text-white leading-tight line-clamp-2 drop-shadow-xs">
                  {reel.title}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Floating Right Scroll Arrow */}
        <button
          type="button"
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 dark:bg-stone-800/95 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 z-20 cursor-pointer"
          aria-label="अगला देखें"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
