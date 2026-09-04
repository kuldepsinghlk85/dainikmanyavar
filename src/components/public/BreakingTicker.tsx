'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  List,
  X,
  Flame,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export interface BreakingTickerItem {
  id: string;
  customHeadline?: string | null;
  priority?: number;
  article?: {
    id?: string;
    title: string;
    slug: string;
  } | null;
  createdAt?: string | Date;
}

interface BreakingTickerProps {
  items?: BreakingTickerItem[];
  tickerText?: string;
}

export default function BreakingTicker({ items: initialItems, tickerText }: BreakingTickerProps) {
  const [items, setItems] = useState<BreakingTickerItem[]>(initialItems || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch active items if not passed or empty
  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
      return;
    }

    fetch('/api/breaking')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setItems(data.data);
        }
      })
      .catch(() => {});
  }, [initialItems]);

  const defaultItems: BreakingTickerItem[] = [
    {
      id: 'default-1',
      customHeadline:
        'UP में नई शिक्षा नीति को लेकर बड़ा फैसला | जौनपुर में विकास परियोजनाओं की समीक्षा',
      priority: 1,
    },
    {
      id: 'default-2',
      customHeadline: 'मानसून से कई जिलों में भारी बारिश | मौसम विभाग ने जारी किया अलर्ट',
      priority: 1,
    },
    {
      id: 'default-3',
      customHeadline: 'केंद्र सरकार का बड़ा फैसला: किसानों के लिए न्यूनतम समर्थन मूल्य (MSP) में वृद्धि',
      priority: 1,
    },
  ];

  const activeNewsList =
    items && items.length > 0
      ? items
      : tickerText
      ? [{ id: 'custom-single', customHeadline: tickerText, priority: 1 }]
      : defaultItems;

  const total = activeNewsList.length;

  // Slide navigation handlers
  const handleNext = () => {
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % total);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Auto-slide effect
  useEffect(() => {
    if (total <= 1 || isPaused || isHovered) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [total, isPaused, isHovered]);

  const currentItem = activeNewsList[currentIndex] || activeNewsList[0];
  const headline = currentItem?.customHeadline || currentItem?.article?.title || '';

  return (
    <div className="border-b border-[#FED7AA] bg-[#FFF8F1] shadow-xs relative z-20">
      <div className="wrap flex items-center justify-between gap-3 py-2">
        {/* Left: Animated Breaking Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#DC2626] hover:bg-red-700 transition-colors text-white font-black text-xs px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 shadow-xs select-none">
            <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
            <span className="tracking-wide">BREAKING NEWS</span>
          </div>

          {/* Slide Indicator Badge */}
          {total > 1 && (
            <span className="hidden sm:inline-block bg-orange-100 text-orange-900 border border-orange-200 text-[11px] font-mono font-black px-2 py-0.5 rounded-md select-none">
              {currentIndex + 1} / {total}
            </span>
          )}
        </div>

        {/* Center: Slide News Headline Area */}
        <div
          className="flex-1 min-w-0 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`transition-all duration-300 transform ${
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            {currentItem?.article?.slug ? (
              <Link
                href={`/news/${currentItem.article.slug}`}
                className="group flex items-center gap-2 text-stone-900 hover:text-[#EA580C] text-sm font-black transition-colors truncate"
                title={headline}
              >
                <Flame className="w-4 h-4 text-red-600 shrink-0 animate-pulse" />
                <span className="truncate group-hover:underline">{headline}</span>
                <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-[#EA580C] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-stone-900 text-sm font-black truncate" title={headline}>
                <Flame className="w-4 h-4 text-red-600 shrink-0" />
                <span className="truncate">{headline}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Slider Controls (Prev, Next, Pause, View All) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Previous Button */}
          {total > 1 && (
            <button
              onClick={handlePrev}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-orange-100/80 rounded-lg transition-colors cursor-pointer"
              title="पिछली खबर (Previous News)"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Next Button */}
          {total > 1 && (
            <button
              onClick={handleNext}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-orange-100/80 rounded-lg transition-colors cursor-pointer"
              title="अगली खबर (Next News)"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Pause / Resume Auto-Slide Button */}
          {total > 1 && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isPaused
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-orange-100/80'
              }`}
              title={isPaused ? 'स्लाइडर चालू करें (Play)' : 'स्लाइडर रोकें (Pause)'}
              aria-label="Toggle Pause"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* View All News Button (Modal Trigger) */}
          <button
            onClick={() => setShowAllModal(true)}
            className="bg-stone-900 hover:bg-[#EA580C] text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer ml-1"
            title="सभी ब्रेकिंग खबरें देखें"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">सभी देखें</span>
            <span className="sm:hidden">({total})</span>
          </button>
        </div>
      </div>

      {/* View All Breaking News Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-stone-200 shadow-2xl p-6 space-y-4 animate-scale-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-red-600 text-white p-1.5 rounded-lg">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-stone-900">
                    सभी ब्रेकिंग खबरें ({total})
                  </h2>
                  <p className="text-[11px] font-semibold text-stone-500">
                    वर्तमान में सक्रिय सभी ब्रेकिंग न्यूज़ की सूची
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
                title="बंद करें"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* News List */}
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-stone-100 space-y-2 pr-1">
              {activeNewsList.map((item, idx) => {
                const itemHeadline = item.customHeadline || item.article?.title || '';
                const isCurrent = idx === currentIndex;

                return (
                  <div
                    key={item.id || idx}
                    className={`p-3 rounded-2xl transition-all flex items-start justify-between gap-3 ${
                      isCurrent
                        ? 'bg-red-50/80 border border-red-200'
                        : 'hover:bg-stone-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-[11px] font-black font-mono flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        {item.article?.slug ? (
                          <Link
                            href={`/news/${item.article.slug}`}
                            onClick={() => setShowAllModal(false)}
                            className="font-black text-xs text-stone-900 hover:text-[#EA580C] hover:underline transition-colors block leading-relaxed"
                          >
                            {itemHeadline}
                          </Link>
                        ) : (
                          <p className="font-black text-xs text-stone-900 leading-relaxed">
                            {itemHeadline}
                          </p>
                        )}
                        {item.article && (
                          <span className="text-[10px] text-orange-600 font-bold mt-1 inline-flex items-center gap-1">
                            <span>पूरी खबर पढ़ें</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Button to jump to this slide */}
                    <button
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowAllModal(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-colors shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isCurrent ? 'सक्रिय' : 'देखें'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-xs">
              <span className="text-stone-400 font-medium">
                प्रत्येक खबर 4.5 सेकंड में ऑटो-स्लाइड होती है
              </span>
              <button
                onClick={() => setShowAllModal(false)}
                className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
