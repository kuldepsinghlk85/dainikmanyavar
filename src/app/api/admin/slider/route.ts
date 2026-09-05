import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // If search query is provided, return matching published articles to pick from
    if (search !== null) {
      const articles = await db.article.findMany({
        where: {
          status: 'PUBLISHED',
          ...(search.trim()
            ? {
                OR: [
                  { title: { contains: search.trim() } },
                  { excerpt: { contains: search.trim() } },
                ],
              }
            : {}),
        },
        orderBy: [{ newsId: 'desc' }, { publishedAt: 'desc' }],
        take: 30,
        select: {
          id: true,
          newsId: true,
          title: true,
          slug: true,
          featuredImage: true,
          publishedAt: true,
          category: { select: { name: true } },
        },
      });
      return NextResponse.json({ success: true, data: articles });
    }

    // Otherwise, fetch or initialize hero_slider section
    let section = await db.homepageSection.findUnique({
      where: { sectionKey: 'hero_slider' },
    });

    if (!section) {
      // Auto-populate initial top 10 articles as default slider sequence
      const initialArticles = await db.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ newsId: 'desc' }, { publishedAt: 'desc' }],
        take: 10,
        select: { id: true },
      });

      const initialManual = initialArticles.map((art, idx) => ({
        id: art.id,
        order: idx + 1,
        enabled: true,
      }));

      section = await db.homepageSection.create({
        data: {
          sectionKey: 'hero_slider',
          title: 'मुख्य लीड स्टोरी (Hero Story Slider)',
          order: 1,
          enabled: true,
          storyCount: 10,
          manualArticles: JSON.stringify(initialManual),
        },
      });
    }

    let manualList: Array<{ id: string; order: number; enabled: boolean }> = [];
    try {
      if (section.manualArticles) {
        manualList = JSON.parse(section.manualArticles);
      }
    } catch (_) {}

    // Fetch full article info for the manual slider list
    const articleIds = manualList.map((m) => m.id);
    const articlesInDb = await db.article.findMany({
      where: { id: { in: articleIds } },
      select: {
        id: true,
        newsId: true,
        title: true,
        slug: true,
        featuredImage: true,
        publishedAt: true,
        status: true,
        category: { select: { name: true } },
      },
    });

    const articleMap = new Map(articlesInDb.map((a) => [a.id, a]));

    // Preserve the custom sequence order
    const orderedItems = manualList
      .map((item) => {
        const art = articleMap.get(item.id);
        if (!art) return null;
        return {
          ...art,
          order: item.order,
          enabled: item.enabled !== false,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        sectionKey: section.sectionKey,
        title: section.title,
        enabled: section.enabled,
        storyCount: section.storyCount || 10,
        items: orderedItems,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin slider:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storyCount, items, enabled } = body;

    const formattedManual = Array.isArray(items)
      ? items.map((item: any, idx: number) => ({
          id: item.id,
          order: typeof item.order === 'number' ? item.order : idx + 1,
          enabled: item.enabled !== false,
        }))
      : [];

    const updated = await db.homepageSection.upsert({
      where: { sectionKey: 'hero_slider' },
      update: {
        storyCount: typeof storyCount === 'number' ? storyCount : 10,
        enabled: enabled !== undefined ? enabled : true,
        manualArticles: JSON.stringify(formattedManual),
      },
      create: {
        sectionKey: 'hero_slider',
        title: 'मुख्य लीड स्टोरी (Hero Story Slider)',
        order: 1,
        enabled: enabled !== undefined ? enabled : true,
        storyCount: typeof storyCount === 'number' ? storyCount : 10,
        manualArticles: JSON.stringify(formattedManual),
      },
    });

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/mobile');
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'स्लाइडर अनुक्रम व सेटिंग्स सफलतापूर्वक सुरक्षित हो गए!',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating slider:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
