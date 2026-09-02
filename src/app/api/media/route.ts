import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');

    const where: any = {};
    if (category) where.category = category;
    if (query) {
      where.OR = [
        { filename: { contains: query } },
        { originalName: { contains: query } },
        { caption: { contains: query } },
      ];
    }

    const items = await db.mediaItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await db.mediaItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'मीडिया आइटम हटा दिया गया' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
