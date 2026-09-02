import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    const formatted = categories.map((c) => ({
      ...c,
      articleCount: c._count.articles,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug, order, isHeaderMenu = true } = await request.json();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name required' }, { status: 400 });
    }

    const cleanSlug = slug ? slugify(slug) : slugify(name);
    const categoryOrder = order ? parseInt(order, 10) : 99;

    const category = await db.category.upsert({
      where: { slug: cleanSlug },
      update: { name, order: categoryOrder, isHeaderMenu },
      create: {
        name,
        slug: cleanSlug,
        order: categoryOrder,
        isHeaderMenu,
      },
    });

    await db.auditLog.create({
      data: {
        action: 'CREATE_CATEGORY',
        objectType: 'CATEGORY',
        objectId: category.id,
        detailsJson: JSON.stringify({ name, slug: cleanSlug }),
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
