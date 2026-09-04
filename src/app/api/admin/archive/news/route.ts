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
        message: `${archived.count} खबरें सफलतापूर्वक आर्काइव में डाल दी गईं।`,
      });
    }

    // Archive ALL active articles with 1-click
    if (action === 'ARCHIVE_ALL') {
      const archived = await db.article.updateMany({
        where: { status: { not: 'ARCHIVED' } },
        data: { status: 'ARCHIVED' },
      });

      return NextResponse.json({
        success: true,
        message: `सभी ${archived.count} खबरें सफलतापूर्वक आर्काइव में सुरक्षित कर दी गईं!`,
      });
    }

    // Restore Selected to Live Published (Republish)
    if (action === 'RESTORE' && Array.isArray(ids)) {
      const restored = await db.article.updateMany({
        where: { id: { in: ids } },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(), // रिपब्लिश होने पर वर्तमान समय सेट करें
        },
      });

      return NextResponse.json({
        success: true,
        message: `${restored.count} खबरें सफलतापूर्वक रिस्टोर व रिपब्लिश (Live Published) कर दी गईं!`,
      });
    }

    // Restore ALL archived articles back to Live Published
    if (action === 'RESTORE_ALL') {
      const restored = await db.article.updateMany({
        where: { status: 'ARCHIVED' },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `सभी ${restored.count} आर्काइव्ड खबरें सफलतापूर्वक रिस्टोर व रिपब्लिश कर दी गईं!`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
