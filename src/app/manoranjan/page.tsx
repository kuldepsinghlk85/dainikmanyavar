import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/public/Header';
import TopBar from '@/components/public/TopBar';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import { db } from '@/lib/db';
import {
  Film,
  Star,
  Flame,
  Trophy,
  ChevronRight,
  Clock,
  Eye,
  Sparkles,
} from 'lucide-react';

export const revalidate = 60;

export default async function ManoranjanPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type: subtype } = await searchParams;

  // 1. Fetch menu categories for Navigation
  const menuCategories = await db.category.findMany({
    where: { isHeaderMenu: true },
    orderBy: { order: 'asc' },
  });

  // 2. Fetch Manoranjan category
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
      excerpt: true,
      featuredImage: true,
      gallery: true,
      sourceType: true,
      isFeatured: true,
      viewCount: true,
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
    { id: '', label: 'सभी खबरें' },
    { id: 'movies', label: '🎬 फिल्में व सिनेमा' },
    { id: 'movie_review', label: '⭐ फिल्मों के रिव्यू' },
    { id: 'viral', label: '🔥 दिलचस्प खबरें' },
    { id: 'cricket_buzz', label: '🏏 क्रिकेट बज़' },
  ];

  const currentTab = subtype || '';

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans">
      <TopBar />
      <Header />
      <Navigation categories={menuCategories} />

      <main className="flex-1 wrap py-6 space-y-6">
        {/* Breadcrumb & Heading */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <Link href="/" className="hover:text-[#EA580C]">होम</Link>
            <span>/</span>
            <span className="text-[#EA580C]">मनोरंजन हब</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EA580C] to-amber-500 text-white flex items-center justify-center shadow-xs">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                  मनोरंजन हब (Entertainment Hub)
                </h1>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  बॉलीवुड, सिनेमा, दिलचस्प वायरल किस्से, क्रिकेट गॉसिप और निष्पक्ष मूवी रिव्यू
                </p>
              </div>
            </div>
          </div>

          {/* Sub-type Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-stone-100 scrollbar-none">
            {tabs.map((t) => {
              const isActive = currentTab === t.id;
              return (
                <Link
                  key={t.id}
                  href={t.id ? `/manoranjan?type=${t.id}` : '/manoranjan'}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-orange-50 text-[#EA580C] rounded-2xl flex items-center justify-center mx-auto">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900">इस श्रेणी में अभी कोई खबर नहीं है</h3>
            <p className="text-xs text-stone-500">कृपया जल्द ही पुनः देखें।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((art) => {
              const review = parseReview(art.gallery);
              return (
                <Link
                  key={art.id}
                  href={`/news/${art.slug}`}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                      {art.featuredImage ? (
                        <Image
                          src={art.featuredImage}
                          alt={art.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-900 text-white">
                          <Film className="w-8 h-8 text-[#EA580C]" />
                        </div>
                      )}

                      <div className="absolute top-2.5 left-2.5">
                        <span className="bg-[#EA580C] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                          {art.sourceType === 'movie_review'
                            ? '⭐ मूवी रिव्यू'
                            : art.sourceType === 'viral'
                            ? '🔥 दिलचस्प'
                            : art.sourceType === 'cricket_buzz'
                            ? '🏏 क्रिकेट बज़'
                            : '🎬 सिनेमा'}
                        </span>
                      </div>

                      {art.sourceType === 'movie_review' && review?.rating && (
                        <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white font-mono font-black text-xs px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-white text-white" />
                          <span>{review.rating} / 5</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-sm sm:text-base font-black text-stone-900 leading-snug group-hover:text-[#EA580C] transition-colors line-clamp-2">
                        {art.title}
                      </h3>

                      {art.subtitle && (
                        <p className="text-xs text-stone-600 font-medium line-clamp-2 leading-relaxed">
                          {art.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-medium text-stone-400">
                    <span>
                      {new Date(art.publishedAt).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>{art.viewCount || 0} व्यूज</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
