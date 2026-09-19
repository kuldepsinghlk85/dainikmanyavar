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
  Eye,
  Clock,
  Play,
} from 'lucide-react';

interface ManoranjanArticleItem {
  id: string;
  newsId: number;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  gallery: string | null;
  sourceType: string | null;
  isFeatured: boolean;
  publishedAt: string;
  viewCount?: number;
}

interface ManoranjanSectionProps {
  articles: ManoranjanArticleItem[];
  settings?: {
    showReviews?: boolean;
    showViral?: boolean;
    showCricket?: boolean;
    showFilms?: boolean;
  };
}

export default function ManoranjanSection({
  articles = [],
  settings = {
    showReviews: true,
    showViral: true,
    showCricket: true,
    showFilms: true,
  },
}: ManoranjanSectionProps) {
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

  // Filter based on active tab
  const filteredArticles = activeTab === 'all'
    ? articles
    : articles.filter((a) => a.sourceType === activeTab);

  const displayList = filteredArticles.length > 0 ? filteredArticles : articles;
  const leadStory = displayList[0];
  const sideArticles = displayList.slice(1, 5);
  const movieReviews = articles.filter((a) => a.sourceType === 'movie_review').slice(0, 4);

  return (
    <section className="py-6 border-b border-stone-200/80 bg-stone-50/50">
      <div className="wrap space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#EA580C] to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span>मनोरंजन</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-full font-sans uppercase">
                  सिनेमा • रिव्यू • बज़
                </span>
              </h2>
            </div>
          </div>

          {/* Subtype Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#EA580C] text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              सभी
            </button>

            {settings.showFilms && (
              <button
                onClick={() => setActiveTab('movies')}
                className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'movies'
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Film className="w-3 h-3" />
                <span>फिल्में</span>
              </button>
            )}

            {settings.showReviews && (
              <button
                onClick={() => setActiveTab('movie_review')}
                className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'movie_review'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Star className="w-3 h-3" />
                <span>मूवी रिव्यू</span>
              </button>
            )}

            {settings.showViral && (
              <button
                onClick={() => setActiveTab('viral')}
                className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'viral'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>दिलचस्प</span>
              </button>
            )}

            {settings.showCricket && (
              <button
                onClick={() => setActiveTab('cricket_buzz')}
                className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'cricket_buzz'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Trophy className="w-3 h-3" />
                <span>क्रिकेट बज़</span>
              </button>
            )}

            <Link
              href="/manoranjan"
              className="ml-2 text-xs font-black text-[#EA580C] hover:text-[#C2410C] flex items-center gap-0.5 shrink-0"
            >
              <span>सभी देखें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Main Grid: Lead Story + Side Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Lead Entertainment Story (7 Cols) */}
          {leadStory && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
              <Link href={`/news/${leadStory.slug}`} className="block relative aspect-video w-full overflow-hidden bg-stone-100">
                {leadStory.featuredImage ? (
                  <Image
                    src={leadStory.featuredImage}
                    alt={leadStory.title}
                    fill
                    unoptimized
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-900 text-white">
                    <Film className="w-12 h-12 text-[#EA580C]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-3.5 left-3.5 right-3.5 space-y-1.5 text-white">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#EA580C] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                      {leadStory.sourceType === 'movie_review'
                        ? '⭐ मूवी रिव्यू'
                        : leadStory.sourceType === 'viral'
                        ? '🔥 दिलचस्प'
                        : leadStory.sourceType === 'cricket_buzz'
                        ? '🏏 क्रिकेट बज़'
                        : '🎬 सिनेमा'}
                    </span>
                    {leadStory.sourceType === 'movie_review' && parseReview(leadStory.gallery)?.rating && (
                      <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                        <Star className="w-2.5 h-2.5 fill-white text-white" />
                        <span>{parseReview(leadStory.gallery).rating} / 5</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black leading-snug drop-shadow-sm group-hover:text-amber-300 transition-colors">
                    {leadStory.title}
                  </h3>
                </div>
              </Link>

              {leadStory.subtitle && (
                <div className="p-4 bg-white">
                  <p className="text-xs text-stone-600 font-medium line-clamp-2 leading-relaxed">
                    {leadStory.subtitle}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Right: Side 4 Story Cards (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3">
            {sideArticles.map((art) => {
              const review = parseReview(art.gallery);
              return (
                <Link
                  key={art.id}
                  href={`/news/${art.slug}`}
                  className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3 group"
                >
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                    {art.featuredImage ? (
                      <Image
                        src={art.featuredImage}
                        alt={art.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <Film className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-extrabold text-[#EA580C] uppercase tracking-wider">
                        {art.sourceType === 'movie_review'
                          ? 'रिव्यू'
                          : art.sourceType === 'viral'
                          ? 'दिलचस्प'
                          : art.sourceType === 'cricket_buzz'
                          ? 'क्रिकेट'
                          : 'फिल्में'}
                      </span>
                      {art.sourceType === 'movie_review' && review?.rating && (
                        <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1 rounded font-mono border border-amber-200">
                          {review.rating}★
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-[#EA580C] transition-colors">
                      {art.title}
                    </h4>
                    <span className="text-[10px] text-stone-400 font-medium block">
                      {new Date(art.publishedAt).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* SPECIAL WIDGET: Movie Reviews Highlight Row (when reviews enabled) */}
        {settings.showReviews && movieReviews.length > 0 && activeTab === 'all' && (
          <div className="mt-4 pt-4 border-t border-stone-200/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-black text-stone-900">
                  ताज़ा मूवी रिव्यू (Latest Movie Reviews)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('movie_review')}
                className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-0.5 cursor-pointer"
              >
                <span>सभी रिव्यू</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {movieReviews.map((rev) => {
                const meta = parseReview(rev.gallery);
                return (
                  <Link
                    key={rev.id}
                    href={`/news/${rev.slug}`}
                    className="bg-white rounded-xl border border-amber-200/80 p-3 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-stone-100">
                        {rev.featuredImage ? (
                          <Image
                            src={rev.featuredImage}
                            alt={rev.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-900 text-amber-400">
                            <Star className="w-8 h-8" />
                          </div>
                        )}
                        {meta?.rating && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-white font-mono font-black text-xs px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-white text-white" />
                            <span>{meta.rating}</span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                        {rev.title}
                      </h4>
                    </div>

                    {meta?.verdict && (
                      <p className="mt-2 text-[10.5px] font-bold text-amber-800 bg-amber-50/80 px-2 py-1 rounded border border-amber-200/60 line-clamp-1">
                        वर्डिक्ट: {meta.verdict}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
