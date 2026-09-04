import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const utmSource = searchParams.get('utm_source') || 'short_link';

    const shortLink = await db.shortLink.findUnique({
      where: { shortCode: code },
      include: { article: true },
    });

    if (!shortLink || !shortLink.article) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment shortlink click count
    await db.shortLink.update({
      where: { id: shortLink.id },
      data: { clickCount: { increment: 1 } },
    });

    await trackEvent({
      articleId: shortLink.articleId,
      visitorId: 'short_link_user',
      sessionId: `session_${Date.now()}`,
      eventName: 'share_shortlink_open',
      utmSource,
    });

    const destinationUrl = new URL(`/news/${shortLink.article.slug}`, request.url);
    return NextResponse.redirect(destinationUrl);
  } catch (error) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
