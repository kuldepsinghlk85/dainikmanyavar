import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 30);
    const timeframe = searchParams.get('timeframe') || '48h'; // 24h, 48h, 7d

    let hoursBack = 48;
    if (timeframe === '24h') hoursBack = 24;
    else if (timeframe === '7d') hoursBack = 168;

    const cutoffDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const articles = await db.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { gte: cutoffDate },
      },
      select: {
        id: true,
        newsId: true,
        title: true,
        subtitle: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        viewCount: true,
        likeCount: true,
        shareCount: true,
        isBreaking: true,
        forceTrending: true,
        isPromoted: true,
        contentType: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        location: {
          select: { id: true, name: true, slug: true },
        },
      },
      take: 60,
    });

    const now = Date.now();

    // Standard viral / trending decay formula
    const ranked = articles.map((article) => {
      const hoursOld = Math.max(0.2, (now - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60));
      const engagement = (article.viewCount * 1.0) + (article.shareCount * 4.0) + (article.likeCount * 2.5);
      
      let trendingScore = engagement / Math.pow(hoursOld + 2, 1.4);

      if (article.forceTrending) trendingScore += 1000;
      if (article.isBreaking) trendingScore += 300;
      if (article.isPromoted) trendingScore += 200;

      return {
        ...article,
        trendingScore: Math.round(trendingScore * 10) / 10,
      };
    });

    ranked.sort((a, b) => b.trendingScore - a.trendingScore);

    const result = ranked.slice(0, limit).map((art, idx) => ({
      ...art,
      trendingRank: idx + 1,
    }));

    return NextResponse.json(
      {
        success: true,
        data: result,
        timeframe,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    console.error('Trending API error:', error);
    return NextResponse.json({ success: false, error: 'ट्रेंडिंग खबरें लोड करने में विफल' }, { status: 500 });
  }
}
