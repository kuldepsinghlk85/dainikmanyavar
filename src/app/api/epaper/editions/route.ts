import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const id = searchParams.get('id');
    const query = searchParams.get('q');
    const dateStr = searchParams.get('date');

    if (id) {
      const edition = await db.epaperEdition.findUnique({
        where: { id },
        include: {
          pages: { orderBy: { pageNumber: 'asc' } },
          ads: { where: { active: true } },
        },
      });

      if (!edition) {
        return NextResponse.json({ success: false, error: 'Edition not found' }, { status: 404 });
      }

      // Increment view count asynchronously
      await db.epaperEdition.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {});

      return NextResponse.json({ success: true, data: edition });
    }

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
      ];
    }
    if (dateStr) {
      const targetDate = new Date(dateStr);
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        where.editionDate = { gte: startOfDay, lte: endOfDay };
      }
    }

    const [editions, publishedCount, archivedCount, draftCount, totalCount] = await Promise.all([
      db.epaperEdition.findMany({
        where,
        orderBy: { editionDate: 'desc' },
        include: {
          pages: { select: { id: true, pageNumber: true, pageTitle: true, pageImage: true } },
        },
      }),
      db.epaperEdition.count({ where: { status: 'PUBLISHED' } }),
      db.epaperEdition.count({ where: { status: 'ARCHIVED' } }),
      db.epaperEdition.count({ where: { status: 'DRAFT' } }),
      db.epaperEdition.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: editions,
      counts: {
        published: publishedCount,
        archived: archivedCount,
        draft: draftCount,
        total: totalCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, ids } = body;

    // 1. ARCHIVE SELECTED
    if (action === 'ARCHIVE') {
      const targetIds = Array.isArray(ids) ? ids : id ? [id] : [];
      if (targetIds.length === 0) {
        return NextResponse.json({ success: false, error: 'आर्काइव के लिए कोई संस्करण नहीं चुना गया।' }, { status: 400 });
      }

      const updated = await db.epaperEdition.updateMany({
        where: { id: { in: targetIds } },
        data: { status: 'ARCHIVED' },
      });

      return NextResponse.json({
        success: true,
        message: `${updated.count} ई-पेपर संस्करण सफलतापूर्वक आर्काइव में भेज दिए गए!`,
      });
    }

    // 2. RESTORE / PUBLISH SELECTED
    if (action === 'RESTORE') {
      const targetIds = Array.isArray(ids) ? ids : id ? [id] : [];
      if (targetIds.length === 0) {
        return NextResponse.json({ success: false, error: 'रिस्टोर के लिए कोई संस्करण नहीं चुना गया।' }, { status: 400 });
      }

      const updated = await db.epaperEdition.updateMany({
        where: { id: { in: targetIds } },
        data: { status: 'PUBLISHED' },
      });

      return NextResponse.json({
        success: true,
        message: `${updated.count} ई-पेपर संस्करण पुनः लाइव प्रकाशित कर दिए गए!`,
      });
    }

    // 3. ARCHIVE ALL PUBLISHED
    if (action === 'ARCHIVE_ALL') {
      const updated = await db.epaperEdition.updateMany({
        where: { status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' },
      });

      return NextResponse.json({
        success: true,
        message: `सभी ${updated.count} पुराने प्रकाशित अखबार आर्काइव में सुरक्षित कर दिए गए!`,
      });
    }

    // 4. RESTORE ALL ARCHIVED
    if (action === 'RESTORE_ALL') {
      const updated = await db.epaperEdition.updateMany({
        where: { status: 'ARCHIVED' },
        data: { status: 'PUBLISHED' },
      });

      return NextResponse.json({
        success: true,
        message: `सभी ${updated.count} आर्काइव्ड अखबार पुनः लाइव पब्लिश कर दिए गए!`,
      });
    }

    return NextResponse.json({ success: false, error: 'अमान्य अनुरोध (Invalid action)' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    let ids: string[] = [];
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');
    const idsParam = url.searchParams.get('ids');

    if (idParam) {
      ids = [idParam];
    } else if (idsParam) {
      ids = idsParam.split(',').filter(Boolean);
    } else {
      try {
        const body = await request.json();
        if (Array.isArray(body?.ids)) ids = body.ids;
        else if (body?.id) ids = [body.id];
      } catch (_) {}
    }

    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'हटाने के लिए कोई ID नहीं दी गई।' }, { status: 400 });
    }

    const deleted = await db.epaperEdition.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      success: true,
      message: `${deleted.count} ई-पेपर संस्करण हमेशा के लिए हटा दिए गए।`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
