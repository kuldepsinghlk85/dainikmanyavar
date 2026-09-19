import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import MobileFooter from '@/components/mobile/MobileFooter';
import { db } from '@/lib/db';
import {
  Film,
  Star,
  Flame,
  Trophy,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

export const revalidate = 60;

export default async function MobileManoranjanPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type: subtype } = await searchParams;

  // 1. Fetch Manoranjan category
  const manoranjanCat = await db.category.findUnique({
    where: { slug: 'manoranjan' },
  });

  const where: any = {
    status: 'PUBLISHED',
  };

  if (manoranjanCat) {
    where.primaryCategoryId = manoranjanCat.id;
  }

  if (subtype && subtype !== 'all') {
    where.sourceType = subtype;
  }

  const articles = await db.article.findMany({
    where,
    orderBy: [
      { isFeatured: 'desc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 30,
    select: {
      id: true,
      newsId: true,
      title: true,
      subtitle: true,
      slug: true,
      featuredImage: true,
      gallery: true,
      sourceType: true,
      isFeatured: true,
      publishedAt: true,
    },
  });

  const parseReview = (galleryJson: string | null) => {
    if (!galleryJson) return null;
    try {
      return JSON.parse(galleryJson);
    } catch {
      return null;
    }
  };

  const tabs = [
    { id: '', label: 'सभी' },
    { id: 'movies', label: '🎬 फिल्में' },
    { id: 'movie_review', label: '⭐ मूवी रिव्यू' },
    { id: 'viral', label: '🔥 दिलचस्प' },
    { id: 'cricket_buzz', label: '🏏 क्रिकेट' },
  ];

  const currentTab = subtype || '';

  return (
    <div className="bg-stone-100 dark:bg-[#0D0D0D] min-h-screen pb-16 transition-colors font-sans">
      <MobileHeader />

      {/* Top Heading */}
      <div className="bg-white dark:bg-[#121212] px-3.5 py-3 border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/mobile"
            className="p-1 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#EA580C] to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Film className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-base font-black text-stone-900 dark:text-white">
              मनोरंजन हब (Entertainment)
            </h1>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((t) => {
            const isActive = currentTab === t.id;
            return (
              <Link
                key={t.id}
                href={t.id ? `/mobile/manoranjan?type=${t.id}` : '/mobile/manoranjan'}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Articles Feed */}
      <div className="p-3 space-y-3">
        {articles.length === 0 ? (
          <div className="bg-white dark:bg-[#161616] p-8 rounded-2xl text-center space-y-2 border border-stone-200 dark:border-stone-800">
            <Film className="w-8 h-8 text-[#EA580C] mx-auto" />
            <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
              इस श्रेणी में अभी कोई खबर नहीं है
            </p>
          </div>
        ) : (
          articles.map((art) => {
            const review = parseReview(art.gallery);
            return (
              <Link
                key={art.id}
                href={`/mobile/news/${art.slug}`}
                className="bg-white dark:bg-[#161616] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs block group"
              >
                <div className="relative aspect-[16/9] w-full bg-stone-200 dark:bg-stone-800">
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
                      <Film className="w-8 h-8 text-[#EA580C]" />
                    </div>
                  )}

                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/75 text-white backdrop-blur-xs">
                      {art.sourceType === 'movie_review'
                        ? '⭐ मूवी रिव्यू'
                        : art.sourceType === 'viral'
                        ? '🔥 दिलचस्प'
                        : art.sourceType === 'cricket_buzz'
                        ? '🏏 क्रिकेट'
                        : '🎬 सिनेमा'}
                    </span>
                  </div>

                  {art.sourceType === 'movie_review' && review?.rating && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white font-mono font-black text-xs px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-white text-white" />
                      <span>{review.rating}★</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 space-y-1.5">
                  <h2 className="text-sm font-black text-stone-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#EA580C] dark:group-hover:text-amber-400 transition-colors">
                    {art.title}
                  </h2>

                  {art.subtitle && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-medium line-clamp-2">
                      {art.subtitle}
                    </p>
                  )}

                  {art.sourceType === 'movie_review' && review?.verdict && (
                    <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200 dark:border-amber-800/60 line-clamp-1">
                      वर्डिक्ट: {review.verdict}
                    </p>
                  )}

                  <span className="text-[10px] text-stone-400 font-medium block pt-1">
                    {new Date(art.publishedAt).toLocaleDateString('hi-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <MobileFooter />
      <MobileBottomNav />
    </div>
  );
}
