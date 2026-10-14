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
    const statusFilter = searchParams.get('status') || 'published'; // 'published' | 'all' | 'archived'
    const period = searchParams.get('period') || 'all'; // 'all' | 'month' | 'week' | 'today'
    const limitParam = searchParams.get('limit') || '10'; // '10' | '50' | 'all'
    const sortParam = searchParams.get('sort') || 'views'; // 'views' | 'latest'
    const targetLimit = limitParam === 'all' ? Infinity : parseInt(limitParam, 10) || 10;
    const queryTake = limitParam === 'all' ? 500 : targetLimit === 50 ? 120 : 30;

    const orderByClause =
      sortParam === 'latest'
        ? [{ publishedAt: 'desc' as const }, { createdAt: 'desc' as const }]
        : [{ viewCount: 'desc' as const }, { publishedAt: 'desc' as const }];

    // Build article where clause
    const articleWhere: any = {};
    if (statusFilter === 'published') {
      articleWhere.status = 'PUBLISHED';
    } else if (statusFilter === 'archived') {
      articleWhere.status = 'ARCHIVED';
    }

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const sevenDaysAgoUTC = new Date(todayUTC.getTime() - 7 * 86400000);
    const twentyEightDaysAgoUTC = new Date(todayUTC.getTime() - 28 * 86400000);

    if (period === 'today') {
      articleWhere.publishedAt = { gte: todayUTC };
    } else if (period === 'week') {
      articleWhere.publishedAt = { gte: sevenDaysAgoUTC };
    } else if (period === 'month') {
      articleWhere.publishedAt = { gte: twentyEightDaysAgoUTC };
    }

    // Run parallel database queries
    const [
      lifetimeStats,
      liveStats,
      archivedStats,
      dailyStatsToday,
      dailyStats7Days,
      dailyStats28Days,
      publishedCount,
      archivedCount,
      draftCount,
      allArticlesList,
      categoriesData,
      deviceLogs,
      recentActivityLogs,
      recentDailyRecords,
    ] = await Promise.all([
      // 1. Total Lifetime Views (All statuses)
      db.article.aggregate({
        _sum: {
          viewCount: true,
          likeCount: true,
          shareCount: true,
          listenCount: true,
        },
        _count: true,
      }),
      // 2. LIVE Articles Views
      db.article.aggregate({
        where: { status: 'PUBLISHED' },
        _sum: { viewCount: true },
      }),
      // 3. ARCHIVED Articles Views
      db.article.aggregate({
        where: { status: 'ARCHIVED' },
        _sum: { viewCount: true },
      }),
      // 4. Today's Views from Daily Stats
      db.articleDailyStats.aggregate({
        where: { date: { gte: todayUTC } },
        _sum: { views: true, uniqueVisitors: true },
      }),
      // 5. Last 7 Days Views from Daily Stats
      db.articleDailyStats.aggregate({
        where: { date: { gte: sevenDaysAgoUTC } },
        _sum: { views: true, uniqueVisitors: true },
      }),
      // 6. Last 28 Days Views from Daily Stats
      db.articleDailyStats.aggregate({
        where: { date: { gte: twentyEightDaysAgoUTC } },
        _sum: { views: true, uniqueVisitors: true },
      }),
      // Counts
      db.article.count({ where: { status: 'PUBLISHED' } }),
      db.article.count({ where: { status: 'ARCHIVED' } }),
      db.article.count({ where: { status: 'DRAFT' } }),
      // Articles list
      db.article.findMany({
        where: articleWhere,
        orderBy: orderByClause,
        take: queryTake,
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
          author: { select: { name: true } },
          location: { select: { name: true } },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      // Category performance
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
      // Device logs
      db.userActivityLog.groupBy({
        by: ['device'],
        _count: true,
      }),
      // Recent activities
      db.userActivityLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 8,
        include: {
          user: {
            select: { fullName: true },
          },
        },
      }),
      // Daily trend rows (last 28 days)
      db.articleDailyStats.findMany({
        where: { date: { gte: twentyEightDaysAgoUTC } },
        orderBy: { date: 'asc' },
        select: {
          date: true,
          views: true,
          uniqueVisitors: true,
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
      if (topArticles.length >= targetLimit) break;
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

    // Aggregate daily stats by date string
    const dailyMap = new Map<string, { date: string; views: number; uniqueVisitors: number }>();
    for (const r of recentDailyRecords) {
      const dStr = r.date.toISOString().split('T')[0];
      const existing = dailyMap.get(dStr) || { date: dStr, views: 0, uniqueVisitors: 0 };
      existing.views += r.views;
      existing.uniqueVisitors += r.uniqueVisitors;
      dailyMap.set(dStr, existing);
    }
    const dailyTrends = Array.from(dailyMap.values());

    return NextResponse.json({
      success: true,
      data: {
        filter: {
          status: statusFilter,
          period,
          limit: limitParam,
          sort: sortParam,
        },
        metrics: {
          totalLifetimeViews: lifetimeStats._sum.viewCount || 0,
          liveViews: liveStats._sum.viewCount || 0,
          archivedViews: archivedStats._sum.viewCount || 0,
          todayViews: dailyStatsToday._sum.views || 0,
          weekViews: dailyStats7Days._sum.views || 0,
          monthViews: dailyStats28Days._sum.views || 0,
          todayUniqueReaders: dailyStatsToday._sum.uniqueVisitors || 0,
          weekUniqueReaders: dailyStats7Days._sum.uniqueVisitors || 0,
          monthUniqueReaders: dailyStats28Days._sum.uniqueVisitors || 0,
          totalArticles: lifetimeStats._count || 0,
          publishedCount,
          archivedCount,
          draftCount,
          totalLikes: lifetimeStats._sum.likeCount || 0,
          totalShares: lifetimeStats._sum.shareCount || 0,
          totalListens: lifetimeStats._sum.listenCount || 0,
        },
        topArticles,
        categoryStats: categoryStatsWithPercent,
        deviceBreakdown: {
          mobile: { count: mobileCount, percent: mobilePercent },
          desktop: { count: desktopCount, percent: desktopPercent },
        },
        recentActivity: recentActivityLogs,
        dailyTrends,
      },
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ success: false, error: 'डेटा लोड करने में असमर्थ' }, { status: 500 });
  }
}
