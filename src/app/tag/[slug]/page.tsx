import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import { db } from '@/lib/db';
import { formatHindiTimeAgo, formatCount } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const tag = await db.tag.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug: slug },
        { name: decodedSlug },
        { name: '#' + decodedSlug },
      ],
    },
  });
  if (!tag) return {};

  return {
    title: tag.seoTitle || `${tag.name} की ताज़ा ख़बरें | दैनिक मान्यवर`,
    description: tag.seoDescription || `${tag.name} से जुड़ी दैनिक मान्यवर की सभी खबरें।`,
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const tag = await db.tag.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug: slug },
        { name: decodedSlug },
        { name: '#' + decodedSlug },
      ],
    },
    include: {
      articleTags: {
        include: {
          article: {
            include: {
              category: true,
              tags: { include: { tag: true } },
            },
          },
        },
        orderBy: { article: { publishedAt: 'desc' } },
        take: 30,
      },
    },
  });

  if (!tag) {
    notFound();
  }

  const articles = tag.articleTags.map((at) => ({
    ...at.article,
    tags: at.article.tags.map((t) => t.tag),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1">
        {/* Tag Header Banner */}
        <div className="bg-[#FFF1E6] border border-[#FDBA74] p-5 rounded-xl mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#C2410C]">
            {tag.name.startsWith('#') ? tag.name : `#${tag.name}`}
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            {tag.description || `कुल ${articles.length} समाचार इस टैग से जुड़े हैं।`}
          </p>
        </div>

        {/* Article Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            इस टैग के अंतर्गत फिलहाल कोई समाचार उपलब्ध नहीं है।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((art) => (
              <article key={art.id} className="border border-stone-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="relative w-full h-[180px] bg-stone-100">
                    <Image
                      src={art.featuredImage || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=700&q=80'}
                      alt={art.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                      {art.tags.slice(0, 3).map((t) => (
                        <Link
                          key={t.slug}
                          href={`/tag/${t.slug}`}
                          className="text-[10px] font-bold bg-white/95 text-[#C2410C] px-2 py-0.5 rounded-full border border-orange-200 shadow-sm"
                        >
                          {t.name.startsWith('#') ? t.name : `#${t.name}`}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="p-4">
                    <Link href={`/news/${art.slug}`}>
                      <h3 className="text-base font-bold text-stone-900 leading-snug line-clamp-2 hover:text-[#F97316]">
                        {art.title}
                      </h3>
                    </Link>
                    <p className="text-stone-600 text-xs mt-2 line-clamp-2">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-3 text-xs text-stone-400 flex justify-between border-t border-stone-100 pt-2">
                  <span>{formatHindiTimeAgo(art.publishedAt)}</span>
                  <span>👁 {formatCount(art.viewCount)}</span>
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
