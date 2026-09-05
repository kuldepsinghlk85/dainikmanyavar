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

    const share = await db.shareTracking.findUnique({
      where: { trackingCode: code },
    });

    if (!share) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment click count & log activity asynchronously
    await Promise.all([
      db.shareTracking.update({
        where: { id: share.id },
        data: { clickCount: { increment: 1 } },
      }),
      db.userActivityLog.create({
        data: {
          userId: share.userId,
          newsId: share.newsId,
          activityType: 'VIEW',
          device: request.headers.get('user-agent')?.toLowerCase().includes('mobile') ? 'mobile' : 'web',
        },
      }),
    ]);

    const article = await db.article.findUnique({
      where: { id: share.newsId },
      select: { slug: true },
    });

    if (!article || !article.slug) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const isMobile = request.headers.get('user-agent')?.toLowerCase().includes('mobile');
    const targetPath = isMobile ? `/mobile/news/${article.slug}` : `/news/${article.slug}`;

    return NextResponse.redirect(new URL(targetPath, request.url));
  } catch (error) {
    console.error('Share redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
