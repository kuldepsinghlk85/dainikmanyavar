import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateTag } from '@/lib/tagUtils';
import { getAdminSession } from '@/lib/auth';

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
    console.error('Error in GET /api/admin/tags:', error);
    return NextResponse.json({ success: false, error: 'टैग्स लोड करने में त्रुटि हुई।' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, seoTitle, seoDescription } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'टैग का नाम आवश्यक है।' }, { status: 400 });
    }

    const tag = await getOrCreateTag(name.trim(), seoTitle, seoDescription);

    return NextResponse.json({ success: true, data: tag });
  } catch (error: any) {
    console.error('Error in POST /api/admin/tags:', error);
    return NextResponse.json({ success: false, error: 'टैग बनाने में त्रुटि हुई।' }, { status: 500 });
  }
}

