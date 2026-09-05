import React from 'react';
import { db } from '@/lib/db';
import MobileCategoryChips from '@/components/mobile/MobileCategoryChips';
import MobileBreakingNews from '@/components/mobile/MobileBreakingNews';
import MobileHeroCard from '@/components/mobile/MobileHeroCard';
import MobileNewsList from '@/components/mobile/MobileNewsList';
import MobileVideoFeed from '@/components/mobile/MobileVideoFeed';
import MobileFooter from '@/components/mobile/MobileFooter';
import Link from 'next/link';
import { MapPin, Sparkles } from 'lucide-react';

export const revalidate = 60; // 1-minute ISR

export default async function MobileHomePage() {
  // 1. Fetch top lead article (from Hero Slider sequence #1 if configured, else latest published)
  const sliderSection = await db.homepageSection.findUnique({
    where: { sectionKey: 'hero_slider' },
  });

  let topLeadArticleId: string | null = null;
  if (sliderSection?.manualArticles) {
    try {
      const list = JSON.parse(sliderSection.manualArticles);
      const firstEnabled = list.find((i: any) => i.enabled !== false);
      if (firstEnabled) topLeadArticleId = firstEnabled.id;
    } catch (_) {}
  }

  const leadArticle = await db.article.findFirst({
    where: {
      status: 'PUBLISHED',
      ...(topLeadArticleId ? { id: topLeadArticleId } : {}),
    },
    orderBy: [
      { newsId: 'desc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      category: { select: { name: true, slug: true } },
    },
  });

  // 2. Fetch Breaking news ticker
  const rawBreaking = await db.breakingNews.findMany({
    where: { isArchived: false, active: true },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    include: {
      article: { select: { title: true, slug: true } },
    },
    take: 8,
  });

  const breakingItems = rawBreaking.map((b) => ({
    id: b.id,
    title: b.customHeadline || b.article?.title || 'दैनिक मान्यवर विशेष अपडेट',
    slug: b.article?.slug || '',
  }));

  // 3. Fetch latest news stream
  const latestArticles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      ...(leadArticle ? { id: { not: leadArticle.id } } : {}),
    },
    orderBy: [
      { newsId: 'desc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 12,
    include: {
      category: { select: { name: true, slug: true } },
    },
  });

  // 4. Fetch videos
  const dbVideos = await db.article.findMany({
    where: { status: 'PUBLISHED', videoEnabled: true },
    orderBy: [{ newsId: 'desc' }, { publishedAt: 'desc' }],
    take: 6,
    select: {
      id: true,
      title: true,
      slug: true,
      videoThumbnail: true,
      featuredImage: true,
      videoDuration: true,
      category: { select: { name: true } },
    },
  });

  const formattedVideos = dbVideos.map((v) => ({
    id: v.id,
    title: v.title,
    slug: v.slug,
    thumbnail: v.videoThumbnail || v.featuredImage || 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=400&q=80',
    duration: v.videoDuration || '02:30',
    category: v.category?.name || 'वीडियो',
  }));

  // 5. Fetch Regional / District News (Jaunpur, Varanasi etc)
  const jaunpurArticles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      location: { name: { contains: 'जौनपुर' } },
    },
    orderBy: [{ newsId: 'desc' }, { publishedAt: 'desc' }],
    take: 4,
    include: {
      category: { select: { name: true } },
    },
  });

  const stateArticles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      category: { slug: 'uttar-pradesh' },
    },
    orderBy: [{ newsId: 'desc' }, { publishedAt: 'desc' }],
    take: 5,
    include: {
      category: { select: { name: true } },
    },
  });

  // 6. Fetch categories for chips
  const categories = await db.category.findMany({
    where: { isHeaderMenu: true },
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="space-y-1">
      {/* Category Chips Bar */}
      <MobileCategoryChips categories={categories} activeSlug="home" />

      {/* Breaking News Single Line Ticker */}
      <MobileBreakingNews items={breakingItems} />

      {/* Main Lead Story */}
      {leadArticle && <MobileHeroCard article={leadArticle} />}

      {/* Quick Regional Bar */}
      <div className="bg-amber-500 text-white px-3.5 py-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-black">
          <MapPin className="w-4 h-4" />
          <span>जौनपुर व पूर्वांचल हलचल</span>
        </div>
        <Link href="/district/जौनपुर" className="text-[11px] font-bold text-amber-100 hover:text-white underline">
          सभी खबरें &rarr;
        </Link>
      </div>

      {/* Latest News Feed 1 (Top 4) */}
      <MobileNewsList
        articles={latestArticles.slice(0, 4)}
        sectionTitle="ताज़ा सुर्खियां"
        viewAllLink="/mobile/category/latest"
      />

      {/* Video Feed Section */}
      {formattedVideos.length > 0 && <MobileVideoFeed videos={formattedVideos} />}

      {/* Jaunpur Special Feed */}
      {jaunpurArticles.length > 0 && (
        <MobileNewsList
          articles={jaunpurArticles}
          sectionTitle="📍 जौनपुर आसपास"
          viewAllLink="/district/जौनपुर"
        />
      )}

      {/* Uttar Pradesh Feed */}
      {stateArticles.length > 0 && (
        <MobileNewsList
          articles={stateArticles}
          sectionTitle="🏛️ उत्तर प्रदेश"
          viewAllLink="/mobile/category/uttar-pradesh"
        />
      )}

      {/* More Latest News */}
      {latestArticles.length > 4 && (
        <MobileNewsList
          articles={latestArticles.slice(4)}
          sectionTitle="अन्य प्रमुख समाचार"
        />
      )}

      {/* Footer */}
      <MobileFooter />
    </div>
  );
}
