import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPublicSiteUrl } from '@/lib/utils';

export interface ResolvedArticle {
  id: string;
  slug: string;
  title: string;
  newsId?: number | null;
}

/**
 * Universal short code resolver.
 * Handles ANY short identifier across the website:
 * 1. ShareTracking codes (e.g. xpkaw36, xx6judc)
 * 2. ShortLink shortCode (e.g. 1a7b9d)
 * 3. Numeric newsId (e.g. 48, 55)
 * 4. Article id, uuid, or slug
 * 5. NotificationLog shortUrl containing code
 */
export async function resolveArticleByCode(
  code: string,
  request?: NextRequest | Request
): Promise<ResolvedArticle | null> {
  if (!code || typeof code !== 'string') return null;
  const trimmed = code.trim();
  if (!trimmed) return null;

  // 1. Check ShareTracking
  try {
    const share = await db.shareTracking.findUnique({
      where: { trackingCode: trimmed },
    });
    if (share) {
      // Increment click count
      db.shareTracking.update({
        where: { id: share.id },
        data: { clickCount: { increment: 1 } },
      }).catch(() => {});

      if (request) {
        const isMobile = request.headers.get('user-agent')?.toLowerCase().includes('mobile');
        db.userActivityLog.create({
          data: {
            userId: share.userId,
            newsId: share.newsId,
            activityType: 'VIEW',
            device: isMobile ? 'mobile' : 'web',
          },
        }).catch(() => {});
      }

      const article = await db.article.findUnique({
        where: { id: share.newsId },
        select: { id: true, slug: true, title: true, newsId: true, status: true },
      });
      if (article && (article.status === 'PUBLISHED' || article.status === 'ARCHIVED')) {
        return article;
      }
    }
  } catch (err) {
    console.error('Error resolving shareTracking code:', err);
  }

  // 2. Check ShortLink table
  try {
    const shortLink = await db.shortLink.findUnique({
      where: { shortCode: trimmed },
      select: { id: true, articleId: true },
    });
    if (shortLink) {
      db.shortLink.update({
        where: { id: shortLink.id },
        data: { clickCount: { increment: 1 } },
      }).catch(() => {});

      const article = await db.article.findUnique({
        where: { id: shortLink.articleId },
        select: { id: true, slug: true, title: true, newsId: true, status: true },
      });
      if (article && (article.status === 'PUBLISHED' || article.status === 'ARCHIVED')) {
        return article;
      }
    }
  } catch (err) {
    console.error('Error resolving shortLink code:', err);
  }

  // 3. Check Numeric newsId
  const numericId = parseInt(trimmed, 10);
  if (!isNaN(numericId) && numericId > 0 && String(numericId) === trimmed) {
    try {
      const article = await db.article.findFirst({
        where: {
          newsId: numericId,
          status: { in: ['PUBLISHED', 'ARCHIVED'] },
        },
        select: { id: true, slug: true, title: true, newsId: true },
      });
      if (article) return article;
    } catch (err) {
      console.error('Error resolving numeric newsId:', err);
    }
  }

  // 4. Check by Article ID, UUID, or Slug
  try {
    let decoded = trimmed;
    try {
      decoded = decodeURIComponent(trimmed);
    } catch (_) {}

    const article = await db.article.findFirst({
      where: {
        OR: [
          { id: trimmed },
          { uuid: trimmed },
          { slug: trimmed },
          { slug: decoded },
        ],
        status: { in: ['PUBLISHED', 'ARCHIVED'] },
      },
      select: { id: true, slug: true, title: true, newsId: true },
    });
    if (article) return article;
  } catch (err) {
    console.error('Error resolving article by id/slug:', err);
  }

  // 5. Check NotificationLog
  try {
    const notif = await db.notificationLog.findFirst({
      where: {
        OR: [
          { shortUrl: { contains: `/n/${trimmed}` } },
          { shortUrl: { contains: `/share/${trimmed}` } },
          { shortUrl: { contains: `/s/${trimmed}` } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, newsId: true },
    });
    if (notif?.newsId) {
      db.notificationLog.update({
        where: { id: notif.id },
        data: { openedStatus: 'OPENED', openedTime: new Date() },
      }).catch(() => {});

      const article = await db.article.findUnique({
        where: { id: notif.newsId },
        select: { id: true, slug: true, title: true, newsId: true, status: true },
      });
      if (article && (article.status === 'PUBLISHED' || article.status === 'ARCHIVED')) {
        return article;
      }
    }
  } catch (err) {
    console.error('Error resolving notificationLog code:', err);
  }

  return null;
}

/**
 * Creates safe redirect response that NEVER leaks localhost in production.
 */
export function handleShortLinkRedirect(
  request: NextRequest,
  article: ResolvedArticle | null
): NextResponse {
  const base = getPublicSiteUrl(request);

  if (!article || !article.slug) {
    // If article not found, redirect safely to homepage without leaking localhost
    return NextResponse.redirect(new URL('/', base), 307);
  }

  const isMobile = request.headers.get('user-agent')?.toLowerCase().includes('mobile');
  const targetPath = isMobile
    ? `/mobile/news/${encodeURIComponent(article.slug)}`
    : `/news/${encodeURIComponent(article.slug)}`;

  return NextResponse.redirect(new URL(targetPath, base), 307);
}
