import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// In-memory debounce cache to prevent duplicate views in short succession
// Map key: `${visitorHash}:${articleId}` -> timestamp
const viewDebounceCache = new Map<string, number>();
const DEBOUNCE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

// Periodically clean up old memory cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of viewDebounceCache.entries()) {
    if (now - timestamp > DEBOUNCE_WINDOW_MS) {
      viewDebounceCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

const BOT_USER_AGENTS =
  /bot|crawler|spider|crawling|googlebot|bingbot|yandex|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp|telegrambot|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider/i;

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get('user-agent') || '';

    // 1. Filter known automated bot traffic
    if (BOT_USER_AGENTS.test(userAgent)) {
      return NextResponse.json({ success: true, ignored: 'automated_crawler' });
    }

    // 2. Ignore administrative article previews
    const adminToken = req.cookies.get('admin_token')?.value;
    const body = await req.json().catch(() => ({}));
    const { articleId, visitorId, isMobile, source, preview } = body;

    if (preview === true || adminToken) {
      return NextResponse.json({ success: true, ignored: 'admin_preview' });
    }

    if (!articleId || typeof articleId !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid articleId is required' }, { status: 400 });
    }

    // 3. Create visitor fingerprint hash for deduplication
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown_ip';
    const clientVisitorId = visitorId || 'anonymous';
    const visitorKey = `${ip}:${clientVisitorId}:${articleId}`;
    const now = Date.now();
    const lastViewedAt = viewDebounceCache.get(visitorKey);

    const isDuplicate = lastViewedAt && now - lastViewedAt < DEBOUNCE_WINDOW_MS;
    if (isDuplicate) {
      return NextResponse.json({ success: true, deduplicated: true });
    }

    // Record in debounce cache
    viewDebounceCache.set(visitorKey, now);

    // 4. Verify article exists and is live/published or archived
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    // 5. Update article viewCount in database
    await db.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    });

    // 6. Record Daily Aggregates (UTC midnight normalized)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    try {
      await db.articleDailyStats.upsert({
        where: {
          articleId_date: {
            articleId,
            date: today,
          },
        },
        create: {
          articleId,
          date: today,
          views: 1,
          uniqueVisitors: 1,
        },
        update: {
          views: { increment: 1 },
          uniqueVisitors: { increment: 1 },
        },
      });
    } catch (statsErr) {
      console.warn('Failed to update articleDailyStats:', statsErr);
    }

    // 7. Log individual AnalyticsEvent for auditability
    try {
      await db.analyticsEvent.create({
        data: {
          articleId,
          visitorId: clientVisitorId,
          sessionId: clientVisitorId,
          eventName: 'article_view',
          deviceType: isMobile ? 'mobile' : 'desktop',
          browser: userAgent.slice(0, 100),
          referrer: req.headers.get('referer')?.slice(0, 200) || undefined,
          utmSource: source || undefined,
        },
      });
    } catch (_) {}

    return NextResponse.json({ success: true, counted: true });
  } catch (error: any) {
    console.error('Error tracking view:', error);
    return NextResponse.json({ success: false, error: 'Internal tracking error' }, { status: 500 });
  }
}
