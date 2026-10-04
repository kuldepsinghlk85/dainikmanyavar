import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleType = searchParams.get('moduleType');

    const where: any = {};
    if (moduleType) where.moduleType = moduleType;

    const items = await db.externalSpecialFeedItem.findMany({
      where,
      orderBy: { fetchedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action, title, summary, suggestedTags } = body;

    if (action === 'APPROVE') {
      const item = await db.externalSpecialFeedItem.findUnique({ where: { id } });
      if (!item) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });

      // Publish into respective special content module
      if (item.moduleType === 'CRICKET') {
        await db.cricketMatch.create({
          data: {
            matchTitle: title || item.title,
            newsHeadline: title || item.title,
            newsSummary: summary || item.summary,
            teamA: 'भारत (IND)',
            teamB: 'विरोधी टीम',
            status: 'PUBLISHED',
            tagsJson: suggestedTags || item.suggestedTags,
          },
        });
      } else if (item.moduleType === 'HOROSCOPE') {
        await db.horoscope.create({
          data: {
            zodiacSign: 'mesh',
            zodiacHindi: 'मेष (Aries)',
            title: title || item.title,
            prediction: summary || item.summary || 'आज का राशिफल विवरण',
            status: 'PUBLISHED',
            tagsJson: suggestedTags || item.suggestedTags,
          },
        });
      } else if (item.moduleType === 'STOCK_MARKET') {
        await db.stockMarketUpdate.create({
          data: {
            title: title || item.title,
            content: summary || item.summary || 'बाजार विश्लेषण',
            status: 'PUBLISHED',
            tagsJson: suggestedTags || item.suggestedTags,
          },
        });
      }

      await db.externalSpecialFeedItem.update({
        where: { id },
        data: { status: 'APPROVED' },
      });

      return NextResponse.json({ success: true, message: 'सफलतापूर्वक अप्रूव व पब्लिश कर दिया गया!' });
    }

    if (action === 'REJECT') {
      await db.externalSpecialFeedItem.update({
        where: { id },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json({ success: true, message: 'आइटम रिजेक्ट कर दिया गया' });
    }

    if (action === 'DELETE') {
      if (!id) return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
      await db.externalSpecialFeedItem.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'लिंक सफलतापूर्वक डिलीट कर दिया गया!' });
    }

    if (action === 'CLEAR_ALL' || action === 'CLEAR') {
      const where: any = {};
      const { moduleType: clearModule, status: clearStatus, ids } = body;
      if (Array.isArray(ids) && ids.length > 0) {
        where.id = { in: ids };
      } else {
        if (clearModule && clearModule !== 'ALL') where.moduleType = clearModule;
        if (clearStatus && clearStatus !== 'ALL') where.status = clearStatus;
      }
      const res = await db.externalSpecialFeedItem.deleteMany({ where });
      return NextResponse.json({
        success: true,
        count: res.count,
        message: `${res.count} लिंक इनबॉक्स से सफलतापूर्वक क्लियर कर दिए गए!`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    const moduleType = searchParams.get('moduleType');
    const status = searchParams.get('status');
    const clearAll = searchParams.get('clearAll') === 'true';

    let ids: string[] = [];
    try {
      const body = await request.json();
      if (body.ids && Array.isArray(body.ids)) ids = body.ids;
      if (body.id) id = body.id;
    } catch (_) {}

    if (ids.length > 0) {
      const res = await db.externalSpecialFeedItem.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({
        success: true,
        count: res.count,
        message: `${res.count} लिंक सफलतापूर्वक हटा दिए गए!`,
      });
    }

    if (id) {
      await db.externalSpecialFeedItem.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'लिंक सफलतापूर्वक डिलीट कर दिया गया!' });
    }

    if (clearAll) {
      const where: any = {};
      if (moduleType && moduleType !== 'ALL') where.moduleType = moduleType;
      if (status && status !== 'ALL') where.status = status;
      const res = await db.externalSpecialFeedItem.deleteMany({ where });
      return NextResponse.json({
        success: true,
        count: res.count,
        message: `इनबॉक्स से ${res.count} लिंक सफलतापूर्वक क्लियर कर दिए गए!`,
      });
    }

    return NextResponse.json({ success: false, error: 'No item id or clear action specified' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
