import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subtype = searchParams.get('subtype');
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const category = await db.category.findUnique({
      where: { slug: 'manoranjan' },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json({ success: true, data: [] });
    }

    const where: any = {
      primaryCategoryId: category.id,
      status: 'PUBLISHED',
    };

    if (subtype && subtype !== 'all') {
      where.sourceType = subtype;
    }

    const articles = await db.article.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        newsId: true,
        title: true,
        subtitle: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        gallery: true,
        sourceType: true,
        isFeatured: true,
        publishedAt: true,
      },
    });

    return NextResponse.json(
      { success: true, data: articles },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'डाटा लोड करने में विफल' }, { status: 500 });
  }
}
