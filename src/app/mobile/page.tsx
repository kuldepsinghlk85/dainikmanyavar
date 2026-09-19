import React from 'react';
import { db } from '@/lib/db';
import MobileCategoryChips from '@/components/mobile/MobileCategoryChips';
import MobileTrendingBar from '@/components/mobile/MobileTrendingBar';
import MobileInteractiveBanner from '@/components/mobile/MobileInteractiveBanner';
import MobileKeyEvents from '@/components/mobile/MobileKeyEvents';
import MobileTwoColGrid from '@/components/mobile/MobileTwoColGrid';
import MobileHeroCard from '@/components/mobile/MobileHeroCard';
import MobileNewsList from '@/components/mobile/MobileNewsList';
import MobileReelsFeed from '@/components/mobile/MobileReelsFeed';
import MobileManoranjanSection from '@/components/mobile/MobileManoranjanSection';
import MobileFooter from '@/components/mobile/MobileFooter';
import { Building2, Globe, MapPin, Sparkles, Newspaper } from 'lucide-react';

// Dainik Manyavar Mobile Edition - Amar Ujala Style Layout (ISR 60s)
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
      ...(topLeadArticleId ? { id: topLeadArticleId } : { category: { slug: { not: 'manoranjan' } } }),
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

  // 2. Fetch latest news stream (excluding Manoranjan)
  const latestArticles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      category: {
        slug: { not: 'manoranjan' },
      },
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

  // 3. Fetch videos for Reels / Shorts carousel (only authentic video articles)
  const dbVideos = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      videoEnabled: true,
      videoUrl: { not: null },
    },
    orderBy: [{ newsId: 'desc' }, { publishedAt: 'desc' }],
    take: 8,
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

  const formattedReels = dbVideos.map((v) => ({
    id: v.id,
    title: v.title,
    slug: v.slug,
    thumbnail: v.videoThumbnail || v.featuredImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    duration: v.videoDuration || '1:00',
    category: v.category?.name || 'वीडियो',
  }));

  // 4. Fetch Regional / District News (Jaunpur, Varanasi etc)
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
    take: 4,
    include: {
      category: { select: { name: true } },
    },
  });

  const worldArticles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      category: { slug: { in: ['videsh', 'world', 'desh', 'international'] } },
    },
    orderBy: [{ newsId: 'desc' }, { publishedAt: 'desc' }],
    take: 4,
    include: {
      category: { select: { name: true } },
    },
  });

  // 5. Fetch categories for chips
  const categories = await db.category.findMany({
    where: { isHeaderMenu: true },
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  // 6. Section toggle settings
  const shabdkhojSetting = await db.siteSetting.findUnique({
    where: { key: 'section_shabdkhoj_enabled' },
    select: { value: true },
  });
  const showShabdkhoj = shabdkhojSetting?.value === 'true';

  // 7. Manoranjan Entertainment section settings & articles
  const manoranjanSettings = await db.siteSetting.findMany({
    where: {
      key: {
        in: [
          'mobile_manoranjan_enabled',
          'manoranjan_widget_reviews_enabled',
          'manoranjan_widget_viral_enabled',
          'manoranjan_widget_cricket_enabled',
          'manoranjan_widget_films_enabled',
        ],
      },
    },
  });
  const manoranjanMap = Object.fromEntries(manoranjanSettings.map((s) => [s.key, s.value]));
  const isMobileManoranjanEnabled = manoranjanMap.mobile_manoranjan_enabled !== 'false';

  let mobileManoranjanArticles: any[] = [];
  if (isMobileManoranjanEnabled) {
    const manoranjanCat = await db.category.findUnique({
      where: { slug: 'manoranjan' },
      select: { id: true },
    });
    if (manoranjanCat) {
      mobileManoranjanArticles = await db.article.findMany({
        where: {
          primaryCategoryId: manoranjanCat.id,
          status: 'PUBLISHED',
        },
        orderBy: [
          { isFeatured: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 8,
        select: {
          id: true,
          title: true,
          subtitle: true,
          slug: true,
          featuredImage: true,
          gallery: true,
          sourceType: true,
          publishedAt: true,
        },
      });
    }
  }

  return (
    <div className="bg-stone-100 dark:bg-[#0D0D0D] min-h-screen transition-colors">
      {/* 1. Category Chips Bar (Amar Ujala style with filter button) */}
      <MobileCategoryChips categories={categories} activeSlug="home" />

      {/* 2. Trending Topics Strip (Dainik Bhaskar style) */}
      <MobileTrendingBar />

      {/* 3. Interactive Engagement Banner: 'शब्दखोज' (disabled by default) */}
      {showShabdkhoj && <MobileInteractiveBanner />}

      {/* 4. 'आज के अहम घटनाक्रम' (Amar Ujala style) */}
      <MobileKeyEvents article={leadArticle} />

      {/* 5. 2-Column Split: 'बड़ी खबरें' & 'देश-दुनिया' (Amar Ujala style) */}
      <MobileTwoColGrid
        topStories={latestArticles.slice(0, 2)}
        worldStories={worldArticles.length >= 2 ? worldArticles.slice(0, 2) : latestArticles.slice(2, 4)}
      />

      {/* 6. Main Lead Story Card with Bookmark & Share */}
      {leadArticle && <MobileHeroCard article={leadArticle} />}

      {/* Section Divider */}
      <div className="h-2 bg-stone-100 dark:bg-[#0D0D0D] border-y border-stone-200/80 dark:border-stone-800/80" />

      {/* 7. Vertical 9:16 Reels Carousel (only when authentic video reels exist) */}
      {formattedReels.length > 0 && (
        <>
          <MobileReelsFeed
            reels={formattedReels}
            title="वीडियो REEL"
            viewAllLink="/mobile/category/video"
          />
          <div className="h-2 bg-stone-100 dark:bg-[#0D0D0D] border-y border-stone-200/80 dark:border-stone-800/80" />
        </>
      )}

      {/* Manoranjan Entertainment Section (when enabled & articles exist) */}
      {isMobileManoranjanEnabled && mobileManoranjanArticles.length > 0 && (
        <>
          <MobileManoranjanSection
            articles={mobileManoranjanArticles}
            settings={{
              showReviews: manoranjanMap.manoranjan_widget_reviews_enabled !== 'false',
              showViral: manoranjanMap.manoranjan_widget_viral_enabled !== 'false',
              showCricket: manoranjanMap.manoranjan_widget_cricket_enabled !== 'false',
              showFilms: manoranjanMap.manoranjan_widget_films_enabled !== 'false',
            }}
          />
          <div className="h-2 bg-stone-100 dark:bg-[#0D0D0D] border-y border-stone-200/80 dark:border-stone-800/80" />
        </>
      )}

      {/* 8. 'ताज़ा सुर्खियां' Feed */}
      <MobileNewsList
        articles={latestArticles.slice(4, 8)}
        sectionTitle="ताज़ा सुर्खियां"
        viewAllLink="/mobile/category/latest"
        buttonText="सभी खबरें"
        icon={<Sparkles className="w-3.5 h-3.5 text-[#E53935]" />}
      />

      {/* Section Divider */}
      <div className="h-2 bg-stone-100 dark:bg-[#0D0D0D] border-y border-stone-200/80 dark:border-stone-800/80" />

      {/* 9. Uttar Pradesh State Feed */}
      {stateArticles.length > 0 && (
        <>
          <MobileNewsList
            articles={stateArticles}
            sectionTitle="उत्तर प्रदेश"
            viewAllLink="/mobile/category/uttar-pradesh"
            buttonText="सभी खबरें"
            icon={<Building2 className="w-3.5 h-3.5 text-[#E53935]" />}
          />
          <div className="h-2 bg-stone-100 dark:bg-[#0D0D0D] border-y border-stone-200/80 dark:border-stone-800/80" />
        </>
      )}

      {/* 10. Foreign / World Feed */}
      {worldArticles.length > 0 ? (
        <>
          <MobileNewsList
            articles={worldArticles}
            sectionTitle="विदेश"
            viewAllLink="/mobile/category/videsh"
            buttonText="सभी खबरें"
            icon={<Globe className="w-3.5 h-3.5 text-[#E53935]" />}
          />
          <div className="h-2 bg-stone-100 dark:bg-[#0D0D0D] border-y border-stone-200/80 dark:border-stone-800/80" />
        </>
      ) : null}

      {/* 11. Jaunpur Local Feed */}
      {jaunpurArticles.length > 0 && (
        <>
          <MobileNewsList
            articles={jaunpurArticles}
            sectionTitle="जौनपुर हलचल"
            viewAllLink="/mobile/category/जौनपुर"
            buttonText="सभी खबरें"
            icon={<MapPin className="w-3.5 h-3.5 text-[#E53935]" />}
          />
          <div className="h-2 bg-stone-100 dark:bg-[#0D0D0D] border-y border-stone-200/80 dark:border-stone-800/80" />
        </>
      )}

      {/* 12. More News */}
      {latestArticles.length > 8 && (
        <MobileNewsList
          articles={latestArticles.slice(8)}
          sectionTitle="अन्य प्रमुख समाचार"
          buttonText="सभी खबरें"
          icon={<Newspaper className="w-3.5 h-3.5 text-[#E53935]" />}
        />
      )}

      {/* Footer */}
      <MobileFooter />
    </div>
  );
}
