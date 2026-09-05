import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 1. Try finding in NotificationLog
    const notif = await db.notificationLog.findFirst({
      where: {
        shortUrl: {
          contains: `/n/${code}`,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let targetNewsId = notif?.newsId;

    if (notif) {
      // Mark as OPENED
      await db.notificationLog.update({
        where: { id: notif.id },
        data: {
          openedStatus: 'OPENED',
          openedTime: new Date(),
        },
      });

      // Log reading view activity
      await db.userActivityLog.create({
        data: {
          userId: notif.userId,
          newsId: notif.newsId,
          activityType: 'VIEW',
          device: request.headers.get('user-agent')?.toLowerCase().includes('mobile') ? 'mobile' : 'web',
        },
      });
    }

    // 2. Also check ShortLink table if exists
    if (!targetNewsId) {
      const shortLink = await db.shortLink.findUnique({
        where: { shortCode: code },
        select: { articleId: true },
      });
      if (shortLink) {
        targetNewsId = shortLink.articleId;
        await db.shortLink.update({
          where: { shortCode: code },
          data: { clickCount: { increment: 1 } },
        });
      }
    }

    if (!targetNewsId) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const article = await db.article.findUnique({
      where: { id: targetNewsId },
      select: { slug: true },
    });

    if (!article || !article.slug) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const isMobile = request.headers.get('user-agent')?.toLowerCase().includes('mobile');
    const targetPath = isMobile ? `/mobile/news/${article.slug}` : `/news/${article.slug}`;

    return NextResponse.redirect(new URL(targetPath, request.url));
  } catch (error) {
    console.error('Short url redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
