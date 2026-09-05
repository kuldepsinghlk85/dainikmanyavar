import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPortalUserSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function generateRandomCode(length = 6) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = 'x';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getPortalUserSession();
    const body = await req.json();
    const { newsId, platform = 'whatsapp' } = body;

    if (!newsId) {
      return NextResponse.json({ success: false, error: 'News ID required' }, { status: 400 });
    }

    const code = generateRandomCode(6);
    const tracking = await db.shareTracking.create({
      data: {
        userId: user ? user.id : null,
        newsId,
        trackingCode: code,
        platform,
      },
    });

    // Also log activity
    await db.userActivityLog.create({
      data: {
        userId: user ? user.id : null,
        newsId,
        activityType: 'SHARE',
        device: 'web',
      },
    });

    // Also increment shareCount on Article
    try {
      await db.article.update({
        where: { id: newsId },
        data: { shareCount: { increment: 1 } },
      });
    } catch (_) {}

    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3015';
    const shareUrl = `${origin}/share/${code}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      code,
    });
  } catch (error) {
    console.error('Share generation error:', error);
    return NextResponse.json({ success: false, error: 'शेयर लिंक बनाने में विफल।' }, { status: 500 });
  }
}
