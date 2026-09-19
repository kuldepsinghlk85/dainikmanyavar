'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Film,
  Star,
  Flame,
  Trophy,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface MobileManoranjanItem {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  featuredImage: string | null;
  gallery: string | null;
  sourceType: string | null;
  publishedAt: string;
}

interface MobileManoranjanSectionProps {
  articles: MobileManoranjanItem[];
  settings?: {
    showReviews?: boolean;
    showViral?: boolean;
    showCricket?: boolean;
    showFilms?: boolean;
  };
}

export default function MobileManoranjanSection({
  articles = [],
  settings = {
    showReviews: true,
    showViral: true,
    showCricket: true,
    showFilms: true,
  },
}: MobileManoranjanSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  if (!articles || articles.length === 0) {
    return null;
  }

  const parseReview = (galleryJson: string | null) => {
    if (!galleryJson) return null;
    try {
      return JSON.parse(galleryJson);
    } catch {
      return null;
    }
  };

  const filtered = activeTab === 'all'
    ? articles
    : articles.filter((a) => a.sourceType === activeTab);

  const displayList = filtered.length > 0 ? filtered : articles;

  return (
    <section className="bg-white dark:bg-[#121212] py-3.5 border-b border-stone-200 dark:border-stone-800 transition-colors">
      {/* Header */}
      <div className="px-3 flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#EA580C] to-amber-500 text-white flex items-center justify-center shadow-xs">
            <Film className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5">
            <span>मनोरंजन</span>
            <span className="text-[10px] font-bold text-[#EA580C] dark:text-amber-400 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.2 rounded font-sans">
              सिनेमा व रिव्यू
            </span>
          </h3>
        </div>

        <Link
          href="/mobile/manoranjan"
          className="text-xs font-bold text-[#EA580C] dark:text-orange-400 flex items-center gap-0.5"
        >
          <span>सभी देखें</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Subtype Filter Chips */}
      <div className="px-3 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#EA580C] text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
          }`}
        >
          सभी
        </button>

        {settings.showFilms && (
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'movies'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <Film className="w-2.5 h-2.5" />
            <span>फिल्में</span>
          </button>
        )}

        {settings.showReviews && (
          <button
            onClick={() => setActiveTab('movie_review')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'movie_review'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <Star className="w-2.5 h-2.5" />
            <span>रिव्यू</span>
          </button>
        )}

        {settings.showViral && (
          <button
            onClick={() => setActiveTab('viral')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'viral'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <Flame className="w-2.5 h-2.5" />
            <span>दिलचस्प</span>
          </button>
        )}

        {settings.showCricket && (
          <button
            onClick={() => setActiveTab('cricket_buzz')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'cricket_buzz'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <Trophy className="w-2.5 h-2.5" />
            <span>क्रिकेट बज़</span>
          </button>
        )}
      </div>

      {/* Horizontal Cards Reel / Carousel */}
      <div className="px-3 flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        {displayList.map((art) => {
          const review = parseReview(art.gallery);
          return (
            <Link
              key={art.id}
              href={`/mobile/news/${art.slug}`}
              className="w-[220px] sm:w-[240px] shrink-0 snap-start bg-stone-50 dark:bg-[#1A1A1A] rounded-xl border border-stone-200 dark:border-stone-800 p-2.5 flex flex-col justify-between space-y-2 group shadow-2xs"
            >
              <div className="space-y-2">
                <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-800">
                  {art.featuredImage ? (
                    <Image
                      src={art.featuredImage}
                      alt={art.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <Film className="w-6 h-6" />
                    </div>
                  )}

                  <div className="absolute top-1.5 left-1.5">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                      {art.sourceType === 'movie_review'
                        ? 'मूवी रिव्यू'
                        : art.sourceType === 'viral'
                        ? 'दिलचस्प'
                        : art.sourceType === 'cricket_buzz'
                        ? 'क्रिकेट'
                        : 'सिनेमा'}
                    </span>
                  </div>

                  {art.sourceType === 'movie_review' && review?.rating && (
                    <div className="absolute top-1.5 right-1.5 bg-amber-500 text-white font-mono font-black text-[10px] px-1.5 py-0.2 rounded-md shadow flex items-center gap-0.5">
                      <Star className="w-2 h-2 fill-white text-white" />
                      <span>{review.rating}★</span>
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-bold text-stone-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#EA580C] dark:group-hover:text-amber-400 transition-colors">
                  {art.title}
                </h4>
              </div>

              {art.sourceType === 'movie_review' && review?.verdict ? (
                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 line-clamp-1">
                  {review.verdict}
                </p>
              ) : (
                <span className="text-[9px] text-stone-400 font-medium block">
                  {new Date(art.publishedAt).toLocaleDateString('hi-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
