import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const items = await db.breakingNews.findMany({
      where: {
        isArchived: false,
        active: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        article: {
          select: { id: true, title: true, slug: true },
        },
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
