import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const section = await db.homepageSection.findUnique({
      where: { sectionKey: 'hero_slider' },
    });

    const storyLimit = section?.storyCount || 10;
    let manualList: Array<{ id: string; order: number; enabled: boolean }> = [];

    if (section?.manualArticles) {
      try {
        manualList = JSON.parse(section.manualArticles);
      } catch (_) {}
    }

    // Filter to active/enabled curated articles
    const enabledManualIds = manualList
      .filter((m) => m.enabled !== false)
      .sort((a, b) => a.order - b.order)
      .map((m) => m.id);

    let resultArticles: any[] = [];

    if (enabledManualIds.length > 0) {
      const dbArticles = await db.article.findMany({
        where: {
          id: { in: enabledManualIds },
          status: 'PUBLISHED',
        },
        include: {
          category: true,
          author: true,
          location: true,
          tags: { include: { tag: true } },
        },
      });

      const dbMap = new Map(dbArticles.map((a) => [a.id, a]));

      // Preserve exact curated sequence order
      for (const id of enabledManualIds) {
        const art = dbMap.get(id);
        if (art && resultArticles.length < storyLimit) {
          resultArticles.push({
            ...art,
            tags: art.tags.map((t) => t.tag),
          });
        }
      }
    }

    // If manual curated articles are fewer than configured storyLimit, fill with latest published articles
    if (resultArticles.length < storyLimit) {
      const existingIds = new Set(resultArticles.map((a) => a.id));
      const remainingNeeded = storyLimit - resultArticles.length;

      const fallbackArticles = await db.article.findMany({
        where: {
          status: 'PUBLISHED',
          id: { notIn: Array.from(existingIds) },
        },
        orderBy: [
          { newsId: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        take: remainingNeeded,
        include: {
          category: true,
          author: true,
          location: true,
          tags: { include: { tag: true } },
        },
      });

      for (const f of fallbackArticles) {
        resultArticles.push({
          ...f,
          tags: f.tags.map((t) => t.tag),
        });
      }
    }

    return NextResponse.json({
      success: true,
      storyCount: storyLimit,
      data: resultArticles,
    });
  } catch (error: any) {
    console.error('Error fetching public slider:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
