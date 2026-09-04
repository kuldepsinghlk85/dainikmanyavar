import { db } from './db';

export interface AnalyticsPayload {
  articleId?: string;
  visitorId: string;
  sessionId: string;
  eventName: string;
  eventValue?: string;
  deviceType?: string;
  browser?: string;
  referrer?: string;
  utmSource?: string;
}

export async function trackEvent(payload: AnalyticsPayload) {
  try {
    const event = await db.analyticsEvent.create({
      data: {
        articleId: payload.articleId,
        visitorId: payload.visitorId,
        sessionId: payload.sessionId,
        eventName: payload.eventName,
        eventValue: payload.eventValue,
        deviceType: payload.deviceType || 'mobile',
        browser: payload.browser,
        referrer: payload.referrer,
        utmSource: payload.utmSource,
      },
    });

    // Increment cached counter on article if event is view, like, listen or share
    if (payload.articleId) {
      if (payload.eventName === 'article_view' || payload.eventName === 'page_view') {
        await db.article.update({
          where: { id: payload.articleId },
          data: { viewCount: { increment: 1 } },
        });
      } else if (payload.eventName === 'like') {
        await db.article.update({
          where: { id: payload.articleId },
          data: { likeCount: { increment: 1 } },
        });
      } else if (payload.eventName === 'audio_start') {
        await db.article.update({
          where: { id: payload.articleId },
          data: { listenCount: { increment: 1 } },
        });
      } else if (payload.eventName.startsWith('share_')) {
        await db.article.update({
          where: { id: payload.articleId },
          data: { shareCount: { increment: 1 } },
        });
      }
    }

    return event;
  } catch (err) {
    console.error('Error tracking analytics event:', err);
    return null;
  }
}

// Calculate Trending Score with Time Decay formula:
// Score = (Views * 1 + Likes * 3 + Shares * 5 + Listens * 4) / ((HoursOld + 2) ^ 1.5)
export function calculateTrendingScore(
  viewCount: number,
  likeCount: number,
  shareCount: number,
  listenCount: number,
  publishedAt: Date
): number {
  const now = new Date();
  const hoursOld = Math.max(0, (now.getTime() - new Date(publishedAt).getTime()) / (1000 * 60 * 60));
  const rawEngagement = viewCount * 1 + likeCount * 3 + shareCount * 5 + listenCount * 4;
  const gravity = 1.5;
  return rawEngagement / Math.pow(hoursOld + 2, gravity);
}
