import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const activityType = searchParams.get('activityType')?.trim() || '';
    const device = searchParams.get('device')?.trim() || '';
    const userId = searchParams.get('userId')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '30')));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (activityType) where.activityType = activityType;
    if (device) where.device = device;
    if (userId) where.userId = userId;

    const [total, logs] = await Promise.all([
      db.userActivityLog.count({ where }),
      db.userActivityLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          newsId: true,
          activityType: true,
          readTime: true,
          device: true,
          timestamp: true,
          user: {
            select: {
              fullName: true,
              mobileNumber: true,
              city: true,
            },
          },
        },
      }),
    ]);

    // Fetch article titles for logs with newsId
    const newsIds = Array.from(new Set(logs.map((l) => l.newsId).filter((id): id is string => Boolean(id))));
    const articles = await db.article.findMany({
      where: { id: { in: newsIds } },
      select: { id: true, title: true, slug: true },
    });
    const articleMap = new Map(articles.map((a) => [a.id, a]));

    const enrichedLogs = logs.map((log) => ({
      ...log,
      article: log.newsId ? articleMap.get(log.newsId) || null : null,
    }));

    return NextResponse.json({
      success: true,
      data: enrichedLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Activity logs GET error:', error);
    return NextResponse.json({ success: false, error: 'एक्टिविटी लॉग लोड करने में विफल।' }, { status: 500 });
  }
}
