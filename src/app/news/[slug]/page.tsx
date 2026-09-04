import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import AudioPlayer from '@/components/public/AudioPlayer';
import ShareBar from '@/components/public/ShareBar';
import TrendingSection from '@/components/public/TrendingSection';
import PopularTagsSection from '@/components/public/PopularTagsSection';
import AdBanner from '@/components/public/AdBanner';
import Footer from '@/components/public/Footer';
import { db } from '@/lib/db';
import { formatHindiDate, formatCount, calculateReadingTime } from '@/lib/utils';
import { generateNewsArticleJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const article = await db.article.findFirst({
    where: { OR: [{ slug: decodedSlug }, { slug }, { id: slug }] },
    select: { title: true, excerpt: true, featuredImage: true },
  });

  if (!article) return {};

  return {
    title: `${article.title} | दैनिक मान्यवर`,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      images: article.featuredImage ? [{ url: article.featuredImage }] : [],
    },
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const article = await db.article.findFirst({
    where: { OR: [{ slug: decodedSlug }, { slug }, { id: slug }] },
    include: {
      category: true,
      author: true,
      location: true,
      tags: { include: { tag: true } },
    },
  });

  if (!article || article.status !== 'PUBLISHED') {
    notFound();
  }

  // Increment view count asynchronously
  await db.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const tags = article.tags.map((t) => t.tag);

  // Fetch related news & trending articles for sidebar
  const [relatedArticles, trendingArticles] = await Promise.all([
    db.article.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: article.id },
        primaryCategoryId: article.primaryCategoryId,
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: { tags: { include: { tag: true } } },
    }),
    db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [
        { forceTrending: 'desc' },
        { viewCount: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: 5,
      select: { id: true, title: true, slug: true, viewCount: true },
    }),
  ]);

  const jsonLd = generateNewsArticleJsonLd({
    title: article.title,
    excerpt: article.excerpt || undefined,
    slug: article.slug,
    featuredImage: article.featuredImage || undefined,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: article.author?.name,
    categoryName: article.category?.name,
  });

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'होम', url: 'https://dainikmanyawar.in' },
    { name: article.category?.name || 'समाचार', url: `https://dainikmanyawar.in/category/${article.category?.slug || 'news'}` },
    { name: article.title, url: `https://dainikmanyawar.in/news/${article.slug}` },
  ]);

  const readingTime = calculateReadingTime(article.content);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <TopBar />
      <Header />
      <Navigation />

      {/* 2-Column News Article Layout */}
      <main className="wrap py-4 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-5">
          {/* Main Article Content */}
          <article className="min-w-0">
            {/* Breadcrumb Navigation */}
            <nav className="text-xs text-stone-500 mb-3 flex items-center gap-1.5 flex-wrap">
              <Link href="/" className="hover:text-[#F97316]">होम</Link>
              <span>/</span>
              {article.category && (
                <>
                  <Link href={`/category/${article.category.slug}`} className="hover:text-[#F97316]">
                    {article.category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-stone-800 line-clamp-1">{article.title}</span>
            </nav>

            {/* Category & Tag Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {article.category && (
                <Link
                  href={`/category/${article.category.slug}`}
                  className="bg-[#EA580C] text-white text-xs font-bold px-3 py-1 rounded-full uppercase"
                >
                  {article.category.name}
                </Link>
              )}
              {tags.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tag/${t.slug}`}
                  className="text-xs bg-stone-100 hover:bg-orange-100 text-stone-700 px-2.5 py-1 rounded-full font-bold transition-colors"
                >
                  {t.name.startsWith('#') ? t.name : `#${t.name}`}
                </Link>
              ))}
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#171717] leading-tight mb-3">
              {article.title}
            </h1>

            {/* Metadata & Author Credit */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 border-y border-stone-200 py-2.5 my-3">
              <div className="flex items-center gap-3">
                {article.author && (
                  <Link href={`/author/${article.author.slug}`} className="font-bold text-[#C2410C] hover:underline">
                    ✍️ {article.author.name}
                  </Link>
                )}
                <span>•</span>
                <span>📅 {formatHindiDate(article.publishedAt)}</span>
              </div>

              <div className="flex items-center gap-3">
                <span>⏱️ {readingTime} मिनट पठन</span>
                <span>👁 {formatCount(article.viewCount)} व्यूज</span>
              </div>
            </div>

            {/* Prominent Audio Player (🔊 समाचार सुनें) */}
            {article.allowAudio && (
              <AudioPlayer articleId={article.id} title={article.title} content={article.content} />
            )}

            {/* Featured Image */}
            {article.featuredImage && (
              <div className="relative w-full h-[260px] sm:h-[380px] rounded-xl overflow-hidden my-4 bg-stone-100">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            )}

            {/* Social Share & Reaction Bar */}
            <ShareBar
              articleId={article.id}
              title={article.title}
              slug={article.slug}
              initialLikeCount={article.likeCount}
            />

            {/* Article Body Content */}
            <div
              className="prose prose-lg max-w-none text-[#171717] leading-relaxed my-5 font-sans text-base sm:text-lg space-y-4"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* In-Article Advertisement */}
            <AdBanner position="header_wide" sizeText="In-Article Ad Banner (728×90)" />

            {/* Bottom Social Share */}
            <ShareBar
              articleId={article.id}
              title={article.title}
              slug={article.slug}
              initialLikeCount={article.likeCount}
            />

            {/* Related News (यह भी पढ़ें) */}
            {relatedArticles.length > 0 && (
              <section className="mt-8 pt-5 border-t-2 border-[#F97316]">
                <h3 className="text-xl font-bold text-[#171717] mb-4">📖 यह भी पढ़ें</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedArticles.map((rel) => (
                    <div key={rel.id} className="flex gap-3 border border-stone-200 p-3 rounded-lg hover:border-orange-300 transition-colors bg-white">
                      <div className="relative w-24 h-20 rounded overflow-hidden bg-stone-100 flex-shrink-0">
                        <Image
                          src={rel.featuredImage || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=700&q=80'}
                          alt={rel.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link href={`/news/${rel.slug}`}>
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 hover:text-[#F97316]">
                            {rel.title}
                          </h4>
                        </Link>
                        <span className="text-[11px] text-stone-400 mt-1 block">👁 {formatCount(rel.viewCount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Right Sidebar */}
          <aside className="space-y-4">
            <TrendingSection articles={trendingArticles} />
            <AdBanner position="sidebar_box" sizeText="300 × 250 / Sidebar Ad #1" />
            <PopularTagsSection />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
