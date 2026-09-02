import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NewsImportService } from '@/lib/importer/service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'NEW';

    const items = await db.newsImportItem.findMany({
      where: { status },
      orderBy: { importedAt: 'desc' },
      include: {
        source: true,
      },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, ids, action } = body;

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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
