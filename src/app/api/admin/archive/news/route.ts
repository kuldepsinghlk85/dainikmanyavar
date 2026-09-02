import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const where: any = { status: 'ARCHIVED' };
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { excerpt: { contains: query } },
      ];
    }

    const archivedArticles = await db.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
        location: true,
      },
    });

    return NextResponse.json({ success: true, data: archivedArticles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { ids, action, daysOlder } = await request.json();

    // Auto-archive articles older than X days
    if (action === 'ARCHIVE_OLDER' && typeof daysOlder === 'number') {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - daysOlder);

      const archived = await db.article.updateMany({
        where: {
          publishedAt: { lt: targetDate },
          status: 'PUBLISHED',
        },
        data: { status: 'ARCHIVED' },
      });

      return NextResponse.json({
        success: true,
        message: `${archived.count} खबरें सफलतापूर्वक आर्काइवर में स्थानांतरित कर दी गईं!`,
      });
    }

    // Bulk Move to Archive
    if (action === 'MOVE_TO_ARCHIVE' && Array.isArray(ids)) {
      const archived = await db.article.updateMany({
        where: { id: { in: ids } },
        data: { status: 'ARCHIVED' },
      });

      return NextResponse.json({
        success: true,
        message: `${archived.count} खबरें आर्काइव में डाल दी गईं।`,
      });
    }

    // Restore to Live Published
    if (action === 'RESTORE' && Array.isArray(ids)) {
      const restored = await db.article.updateMany({
        where: { id: { in: ids } },
        data: { status: 'PUBLISHED' },
      });

      return NextResponse.json({
        success: true,
        message: `${restored.count} खबरें सफलतापूर्वक रिस्टोर (Live Published) कर दी गईं!`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
