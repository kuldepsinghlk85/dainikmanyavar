import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { NewsImportService } from '@/lib/importer/service';
import { translateTextToHindi, translateArticleData } from '@/lib/translate';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'NEW';

    const items = await db.newsImportItem.findMany({
      where: { status },
      take: 100,
      orderBy: { importedAt: 'desc' },
      include: {
        source: true,
      },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error('Error in importer inbox GET:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ids, action } = body;

    // Translation of single import item
    if (action === 'TRANSLATE_ITEM') {
      const targetId = id || (Array.isArray(ids) && ids[0]);
      if (!targetId) {
        return NextResponse.json({ success: false, error: 'id आवश्यक है' }, { status: 400 });
      }

      const item = await db.newsImportItem.findUnique({
        where: { id: targetId },
        include: { source: true },
      });

      if (!item) {
        return NextResponse.json({ success: false, error: 'खबर नहीं मिली' }, { status: 404 });
      }

      const [translatedTitle, translatedExcerpt] = await Promise.all([
        translateTextToHindi(item.originalTitle),
        translateTextToHindi(item.originalExcerpt || item.originalTitle),
      ]);

      let currentTags: string[] = [];
      try {
        if (item.suggestedTagsJson) currentTags = JSON.parse(item.suggestedTagsJson);
      } catch {}

      const translatedData = await translateArticleData({ tags: currentTags });

      const updated = await db.newsImportItem.update({
        where: { id: targetId },
        data: {
          originalTitle: translatedTitle,
          originalExcerpt: translatedExcerpt,
          suggestedTagsJson: JSON.stringify(translatedData.tags),
        },
        include: { source: true },
      });

      return NextResponse.json({
        success: true,
        message: 'हिंदी अनुवाद सफल रहा!',
        item: updated,
      });
    }

    // Bulk Clear All New Items
    if (action === 'CLEAR_ALL') {
      const deleted = await db.newsImportItem.deleteMany({
        where: { status: 'NEW' },
      });
      return NextResponse.json({
        success: true,
        message: `${deleted.count} इनबॉक्स समाचार सफलता से हटा दिए गए।`,
      });
    }

    // Bulk Delete / Reject Selected Items
    if (action === 'DELETE_SELECTED' && Array.isArray(ids)) {
      const deleted = await db.newsImportItem.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({
        success: true,
        message: `${deleted.count} चयनित समाचार सफलता से हटा दिए गए।`,
      });
    }

    // Bulk Create Drafts
    if (action === 'BULK_CREATE_DRAFT' && Array.isArray(ids)) {
      let createdCount = 0;
      for (const itemId of ids) {
        try {
          await NewsImportService.convertInboxItemToDraft(itemId);
          createdCount++;
        } catch (err) {}
      }
      return NextResponse.json({
        success: true,
        message: `${createdCount} ड्राफ्ट सफलतापूर्वक बनाए गए!`,
      });
    }

    // Single Actions
    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'Invalid arguments' }, { status: 400 });
    }

    let targetStatus = 'NEW';
    if (action === 'REJECT') targetStatus = 'REJECTED';
    if (action === 'MARK_DUPLICATE') targetStatus = 'DUPLICATE';
    if (action === 'RESTORE') targetStatus = 'NEW';
    if (action === 'DELETE') {
      await db.newsImportItem.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Deleted' });
    }

    const updated = await db.newsImportItem.update({
      where: { id },
      data: { status: targetStatus },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error in importer inbox POST:', error);
    return NextResponse.json({ success: false, error: 'कार्रवाई करने में समस्या आई' }, { status: 500 });
  }
}
