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
        orderBy: [{ createdAt: 'desc' }, { priority: 'desc' }],
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
          priority: priority !== undefined ? Number(priority) : 3,
          active: active !== undefined ? Boolean(active) : true,
          isArchived: false,
          archivedAt: null,
          createdAt: new Date(),
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

    // 8. MOVE UP (ऊपर लाएं)
    if (action === 'MOVE_UP' && id) {
      const current = await db.breakingNews.findUnique({ where: { id } });
      if (!current) return NextResponse.json({ success: false, error: 'टिकर नहीं मिला' }, { status: 404 });

      // Find item immediately above (newer createdAt)
      const prev = await db.breakingNews.findFirst({
        where: {
          isArchived: current.isArchived,
          createdAt: { gt: current.createdAt },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (prev) {
        // Swap createdAts
        const tempTime = prev.createdAt;
        let newCurrentTime = tempTime;
        let newPrevTime = current.createdAt;
        if (newCurrentTime.getTime() <= newPrevTime.getTime()) {
          newCurrentTime = new Date(newPrevTime.getTime() + 1000);
        }
        await db.$transaction([
          db.breakingNews.update({ where: { id: current.id }, data: { createdAt: newCurrentTime } }),
          db.breakingNews.update({ where: { id: prev.id }, data: { createdAt: newPrevTime } }),
        ]);
      }

      return NextResponse.json({ success: true, message: 'टिकर ऊपर लाया गया!' });
    }

    // 9. MOVE DOWN (नीचे खिसकाएं)
    if (action === 'MOVE_DOWN' && id) {
      const current = await db.breakingNews.findUnique({ where: { id } });
      if (!current) return NextResponse.json({ success: false, error: 'टिकर नहीं मिला' }, { status: 404 });

      // Find item immediately below (older createdAt)
      const next = await db.breakingNews.findFirst({
        where: {
          isArchived: current.isArchived,
          createdAt: { lt: current.createdAt },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (next) {
        // Swap createdAts
        const tempTime = next.createdAt;
        let newCurrentTime = tempTime;
        let newNextTime = current.createdAt;
        if (newCurrentTime.getTime() >= newNextTime.getTime()) {
          newCurrentTime = new Date(newNextTime.getTime() - 1000);
        }
        await db.$transaction([
          db.breakingNews.update({ where: { id: current.id }, data: { createdAt: newCurrentTime } }),
          db.breakingNews.update({ where: { id: next.id }, data: { createdAt: newNextTime } }),
        ]);
      }

      return NextResponse.json({ success: true, message: 'टिकर नीचे खिसकाया गया!' });
    }

    // 10. MOVE TO TOP (सीधे सबसे ऊपर शीर्ष पर लाएं)
    if (action === 'MOVE_TO_TOP' && id) {
      const current = await db.breakingNews.findUnique({ where: { id } });
      if (!current) return NextResponse.json({ success: false, error: 'टिकर नहीं मिला' }, { status: 404 });

      const topItem = await db.breakingNews.findFirst({
        where: { isArchived: current.isArchived },
        orderBy: { createdAt: 'desc' },
      });

      const bumpTime = topItem
        ? new Date(Math.max(Date.now(), topItem.createdAt.getTime() + 1000))
        : new Date();

      await db.breakingNews.update({
        where: { id: current.id },
        data: { createdAt: bumpTime },
      });

      return NextResponse.json({ success: true, message: 'टिकर सबसे ऊपर (#1 शीर्ष) लाया गया!' });
    }

    // 11. MOVE TO BOTTOM (सीधे सबसे नीचे भेजें)
    if (action === 'MOVE_TO_BOTTOM' && id) {
      const current = await db.breakingNews.findUnique({ where: { id } });
      if (!current) return NextResponse.json({ success: false, error: 'टिकर नहीं मिला' }, { status: 404 });

      const bottomItem = await db.breakingNews.findFirst({
        where: { isArchived: current.isArchived },
        orderBy: { createdAt: 'asc' },
      });

      const sinkTime = bottomItem
        ? new Date(bottomItem.createdAt.getTime() - 1000)
        : new Date();

      await db.breakingNews.update({
        where: { id: current.id },
        data: { createdAt: sinkTime },
      });

      return NextResponse.json({ success: true, message: 'टिकर सबसे नीचे भेजा गया!' });
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
