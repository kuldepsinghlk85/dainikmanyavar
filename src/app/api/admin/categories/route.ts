import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

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
    const categoryOrder = order !== undefined && order !== '' ? parseInt(order, 10) : 99;

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

    try {
      revalidatePath('/');
    } catch {}

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isHeaderMenu, order, name, slug } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof isHeaderMenu === 'boolean') updateData.isHeaderMenu = isHeaderMenu;
    if (order !== undefined) updateData.order = parseInt(order, 10);
    if (name) updateData.name = name.trim();
    if (slug) updateData.slug = slugify(slug);

    const updated = await db.category.update({
      where: { id },
      data: updateData,
    });

    await db.auditLog.create({
      data: {
        action: 'UPDATE_CATEGORY',
        objectType: 'CATEGORY',
        objectId: updated.id,
        detailsJson: JSON.stringify(updateData),
      },
    });

    try {
      revalidatePath('/');
    } catch {}

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 });
    }

    // Check if category has articles
    const articleCount = await db.article.count({
      where: { primaryCategoryId: id },
    });

    if (articleCount > 0) {
      return NextResponse.json({
        success: false,
        error: `इस श्रेणी में ${articleCount} समाचार मौजूद हैं। इसे हटाने से पहले समाचारों की श्रेणी बदलें या उन्हें हटाएं।`,
      }, { status: 400 });
    }

    await db.category.delete({
      where: { id },
    });

    try {
      revalidatePath('/');
    } catch {}

    return NextResponse.json({ success: true, message: 'श्रेणी सफलतापूर्वक हटा दी गई' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
