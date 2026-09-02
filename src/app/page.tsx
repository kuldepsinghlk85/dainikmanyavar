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
    orderBy: { publishedAt: 'desc' },
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
    orderBy: { publishedAt: 'desc' },
    skip: 1,
    take: 4,
  });

  // Fetch active Video News Bulletins for Homepage Video Section & Playlist
  const dbVideoArticles = await db.article.findMany({
    where: { status: 'PUBLISHED', videoEnabled: true },
    orderBy: { publishedAt: 'desc' },
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

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <TopBar />
      <Header />
      <Navigation />
      <BreakingTicker />

      {/* Main Content Area */}
      <main className="wrap py-4 flex-1 space-y-6">
        {/* Centered Top Leaderboard Banner (No Slipping) */}
        <div className="flex justify-center w-full">
          <AdBanner position="header_wide" sizeText="970 × 90 / Top Responsive Leaderboard Banner" />
        </div>

        {/* Master 2/3 Main Content + 1/3 Right Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Main News Stories & Media) */}
          <div className="lg:col-span-2 space-y-8">
            {/* News Slider */}
            <HeroSection articles={formattedSlider} />

            {/* Latest News Grid */}
            <LatestNewsCards articles={latestArticles} />

            {/* District News Section */}
            <DistrictNewsSection />

            {/* Multi-Tag News Section */}
            <MultiTagNewsSection />

            {/* Video News Bulletins */}
            <VideoNewsSection videoNewsList={formattedVideos} />
          </div>

          {/* Right Column (Organized Special Feeds & Sidebar Ads) */}
          <aside className="space-y-6">
            {/* Trending Section */}
            <TrendingSection articles={trendingArticles} />

            {/* Special Feeds Widget 1: Cricket Live Updates */}
            <CricketWidget />

            {/* Sidebar Ad #1 */}
            <AdBanner position="sidebar_box" sizeText="300 × 250 / Sidebar Ad #1" />

            {/* Special Feeds Widget 2: 12 Rashifal Horoscope */}
            <HoroscopeWidget />

            {/* Special Feeds Widget 3: Stock Market Sensex/Nifty */}
            <StockMarketWidget />

            {/* Special Feeds Widget 4: Gold & Silver Commodity Rates */}
            <GoldSilverWidget />

            {/* Sidebar Ad #2 */}
            <AdBanner position="sidebar_tall" sizeText="300 × 300 / Sidebar Ad #2" />

            {/* Popular Tags */}
            <PopularTagsSection />

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
