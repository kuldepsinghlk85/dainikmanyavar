import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId, visitorId = 'anonymous_visitor' } = body;

    if (!articleId) {
      return NextResponse.json({ success: false, error: 'articleId required' }, { status: 400 });
    }

    const article = await db.article.update({
      where: { id: articleId },
      data: { likeCount: { increment: 1 } },
    });

    await trackEvent({
      articleId,
      visitorId,
      sessionId: `session_${Date.now()}`,
      eventName: 'like',
    });

    return NextResponse.json({ success: true, likeCount: article.likeCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
