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

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
