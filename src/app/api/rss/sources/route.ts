import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const region = searchParams.get('region');

    const where: any = {};
    if (category) where.category = category;
    if (region) where.region = region;

    const sources = await db.newsSource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: sources });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, publisherName, category, region, feedUrl, websiteUrl, logoUrl, sourceType, autoSync, syncInterval } = body;

    const source = await db.newsSource.create({
      data: {
        name,
        publisherName: publisherName || name,
        category: category || 'NEWS',
        region: region || 'NORTH_INDIA',
        feedUrl,
        websiteUrl,
        logoUrl,
        sourceType: sourceType || 'RSS',
        autoSync: autoSync !== undefined ? autoSync : true,
        syncInterval: parseInt(syncInterval || '15'),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: source });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await db.newsSource.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'RSS Source deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
