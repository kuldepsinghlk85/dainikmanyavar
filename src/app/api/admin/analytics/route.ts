import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत अनुरोध (Unauthorized)' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status') || 'published'; // 'published' | 'all'
    const period = searchParams.get('period') || 'all'; // 'all' | 'week' | 'today'

    // Build article where clause
    const articleWhere: any = {};
    if (statusFilter === 'published') {
      articleWhere.status = 'PUBLISHED';
    } else if (statusFilter === 'archived') {
      articleWhere.status = 'ARCHIVED';
    }

    if (period === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      articleWhere.publishedAt = { gte: todayStart };
    } else if (period === 'week') {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      articleWhere.publishedAt = { gte: weekStart };
    }

    // Run parallel database queries
    const [
      aggregateStats,
      publishedCount,
      archivedCount,
      allArticlesList,
      categoriesData,
      deviceLogs,
      recentActivityLogs,
    ] = await Promise.all([
      db.article.aggregate({
        where: articleWhere,
        _sum: {
          viewCount: true,
          likeCount: true,
          shareCount: true,
          listenCount: true,
        },
        _count: true,
      }),
      db.article.count({ where: { status: 'PUBLISHED' } }),
      db.article.count({ where: { status: 'ARCHIVED' } }),
      db.article.findMany({
        where: articleWhere,
        orderBy: { viewCount: 'desc' },
        take: 30, // take extra for deduplication
        select: {
          id: true,
          newsId: true,
          title: true,
          slug: true,
          status: true,
          viewCount: true,
          likeCount: true,
          shareCount: true,
          listenCount: true,
          publishedAt: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      db.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          articles: {
            where: statusFilter === 'published' ? { status: 'PUBLISHED' } : {},
            select: { viewCount: true },
          },
        },
      }),
      db.userActivityLog.groupBy({
        by: ['device'],
        _count: true,
      }),
      db.userActivityLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 8,
        include: {
          user: {
            select: { fullName: true },
          },
        },
      }),
    ]);

    // Deduplicate articles by title so identical copies don't clutter top list
    const seenTitles = new Set<string>();
    const topArticles: typeof allArticlesList = [];
    for (const art of allArticlesList) {
      const normalizedTitle = art.title.trim().toLowerCase();
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        topArticles.push(art);
      }
      if (topArticles.length >= 10) break;
    }

    // Category breakdown
    const categoryStats = categoriesData
      .map((cat) => {
        const count = cat.articles.length;
        const views = cat.articles.reduce((acc, a) => acc + (a.viewCount || 0), 0);
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          count,
          views,
        };
      })
      .filter((c) => c.count > 0)
      .sort((a, b) => b.views - a.views);

    // Calculate total views across categories for percentages
    const totalCategoryViews = categoryStats.reduce((acc, c) => acc + c.views, 0) || 1;
    const categoryStatsWithPercent = categoryStats.map((c) => ({
      ...c,
      percent: Math.min(100, Math.round((c.views / totalCategoryViews) * 100)),
    }));

    // Device breakdown
    let mobileCount = 0;
    let desktopCount = 0;
    for (const log of deviceLogs) {
      if (log.device === 'mobile') mobileCount += log._count;
      else desktopCount += log._count;
    }
    const totalDeviceCount = mobileCount + desktopCount || 1;
    const mobilePercent = Math.round((mobileCount / totalDeviceCount) * 100);
    const desktopPercent = 100 - mobilePercent;

    return NextResponse.json({
      success: true,
      data: {
        filter: {
          status: statusFilter,
          period,
        },
        summary: {
          totalViews: aggregateStats._sum.viewCount || 0,
          totalLikes: aggregateStats._sum.likeCount || 0,
          totalShares: aggregateStats._sum.shareCount || 0,
          totalListens: aggregateStats._sum.listenCount || 0,
          totalArticles: aggregateStats._count || 0,
          publishedCount,
          archivedCount,
        },
        topArticles,
        categoryStats: categoryStatsWithPercent,
        deviceBreakdown: {
          mobile: { count: mobileCount, percent: mobilePercent },
          desktop: { count: desktopCount, percent: desktopPercent },
        },
        recentActivity: recentActivityLogs,
      },
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ success: false, error: 'डेटा लोड करने में असमर्थ' }, { status: 500 });
  }
}
