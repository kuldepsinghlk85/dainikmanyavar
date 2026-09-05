import { db } from '@/lib/db';

/**
 * Returns the next sequential numbered ID for an article.
 */
export async function getNextNewsId(): Promise<number> {
  await ensureArticleNewsIds();

  const maxResult = await db.article.aggregate({
    _max: { newsId: true },
  });

  return (maxResult._max.newsId || 0) + 1;
}

/**
 * Ensures all articles in the database have a unique sequential newsId (>= 1).
 * Orders unassigned articles chronologically by createdAt/publishedAt.
 */
export async function ensureArticleNewsIds(): Promise<void> {
  try {
    const unassigned = await db.article.findMany({
      where: { newsId: { lte: 0 } },
      orderBy: [
        { createdAt: 'asc' },
        { publishedAt: 'asc' },
      ],
      select: { id: true },
    });

    if (unassigned.length === 0) return;

    const latest = await db.article.findFirst({
      where: { newsId: { gt: 0 } },
      orderBy: { newsId: 'desc' },
      select: { newsId: true },
    });

    let nextId = (latest?.newsId || 0) + 1;

    for (const item of unassigned) {
      await db.article.update({
        where: { id: item.id },
        data: { newsId: nextId++ },
      });
    }
  } catch (err) {
    console.error('Error ensuring article newsIds:', err);
  }
}
