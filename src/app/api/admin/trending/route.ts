import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

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

    // Otherwise, fetch or initialize trending_widget section
    let section = await db.homepageSection.findUnique({
      where: { sectionKey: 'trending_widget' },
    });

    if (!section) {
      // Auto-populate initial top 15 latest published articles as default trending sequence
      const initialArticles = await db.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [
          { newsId: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 15,
        select: { id: true },
      });

      const initialManual = initialArticles.map((art, idx) => ({
        id: art.id,
        order: idx + 1,
        enabled: true,
      }));

      section = await db.homepageSection.create({
        data: {
          sectionKey: 'trending_widget',
          title: '🔥 ट्रेंडिंग न्यूज़ (Trending Widget)',
          order: 2,
          enabled: true,
          storyCount: 15,
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

    // Fetch full article info for the manual list
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
        storyCount: section.storyCount || 15,
        items: orderedItems,
      },
    });
  } catch (error) {
    console.error('Error fetching admin trending:', error);
    return NextResponse.json({ success: false, error: 'ट्रेंडिंग न्यूज़ डेटा लोड करने में समस्या आई' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत अनुरोध (Unauthorized)' }, { status: 401 });
    }

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
      where: { sectionKey: 'trending_widget' },
      update: {
        storyCount: typeof storyCount === 'number' ? storyCount : 15,
        enabled: enabled !== undefined ? enabled : true,
        manualArticles: JSON.stringify(formattedManual),
      },
      create: {
        sectionKey: 'trending_widget',
        title: '🔥 ट्रेंडिंग न्यूज़ (Trending Widget)',
        order: 2,
        enabled: enabled !== undefined ? enabled : true,
        storyCount: typeof storyCount === 'number' ? storyCount : 15,
        manualArticles: JSON.stringify(formattedManual),
      },
    });

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/latest-news');
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'ट्रेंडिंग न्यूज़ का क्रम व सेटिंग्स सफलतापूर्वक सुरक्षित हो गए!',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating trending:', error);
    return NextResponse.json({ success: false, error: 'ट्रेंडिंग न्यूज़ क्रम सुरक्षित करने में समस्या आई' }, { status: 500 });
  }
}
