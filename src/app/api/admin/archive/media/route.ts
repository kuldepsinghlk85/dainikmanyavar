import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'ALL';

    const where: any = {};
    if (category !== 'ALL') {
      where.category = category;
    }

    const mediaItems = await db.mediaItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: mediaItems });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, filename, category = 'सामान्य', caption } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    const item = await db.mediaItem.create({
      data: {
        filename: filename || url.split('/').pop() || 'archive_image.jpg',
        url,
        category,
        caption,
        mimeType: 'image/jpeg',
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
