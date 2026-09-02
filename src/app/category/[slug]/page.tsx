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
import { Flame, ArrowLeft, ExternalLink } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === 'latest') {
    return {
      title: 'ताज़ा ख़बरें (All Latest News) | दैनिक मान्यवर',
      description: 'दैनिक मान्यवर पर उत्तर प्रदेश, जौनपुर व देश की सभी नवीनतम ताज़ा ख़बरें पढ़ें।',
    };
  }

  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return {};

  return {
    title: `${category.name} समाचार | दैनिक मान्यवर`,
    description: `${category.name} से जुड़ी ताज़ा ख़बरें और अपडेट पढ़ें दैनिक मान्यवर पर।`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let categoryName = '';
  let articles: any[] = [];

  if (slug === 'latest') {
    categoryName = '🔥 ताज़ा ख़बरें (All Latest News)';
    articles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 60,
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  } else {
    const category = await db.category.findUnique({ where: { slug } });
    if (!category) {
      notFound();
    }
    categoryName = category.name;
    articles = await db.article.findMany({
      where: { primaryCategoryId: category.id, status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 40,
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  const formattedArticles = articles.map((a) => ({
    ...a,
    tags: a.tags.map((t) => t.tag),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1 space-y-6">
        {/* Category Header */}
        <div className="border-b-4 border-[#F97316] pb-3 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">{categoryName}</h1>
          <span className="text-xs font-bold bg-orange-100 text-[#C2410C] px-3 py-1 rounded-full font-mono">
            कुल {formattedArticles.length} समाचार
          </span>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {formattedArticles.map((art) => (
            <article key={art.id} className="border border-stone-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div>
                <div className="relative w-full h-[190px] bg-stone-100 overflow-hidden">
                  <Image
                    src={art.featuredImage || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=700&q=80'}
                    alt={art.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                    {art.category && (
                      <span className="text-[10px] font-black bg-[#EA580C] text-white px-2 py-0.5 rounded shadow-sm">
                        {art.category.name}
                      </span>
                    )}
                    {art.tags.slice(0, 2).map((t: any) => (
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

                <div className="p-4 space-y-2">
                  <Link href={`/news/${art.slug}`}>
                    <h3 className="text-base font-extrabold text-stone-900 leading-snug line-clamp-2 hover:text-[#F97316]">
                      {art.title}
                    </h3>
                  </Link>
                  <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-3 text-xs text-stone-400 flex justify-between border-t border-stone-100 pt-2 font-mono">
                <span>{formatHindiTimeAgo(art.publishedAt)}</span>
                <span>👁 {formatCount(art.viewCount)}</span>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
