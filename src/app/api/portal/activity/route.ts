import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPortalUserSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getPortalUserSession();
    const body = await req.json();
    const { action } = body;

    // 1. LOG USER ACTIVITY (VIEW, SHARE, LIKE, AUDIO_PLAY, DOWNLOAD, READ_TIME)
    if (action === 'log') {
      const { newsId, activityType, readTime, device = 'web' } = body;
      if (!activityType) {
        return NextResponse.json({ success: false, error: 'Activity type required' }, { status: 400 });
      }

      await db.userActivityLog.create({
        data: {
          userId: user ? user.id : null,
          newsId: newsId || null,
          activityType: String(activityType).toUpperCase(),
          readTime: readTime ? parseInt(readTime) : null,
          device: String(device),
        },
      });

      return NextResponse.json({ success: true });
    }

    // 2. SAVE / BOOKMARK ARTICLE
    if (action === 'toggle-save') {
      if (!user) {
        return NextResponse.json({ success: false, error: 'कृपया पहले लॉगिन करें।' }, { status: 401 });
      }

      const { articleId } = body;
      if (!articleId) {
        return NextResponse.json({ success: false, error: 'Article ID required' }, { status: 400 });
      }

      const existing = await db.userSavedArticle.findUnique({
        where: {
          userId_articleId: {
            userId: user.id,
            articleId,
          },
        },
      });

      if (existing) {
        await db.userSavedArticle.delete({
          where: { id: existing.id },
        });
        return NextResponse.json({ success: true, saved: false, message: 'समाचार सेव लिस्ट से हटाया गया।' });
      } else {
        await db.userSavedArticle.create({
          data: {
            userId: user.id,
            articleId,
          },
        });
        // Also log SAVED activity
        await db.userActivityLog.create({
          data: {
            userId: user.id,
            newsId: articleId,
            activityType: 'SAVED',
            device: 'web',
          },
        });
        return NextResponse.json({ success: true, saved: true, message: 'समाचार सफलतापूर्वक सेव किया गया!' });
      }
    }

    // 3. GET SAVED ARTICLES
    if (action === 'get-saved') {
      if (!user) {
        return NextResponse.json({ success: false, error: 'कृपया लॉगिन करें।' }, { status: 401 });
      }

      const savedList = await db.userSavedArticle.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const articleIds = savedList.map((s) => s.articleId);
      const articles = await db.article.findMany({
        where: { id: { in: articleIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          featuredImage: true,
          publishedAt: true,
          excerpt: true,
        },
      });

      const articleMap = new Map(articles.map((a) => [a.id, a]));
      const formatted = savedList
        .map((s) => {
          const art = articleMap.get(s.articleId);
          if (!art) return null;
          return {
            savedId: s.id,
            savedAt: s.createdAt,
            ...art,
          };
        })
        .filter(Boolean);

      return NextResponse.json({ success: true, data: formatted });
    }

    // 4. GET READING HISTORY
    if (action === 'get-history') {
      if (!user) {
        return NextResponse.json({ success: false, error: 'कृपया लॉगिन करें।' }, { status: 401 });
      }

      const historyLogs = await db.userActivityLog.findMany({
        where: {
          userId: user.id,
          activityType: 'VIEW',
          newsId: { not: null },
        },
        orderBy: { timestamp: 'desc' },
        take: 40,
      });

      const newsIds = Array.from(new Set(historyLogs.map((l) => l.newsId!).filter(Boolean)));
      const articles = await db.article.findMany({
        where: { id: { in: newsIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          featuredImage: true,
          publishedAt: true,
        },
      });

      const articleMap = new Map(articles.map((a) => [a.id, a]));
      const formatted = historyLogs
        .map((log) => {
          const art = articleMap.get(log.newsId!);
          if (!art) return null;
          return {
            logId: log.id,
            timestamp: log.timestamp,
            ...art,
          };
        })
        .filter(Boolean);

      return NextResponse.json({ success: true, data: formatted });
    }

    // 5. CHECK IF ARTICLE IS SAVED
    if (action === 'check-saved') {
      if (!user) {
        return NextResponse.json({ success: true, saved: false });
      }
      const { articleId } = body;
      const existing = await db.userSavedArticle.findUnique({
        where: {
          userId_articleId: {
            userId: user.id,
            articleId,
          },
        },
      });
      return NextResponse.json({ success: true, saved: !!existing });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json({ success: false, error: 'सर्वर त्रुटि' }, { status: 500 });
  }
}
