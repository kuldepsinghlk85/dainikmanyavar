import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const district = searchParams.get('district');
    const tag = searchParams.get('tag');

    if (!query.trim()) {
      return NextResponse.json({ success: true, suggestions: [], articles: [] });
    }

    const where: any = {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query } },
        { excerpt: { contains: query } },
        { content: { contains: query } },
      ],
    };

    if (category) where.category = { slug: category };
    if (district) where.location = { slug: district };
    if (tag) where.tags = { some: { tag: { slug: tag } } };

    const articles = await db.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: {
        category: true,
        location: true,
        tags: { include: { tag: true } },
      },
    });

    const suggestions = articles.slice(0, 5).map((a) => ({
      title: a.title,
      slug: a.slug,
      category: a.category?.name,
    }));

    return NextResponse.json({
      success: true,
      suggestions,
      articles: articles.map((a) => ({
        ...a,
        tags: a.tags.map((t) => t.tag),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
