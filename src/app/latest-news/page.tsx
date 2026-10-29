import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import { db } from '@/lib/db';
import { formatHindiTimeAgo, formatCount } from '@/lib/utils';
import { Flame, Clock, Eye, ChevronLeft, ChevronRight, Newspaper, ArrowLeft } from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'ताज़ा एवं ट्रेंडिंग समाचार | दैनिक मान्यवर (All Latest News)',
  description: 'दैनिक मान्यवर पर उत्तर प्रदेश, जौनपुर व देश-विदेश की सभी ताज़ा एवं नवीनतम ख़बरें सबसे पहले पढ़ें।',
};

interface LatestNewsPageProps {
  searchParams: Promise<{
    limit?: string;
    page?: string;
  }>;
}

export default async function LatestNewsPage({ searchParams }: LatestNewsPageProps) {
  const resolvedParams = await searchParams;
  
  // Parse limit: strictly support 20, 50, 100 (default 20)
  let limit = parseInt(resolvedParams.limit || '20', 10);
  if (![20, 50, 100].includes(limit)) {
    limit = 20;
  }

  // Parse page: 1-indexed
  let page = parseInt(resolvedParams.page || '1', 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  // Fetch total count of published articles
  const totalCount = await db.article.count({
    where: {
      status: 'PUBLISHED',
      category: {
        slug: { not: 'manoranjan' },
      },
    },
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  // Query articles with strict newest-first ordering
  const articles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      category: {
        slug: { not: 'manoranjan' },
      },
    },
    orderBy: [
      { newsId: 'desc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    skip,
    take: limit,
    select: {
      id: true,
      newsId: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      viewCount: true,
      publishedAt: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      tags: {
        take: 2,
        select: {
          tag: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-stone-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#EA580C] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>होम</span>
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-bold">ताज़ा एवं ट्रेंडिंग समाचार</span>
        </nav>

        {/* Page Main Header */}
        <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6 rounded-2xl border-2 border-orange-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-orange-500 text-white rounded-xl shadow-xs">
                <Flame className="w-5 h-5 animate-bounce" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
                ⚡ ताज़ा एवं ट्रेंडिंग समाचार
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              दैनिक मान्यवर पर उत्तर प्रदेश, जौनपुर व देश की सभी नवीनतम ख़बरें सबसे पहले — नवीनतम समाचार सबसे ऊपर।
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-white px-4 py-2 rounded-xl border border-orange-200 shadow-2xs font-mono">
            <span className="text-xs font-bold text-stone-600">कुल प्रकाशित समाचार:</span>
            <span className="text-sm font-black text-[#EA580C]">{totalCount}</span>
          </div>
        </div>

        {/* 🎛️ Page Size & Pagination Control Toolbar */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          {/* Per Page Selector: 20, 50, 100 */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-extrabold text-stone-800 flex items-center gap-1">
              <span>📋</span>
              <span>एक साथ देखें:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {[20, 50, 100].map((num) => {
                const isActive = limit === num;
                return (
                  <Link
                    key={num}
                    href={`/latest-news?limit=${num}&page=1`}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                      isActive
                        ? 'bg-[#EA580C] text-white shadow-sm ring-2 ring-orange-300'
                        : 'bg-white text-stone-700 border border-stone-300 hover:bg-orange-50 hover:border-orange-300'
                    }`}
                  >
                    {num} समाचार {isActive ? '✓' : ''}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Current Page Range Info */}
          <div className="text-xs font-bold text-stone-600">
            पृष्ठ <span className="text-stone-900 font-black">{page}</span> / {totalPages} (दिखा रहे हैं: {skip + 1} - {Math.min(skip + limit, totalCount)})
          </div>
        </div>

        {/* 📰 News Listing Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <Newspaper className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-700">कोई समाचार उपलब्ध नहीं है।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art, index) => {
              const rankNumber = skip + index + 1;
              const isFirst = rankNumber === 1;

              return (
                <article
                  key={art.id}
                  className={`group relative bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between hover:shadow-lg ${
                    isFirst ? 'border-orange-300 ring-2 ring-orange-200/60' : 'border-stone-200 hover:border-orange-200'
                  }`}
                >
                  <div>
                    {/* Thumbnail Image Container */}
                    <div className="relative w-full h-[200px] bg-stone-100 overflow-hidden">
                      <Image
                        src={art.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=700&q=80'}
                        alt={art.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Rank Number Badge */}
                      <span
                        className={`absolute top-2.5 left-2.5 z-10 px-2.5 py-1 text-xs font-black rounded-lg shadow-md flex items-center gap-1 ${
                          isFirst
                            ? 'bg-[#EA580C] text-white ring-2 ring-orange-200'
                            : 'bg-black/75 text-white backdrop-blur-xs'
                        }`}
                      >
                        <span>#{rankNumber}</span>
                        {isFirst && <span className="text-[10px]">लेटेस्ट</span>}
                      </span>

                      {/* Category Badge */}
                      {art.category && (
                        <span className="absolute top-2.5 right-2.5 z-10 bg-orange-600/90 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
                          {art.category.name}
                        </span>
                      )}
                    </div>

                    {/* News Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
                        <span className="flex items-center gap-1 text-stone-500">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          <span>{formatHindiTimeAgo(art.publishedAt)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{formatCount(art.viewCount)} व्यूज</span>
                        </span>
                      </div>

                      <h2 className="text-base font-extrabold text-stone-900 group-hover:text-[#EA580C] line-clamp-2 leading-snug transition-colors">
                        <Link href={`/news/${art.newsId || art.slug}`}>
                          {art.title}
                        </Link>
                      </h2>

                      {art.excerpt && (
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {art.excerpt}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Read Article Footer Link */}
                  <div className="px-4 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap">
                      {art.tags?.map((t) => (
                        <span key={t.tag.slug} className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          #{t.tag.name.replace(/^#/, '')}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/news/${art.newsId || art.slug}`}
                      className="text-xs font-black text-[#EA580C] hover:text-orange-700 flex items-center gap-1 hover:underline"
                    >
                      <span>पढ़ें</span>
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* 📄 Bottom Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-stone-200">
            {/* Previous Page */}
            {page > 1 ? (
              <Link
                href={`/latest-news?limit=${limit}&page=${page - 1}`}
                className="px-4 py-2 bg-white border border-stone-300 rounded-xl text-xs font-black text-stone-700 hover:bg-stone-50 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>पिछला पृष्ठ</span>
              </Link>
            ) : (
              <span className="px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-400 cursor-not-allowed flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" />
                <span>पिछला पृष्ठ</span>
              </span>
            )}

            {/* Page Number Pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 7 && page > 4) {
                  pageNum = page - 3 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (6 - i);
                }

                const isCurrent = page === pageNum;

                return (
                  <Link
                    key={pageNum}
                    href={`/latest-news?limit=${limit}&page=${pageNum}`}
                    className={`w-9 h-9 rounded-xl text-xs font-black flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-[#EA580C] text-white shadow-sm ring-2 ring-orange-300'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>

            {/* Next Page */}
            {page < totalPages ? (
              <Link
                href={`/latest-news?limit=${limit}&page=${page + 1}`}
                className="px-4 py-2 bg-white border border-stone-300 rounded-xl text-xs font-black text-stone-700 hover:bg-stone-50 flex items-center gap-1 transition-colors"
              >
                <span>अगला पृष्ठ</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-400 cursor-not-allowed flex items-center gap-1">
                <span>अगला पृष्ठ</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
