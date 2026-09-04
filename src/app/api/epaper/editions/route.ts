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

    const editions = await db.epaperEdition.findMany({
      where,
      orderBy: { editionDate: 'desc' },
      include: {
        pages: { select: { id: true, pageNumber: true, pageTitle: true, pageImage: true } },
      },
    });

    return NextResponse.json({ success: true, data: editions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await db.epaperEdition.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'ई-पेपर संस्करण हटा दिया गया' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
