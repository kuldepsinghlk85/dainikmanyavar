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
    const period = searchParams.get('period') || 'all'; // 'all' | 'today' | '7days' | '30days'
    const format = searchParams.get('format') || 'json'; // 'json' | 'csv'

    const now = new Date();
    const articleWhere: any = { status: 'PUBLISHED' };

    if (period === 'today') {
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      articleWhere.publishedAt = { gte: todayStart };
    } else if (period === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
      articleWhere.publishedAt = { gte: sevenDaysAgo };
    } else if (period === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
      articleWhere.publishedAt = { gte: thirtyDaysAgo };
    }

    // Fetch articles with author, category, and location
    const articles = await db.article.findMany({
      where: articleWhere,
      select: {
        id: true,
        newsId: true,
        title: true,
        slug: true,
        viewCount: true,
        publishedAt: true,
        author: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        location: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { viewCount: 'desc' },
      take: 1000,
    });

    const totalViews = articles.reduce((acc, a) => acc + (a.viewCount || 0), 0) || 1;

    // 1. Group by Reporter / Author
    const authorMap = new Map<string, {
      name: string;
      articlesCount: number;
      totalViews: number;
      topArticle: { title: string; views: number; newsId: number } | null;
    }>();

    for (const art of articles) {
      const authorName = art.author?.name || 'दैनिक मान्यवर ब्यूरो';
      const existing = authorMap.get(authorName) || {
        name: authorName,
        articlesCount: 0,
        totalViews: 0,
        topArticle: null,
      };

      existing.articlesCount += 1;
      existing.totalViews += art.viewCount || 0;

      if (!existing.topArticle || (art.viewCount || 0) > existing.topArticle.views) {
        existing.topArticle = {
          title: art.title,
          views: art.viewCount || 0,
          newsId: art.newsId || 0,
        };
      }

      authorMap.set(authorName, existing);
    }

    const authorStats = Array.from(authorMap.values())
      .map((a) => ({
        ...a,
        averageViews: Math.round(a.totalViews / a.articlesCount),
      }))
      .sort((a, b) => b.totalViews - a.totalViews);

    // 2. Group by Category
    const categoryMap = new Map<string, { name: string; slug: string; articlesCount: number; totalViews: number }>();
    for (const art of articles) {
      const catName = art.category?.name || 'अन्य';
      const catSlug = art.category?.slug || 'news';
      const existing = categoryMap.get(catName) || {
        name: catName,
        slug: catSlug,
        articlesCount: 0,
        totalViews: 0,
      };

      existing.articlesCount += 1;
      existing.totalViews += art.viewCount || 0;
      categoryMap.set(catName, existing);
    }

    const categoryStats = Array.from(categoryMap.values())
      .map((c) => ({
        ...c,
        sharePercent: Math.min(100, Math.round((c.totalViews / totalViews) * 100)),
        averageViews: Math.round(c.totalViews / c.articlesCount),
      }))
      .sort((a, b) => b.totalViews - a.totalViews);

    // 3. Group by District / Location
    const locationMap = new Map<string, { name: string; articlesCount: number; totalViews: number }>();
    for (const art of articles) {
      const locName = art.location?.name || 'समग्र / राज्य स्तर';
      const existing = locationMap.get(locName) || {
        name: locName,
        articlesCount: 0,
        totalViews: 0,
      };

      existing.articlesCount += 1;
      existing.totalViews += art.viewCount || 0;
      locationMap.set(locName, existing);
    }

    const locationStats = Array.from(locationMap.values())
      .sort((a, b) => b.totalViews - a.totalViews);

    // 4. Story Velocity (Views per day)
    const velocityStories = articles.map((art) => {
      const pubDate = new Date(art.publishedAt);
      const daysSincePub = Math.max(1, Math.ceil((now.getTime() - pubDate.getTime()) / 86400000));
      const viewsPerDay = Math.round(art.viewCount / daysSincePub);

      return {
        id: art.id,
        newsId: art.newsId,
        title: art.title,
        categoryName: art.category?.name || 'समाचार',
        authorName: art.author?.name || 'ब्यूरो',
        publishedAt: art.publishedAt,
        viewCount: art.viewCount,
        daysSincePub,
        viewsPerDay,
        isEvergreen: viewsPerDay > 50 && daysSincePub > 7,
      };
    }).sort((a, b) => b.viewsPerDay - a.viewsPerDay);

    // Handle CSV Export
    if (format === 'csv') {
      const rows: string[] = [];
      // UTF-8 BOM so Excel displays Hindi text correctly
      rows.push('\uFEFF"रिपोर्ट प्रकार","नाम / शीर्षक","कुल समाचार","कुल व्यूज़","औसत व्यूज़","सर्वश्रेष्ठ स्टोरी / विवरण"');

      // Author rows
      for (const a of authorStats) {
        rows.push(`"रिपोर्टर","${a.name}","${a.articlesCount}","${a.totalViews}","${a.averageViews}","${(a.topArticle?.title || '').replace(/"/g, '""')}"`);
      }

      // Category rows
      for (const c of categoryStats) {
        rows.push(`"श्रेणी","${c.name}","${c.articlesCount}","${c.totalViews}","${c.averageViews}","रीडरशिप शेयर: ${c.sharePercent}%"`);
      }

      // Location rows
      for (const l of locationStats) {
        rows.push(`"जिला / क्षेत्र","${l.name}","${l.articlesCount}","${l.totalViews}","${Math.round(l.totalViews / l.articlesCount)}","-"`);
      }

      const csvContent = rows.join('\r\n');
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="editorial_performance_${period}_${now.toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        totalArticles: articles.length,
        totalViews,
        authorStats,
        categoryStats,
        locationStats,
        velocityStories: velocityStories.slice(0, 30),
      },
    });
  } catch (error) {
    console.error('Editorial Performance API error:', error);
    return NextResponse.json({ success: false, error: 'संपादकीय डेटा लोड करने में त्रुटि' }, { status: 500 });
  }
}
