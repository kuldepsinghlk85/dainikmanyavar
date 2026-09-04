import React from 'react';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import BreakingTicker from '@/components/public/BreakingTicker';
import AdBanner from '@/components/public/AdBanner';
import HeroSection from '@/components/public/HeroSection';
import TrendingSection from '@/components/public/TrendingSection';
import LatestNewsCards from '@/components/public/LatestNewsCards';
import DistrictNewsSection from '@/components/public/DistrictNewsSection';
import MultiTagNewsSection from '@/components/public/MultiTagNewsSection';
import VideoNewsSection from '@/components/public/VideoNewsSection';
import PopularTagsSection from '@/components/public/PopularTagsSection';
import SocialConnect from '@/components/public/SocialConnect';
import NewsletterSection from '@/components/public/NewsletterSection';
import Footer from '@/components/public/Footer';
import SanatanSpecialSection from '@/components/public/SanatanSpecialSection';

// Special Content Widgets
import CricketWidget from '@/components/public/CricketWidget';
import HoroscopeWidget from '@/components/public/HoroscopeWidget';
import StockMarketWidget from '@/components/public/StockMarketWidget';
import GoldSilverWidget from '@/components/public/GoldSilverWidget';

import { db } from '@/lib/db';

export const revalidate = 60; // ISR cache revalidation every 60 seconds

export default async function HomePage() {
  // Fetch top 5 latest articles for News Slider
  const sliderArticles = await db.article.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      category: true,
      author: true,
      location: true,
      tags: { include: { tag: true } },
    },
    orderBy: [
      { newsId: 'desc' },
      { updatedAt: 'desc' },
      { publishedAt: 'desc' },
    ],
    take: 5,
  });

  const formattedSlider = sliderArticles.map((art) => ({
    ...art,
    tags: art.tags.map((t) => t.tag),
  }));

  // Fetch trending articles
  const trendingArticles = await db.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [
      { forceTrending: 'desc' },
      { viewCount: 'desc' },
      { publishedAt: 'desc' },
    ],
    take: 5,
    select: { id: true, title: true, slug: true, viewCount: true },
  });

  // Fetch latest news cards
  const latestArticles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: [
      { newsId: 'desc' },
      { updatedAt: 'desc' },
      { publishedAt: 'desc' },
    ],
    skip: 1,
    take: 4,
  });

  // Fetch active Video News Bulletins for Homepage Video Section & Playlist
  let dbVideoArticles = await db.article.findMany({
    where: { status: 'PUBLISHED', videoEnabled: true },
    orderBy: [
      { newsId: 'desc' },
      { updatedAt: 'desc' },
      { publishedAt: 'desc' },
    ],
    take: 8,
    select: {
      id: true,
      title: true,
      slug: true,
      featuredImage: true,
      videoThumbnail: true,
      videoDuration: true,
      viewCount: true,
      publishedAt: true,
      category: { select: { name: true } },
    },
  });

  if (dbVideoArticles.length === 0) {
    dbVideoArticles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [
        { newsId: 'desc' },
        { updatedAt: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        videoThumbnail: true,
        videoDuration: true,
        viewCount: true,
        publishedAt: true,
        category: { select: { name: true } },
      },
    });
  }

  const formattedVideos = dbVideoArticles.map((v) => ({
    id: v.id,
    title: v.title,
    slug: v.slug,
    thumbnail: v.videoThumbnail || v.featuredImage || 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=600&q=80',
    duration: v.videoDuration || '03:45',
    views: `${v.viewCount || 100}`,
    category: v.category?.name || 'विशेष वीडियो',
    date: new Date(v.publishedAt).toLocaleDateString('hi-IN'),
  }));

  // Fetch real articles for Multi-Tag News Section
  const dbMultiTagArticles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      tags: { some: {} },
    },
    include: {
      tags: { include: { tag: true } },
      category: true,
    },
    orderBy: [
      { newsId: 'desc' },
      { updatedAt: 'desc' },
      { publishedAt: 'desc' },
    ],
    take: 6,
  });

  const formattedMultiTagArticles = dbMultiTagArticles.map((art) => ({
    id: art.id,
    title: art.title,
    slug: art.slug,
    featuredImage: art.featuredImage,
    publishedAt: art.publishedAt,
    viewCount: art.viewCount,
    tags: art.tags.map((t) => t.tag),
  }));

  // Fetch active breaking news ticker items
  const breakingItems = await db.breakingNews.findMany({
    where: { isArchived: false, active: true },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    include: {
      article: {
        select: { id: true, title: true, slug: true },
      },
    },
    take: 10,
  });

  // Fetch dynamic district locations & published articles with locations
  const dbLocations = await db.location.findMany({
    orderBy: { name: 'asc' },
  });
  const sortedLocations = [...dbLocations].sort((a, b) => {
    if (a.name === 'जौनपुर') return -1;
    if (b.name === 'जौनपुर') return 1;
    return a.name.localeCompare(b.name, 'hi');
  });

  const dbDistrictArticles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      locationId: { not: null },
    },
    include: {
      location: true,
      category: true,
    },
    orderBy: [
      { newsId: 'desc' },
      { updatedAt: 'desc' },
      { publishedAt: 'desc' },
    ],
    take: 50,
  });

  const formattedDistrictArticles = dbDistrictArticles.map((art) => ({
    id: art.id,
    title: art.title,
    slug: art.slug,
    featuredImage: art.featuredImage,
    publishedAt: art.publishedAt,
    viewCount: art.viewCount,
    locationId: art.locationId,
    location: art.location ? { id: art.location.id, name: art.location.name, slug: art.location.slug } : null,
    category: art.category ? { name: art.category.name, slug: art.category.slug } : null,
    district: art.location?.name || '',
  }));

  // Fetch site widget and section settings (controlled from Admin Panel)
  const settingsRecords = await db.siteSetting.findMany({
    where: {
      key: {
        in: [
          'widget_cricket_enabled',
          'widget_horoscope_enabled',
          'widget_stock_enabled',
          'widget_gold_silver_enabled',
          'section_hero_enabled',
          'section_trending_enabled',
          'section_latest_enabled',
          'section_district_enabled',
          'section_multitag_enabled',
          'section_video_enabled',
          'section_tags_enabled',
        ],
      },
    },
  });
  const settingsMap = Object.fromEntries(settingsRecords.map((s) => [s.key, s.value]));

  const isCricketEnabled = settingsMap.widget_cricket_enabled !== 'false';
  const isHoroscopeEnabled = settingsMap.widget_horoscope_enabled !== 'false';
  const isStockEnabled = settingsMap.widget_stock_enabled !== 'false';
  const isGoldSilverEnabled = settingsMap.widget_gold_silver_enabled !== 'false';

  const isHeroEnabled = settingsMap.section_hero_enabled !== 'false';
  const isTrendingEnabled = settingsMap.section_trending_enabled !== 'false';
  const isLatestEnabled = settingsMap.section_latest_enabled !== 'false';
  const isDistrictEnabled = settingsMap.section_district_enabled !== 'false';
  const isMultiTagEnabled = settingsMap.section_multitag_enabled !== 'false';
  const isVideoEnabled = settingsMap.section_video_enabled !== 'false';
  const isTagsEnabled = settingsMap.section_tags_enabled !== 'false';

  // Fetch active menu categories for navigation
  const menuCategories = await db.category.findMany({
    where: { isHeaderMenu: true },
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true, order: true, isHeaderMenu: true },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <TopBar />
      <Header />
      <Navigation categories={menuCategories} />
      <BreakingTicker items={breakingItems} />

      {/* Main Content Area */}
      <main className="wrap py-4 flex-1 space-y-6">
        {/* Centered Top Leaderboard Banner (No Slipping) */}
        <div className="flex justify-center w-full">
          <AdBanner position="header_wide" sizeText="970 × 90 / Top Responsive Leaderboard Banner" />
        </div>

        {/* Featured Launch & Sanatan Heritage Special Showcase */}
        <SanatanSpecialSection />
        {/* Master 2/3 Main Content + 1/3 Right Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Main News Stories & Media) */}
          <div className="lg:col-span-2 space-y-8">
            {/* News Slider */}
            {isHeroEnabled && <HeroSection articles={formattedSlider} />}

            {/* Latest News Grid */}
            {isLatestEnabled && <LatestNewsCards articles={latestArticles} />}

            {/* District News Section */}
            {isDistrictEnabled && (
              <DistrictNewsSection
                initialLocations={sortedLocations}
                initialArticles={formattedDistrictArticles}
              />
            )}

            {/* Multi-Tag News Section */}
            {isMultiTagEnabled && <MultiTagNewsSection articles={formattedMultiTagArticles} />}

            {/* Video News Bulletins */}
            {isVideoEnabled && <VideoNewsSection videos={formattedVideos} />}
          </div>

          {/* Right Column (Organized Special Feeds & Sidebar Ads) */}
          <aside className="space-y-6">
            {/* Trending Section */}
            {isTrendingEnabled && <TrendingSection articles={trendingArticles} />}

            {/* Special Feeds Widget 1: Cricket Live Updates */}
            {isCricketEnabled && <CricketWidget />}

            {/* Sidebar Ad #1 */}
            <AdBanner position="sidebar_box" sizeText="300 × 250 / Sidebar Ad #1" />

            {/* Special Feeds Widget 2: 12 Rashifal Horoscope */}
            {isHoroscopeEnabled && <HoroscopeWidget />}

            {/* Special Feeds Widget 3: Stock Market Sensex/Nifty */}
            {isStockEnabled && <StockMarketWidget />}

            {/* Special Feeds Widget 4: Gold & Silver Commodity Rates */}
            {isGoldSilverEnabled && <GoldSilverWidget />}

            {/* Sidebar Ad #2 */}
            <AdBanner position="sidebar_tall" sizeText="300 × 300 / Sidebar Ad #2" />

            {/* Popular Tags */}
            {isTagsEnabled && <PopularTagsSection />}

            {/* Sidebar Ad #3 */}
            <AdBanner position="sidebar_box2" sizeText="300 × 250 / Sidebar Ad #3" />
          </aside>
        </div>

        {/* Social Connect Bar */}
        <SocialConnect />

        {/* Newsletter Subscription */}
        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}
