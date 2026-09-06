import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import MobileCategoryChips from '@/components/mobile/MobileCategoryChips';
import MobileNewsList from '@/components/mobile/MobileNewsList';
import MobileFooter from '@/components/mobile/MobileFooter';
import { ArrowLeft, Search, Flame } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MobileSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const query = q.trim();

  const articles = query
    ? await db.article.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
            { content: { contains: query } },
          ],
        },
        orderBy: [{ publishedAt: 'desc' }, { newsId: 'desc' }],
        take: 30,
        include: {
          category: { select: { name: true, slug: true } },
        },
      })
    : [];

  const categories = await db.category.findMany({
    where: { isHeaderMenu: true },
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="space-y-2 bg-stone-100 dark:bg-[#0D0D0D] min-h-screen">
      {/* Category Chips Bar */}
      <MobileCategoryChips categories={categories} />

      {/* Search Header Bar */}
      <div className="bg-white dark:bg-[#141414] p-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/mobile" className="p-1 -ml-1 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5">
              <Search className="w-4 h-4 text-[#E53935]" />
              <span>खोज: {query ? `"${query}"` : 'सभी खबरें'}</span>
            </h1>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#E53935] bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900/60 font-mono">
          {articles.length} परिणाम
        </span>
      </div>

      {/* Inline Search Bar */}
      <div className="px-3">
        <form action="/mobile/search" method="GET" className="relative flex items-center">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="मुद्दा, जिला या खबर खोजें..."
            className="w-full pl-9 pr-20 py-2 bg-white dark:bg-[#181818] text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-[#E53935]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-[#E53935] hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            खोजें
          </button>
        </form>
      </div>

      {/* Results or Empty State */}
      {articles.length === 0 ? (
        <div className="bg-white dark:bg-[#141414] mx-3 rounded-2xl p-8 text-center space-y-3 border border-stone-200 dark:border-stone-800">
          <Search className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
          <h3 className="text-sm font-black text-stone-800 dark:text-stone-200">
            {query ? `"${query}" से संबंधित कोई समाचार नहीं मिला` : 'कृपया खोजने के लिए कोई शब्द दर्ज करें'}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            अन्य कीवर्ड जैसे <strong>जौनपुर, उत्तर प्रदेश, क्रिकेट, सरकार</strong> लिखकर देखें।
          </p>
          <div className="pt-2">
            <Link
              href="/mobile/category/latest"
              className="inline-flex items-center gap-1.5 bg-[#E53935] text-white text-xs font-black px-4 py-2 rounded-xl shadow-sm hover:bg-red-700 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>ताज़ा मुख्य समाचार देखें</span>
            </Link>
          </div>
        </div>
      ) : (
        <MobileNewsList articles={articles} />
      )}

      {/* Footer */}
      <MobileFooter />
    </div>
  );
}
