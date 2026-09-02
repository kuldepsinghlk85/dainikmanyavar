import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import { db } from '@/lib/db';
import { formatHindiTimeAgo, formatCount } from '@/lib/utils';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;

  const articles = q.trim()
    ? await db.article.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
            { content: { contains: q } },
          ],
        },
        orderBy: { publishedAt: 'desc' },
        take: 30,
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      })
    : [];

  const formattedArticles = articles.map((a) => ({
    ...a,
    tags: a.tags.map((t) => t.tag),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1 max-w-4xl">
        <div className="border-b-2 border-[#F97316] pb-3 mb-6">
          <h1 className="text-2xl font-extrabold text-[#171717]">
            खोज परिणाम: {q ? `"${q}"` : 'कोई खोज पद नहीं दिया गया'}
          </h1>
          {q && <p className="text-xs text-stone-500 mt-1">कुल {articles.length} परिणाम पाए गए</p>}
        </div>

        {formattedArticles.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            {q ? 'आपकी खोज से मेल खाने वाली कोई खबर नहीं मिली।' : 'खबरें खोजने के लिए ऊपर दिए गए सर्च बार का उपयोग करें।'}
          </div>
        ) : (
          <div className="space-y-4">
            {formattedArticles.map((art) => (
              <article key={art.id} className="border border-stone-200 p-4 rounded-xl flex flex-col sm:flex-row gap-4 bg-white hover:border-orange-300 transition-colors">
                <div className="relative w-full sm:w-48 h-32 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                  <Image
                    src={art.featuredImage || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=700&q=80'}
                    alt={art.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {art.category.name}
                      </span>
                      {art.tags.slice(0, 3).map((t) => (
                        <Link key={t.slug} href={`/tag/${t.slug}`} className="tag-chip text-[10px]">
                          {t.name}
                        </Link>
                      ))}
                    </div>
                    <Link href={`/news/${art.slug}`}>
                      <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-snug hover:text-[#F97316]">
                        {art.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">{art.excerpt}</p>
                  </div>

                  <div className="text-[11px] text-stone-400 mt-2 flex justify-between">
                    <span>{formatHindiTimeAgo(art.publishedAt)}</span>
                    <span>👁 {formatCount(art.viewCount)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
