import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ACTIVE'; // ACTIVE | ARCHIVED | ALL
    const query = searchParams.get('q');

    const where: any = {};

    if (status === 'ACTIVE') {
      where.isArchived = false;
    } else if (status === 'ARCHIVED') {
      where.isArchived = true;
    }

    if (query) {
      where.OR = [
        { customHeadline: { contains: query } },
        { article: { title: { contains: query } } },
      ];
    }

    const [items, articles] = await Promise.all([
      db.breakingNews.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          article: {
            select: { id: true, title: true, slug: true },
          },
        },
      }),
      // Fetch recent 30 published articles for dropdown selection
      db.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: 30,
        select: { id: true, title: true, slug: true },
      }),
    ]);

    // Counts for tabs
    const [activeCount, archivedCount, totalCount] = await Promise.all([
      db.breakingNews.count({ where: { isArchived: false } }),
      db.breakingNews.count({ where: { isArchived: true } }),
      db.breakingNews.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      articles,
      counts: {
        active: activeCount,
        archived: archivedCount,
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
    const { action, id, ids, customHeadline, articleId, priority, active } = body;

    // 1. CREATE New Ticker
    if (action === 'CREATE') {
      if (!customHeadline && !articleId) {
        return NextResponse.json(
          { success: false, error: 'कृपया टिकर हेडलाइन दर्ज करें अथवा खबर चुनें।' },
          { status: 400 }
        );
      }

      let headline = customHeadline;
      if (!headline && articleId) {
        const art = await db.article.findUnique({ where: { id: articleId } });
        headline = art?.title || 'ब्रेकिंग न्यूज़';
      }

      const newItem = await db.breakingNews.create({
        data: {
          customHeadline: headline,
          articleId: articleId || null,
          priority: Number(priority) || 1,
          active: active !== undefined ? Boolean(active) : true,
          isArchived: false,
          archivedAt: null,
        },
        include: { article: true },
      });

      return NextResponse.json({
        success: true,
        message: 'नया ब्रेकिंग टिकर सफलतापूर्वक जोड़ दिया गया!',
        data: newItem,
      });
    }

    // 2. UPDATE Existing Ticker
    if (action === 'UPDATE' && id) {
      const updateData: any = {};
      if (customHeadline !== undefined) updateData.customHeadline = customHeadline;
      if (articleId !== undefined) updateData.articleId = articleId || null;
      if (priority !== undefined) updateData.priority = Number(priority);
      if (active !== undefined) updateData.active = Boolean(active);

      const updated = await db.breakingNews.update({
        where: { id },
        data: updateData,
        include: { article: true },
      });

      return NextResponse.json({
        success: true,
        message: 'ब्रेकिंग टिकर सफलतापूर्वक अपडेट कर दिया गया!',
        data: updated,
      });
    }

    // 3. TOGGLE ACTIVE
    if (action === 'TOGGLE_ACTIVE' && id) {
      const current = await db.breakingNews.findUnique({ where: { id } });
      if (!current) {
        return NextResponse.json({ success: false, error: 'टिकर नहीं मिला' }, { status: 404 });
      }

      const updated = await db.breakingNews.update({
        where: { id },
        data: { active: !current.active },
      });

      return NextResponse.json({
        success: true,
        message: `टिकर ${updated.active ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)'} कर दिया गया!`,
        data: updated,
      });
    }

    // 4. ARCHIVE SELECTED
    if (action === 'ARCHIVE' && Array.isArray(ids)) {
      const count = await db.breakingNews.updateMany({
        where: { id: { in: ids } },
        data: {
          isArchived: true,
          active: false,
          archivedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `${count.count} ब्रेकिंग टिकर सफलतापूर्वक आर्काइव में सुरक्षित कर दिए गए!`,
      });
    }

    // 5. ARCHIVE ALL ACTIVE
    if (action === 'ARCHIVE_ALL') {
      const count = await db.breakingNews.updateMany({
        where: { isArchived: false },
        data: {
          isArchived: true,
          active: false,
          archivedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `सभी ${count.count} सक्रिय ब्रेकिंग टिकर सफलतापूर्वक आर्काइव में डाल दिए गए!`,
      });
    }

    // 6. RESTORE SELECTED
    if (action === 'RESTORE' && Array.isArray(ids)) {
      const count = await db.breakingNews.updateMany({
        where: { id: { in: ids } },
        data: {
          isArchived: false,
          active: true,
          archivedAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${count.count} ब्रेकिंग टिकर सफलतापूर्वक रिस्टोर (Live Published) कर दिए गए!`,
      });
    }

    // 7. RESTORE ALL ARCHIVED
    if (action === 'RESTORE_ALL') {
      const count = await db.breakingNews.updateMany({
        where: { isArchived: true },
        data: {
          isArchived: false,
          active: true,
          archivedAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `सभी ${count.count} आर्काइव्ड टिकर सफलतापूर्वक रिस्टोर व लाइव कर दिए गए!`,
      });
    }

    return NextResponse.json({ success: false, error: 'अमान्य अनुरोध (Invalid action)' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'हटाने के लिए कोई ID नहीं दी गई।' }, { status: 400 });
    }

    const deleted = await db.breakingNews.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      success: true,
      message: `${deleted.count} ब्रेकिंग टिकर हमेशा के लिए हटा दिए गए।`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
