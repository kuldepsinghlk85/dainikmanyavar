import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const where: any = {};
    if (query) {
      where.name = { contains: query };
    }

    const tags = await db.tag.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articleTags: true },
        },
      },
    });

    const formattedTags = tags.map((t) => ({
      ...t,
      articleCount: t._count.articleTags,
    }));

    return NextResponse.json({ success: true, data: formattedTags });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, seoTitle, seoDescription } = await request.json();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Tag name is required' }, { status: 400 });
    }

    const cleanName = name.startsWith('#') ? name.slice(1) : name;
    const slug = slugify(cleanName);

    const tag = await db.tag.upsert({
      where: { slug },
      update: { name: `#${cleanName}` },
      create: {
        name: `#${cleanName}`,
        slug,
        seoTitle: seoTitle || `#${cleanName} की ताज़ा ख़बरें | दैनिक मान्यवर`,
        seoDescription: seoDescription || `#${cleanName} से जुड़ी सभी खबरें`,
      },
    });

    return NextResponse.json({ success: true, data: tag });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
