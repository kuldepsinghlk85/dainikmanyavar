import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sources = await db.newsSource.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        defaultCategory: true,
        defaultLocation: true,
        _count: {
          select: { items: true, logs: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: sources });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      publisherName,
      sourceType = 'RSS',
      feedUrl,
      websiteUrl,
      permissionMode = 'METADATA_ONLY',
      fetchInterval = '15m',
      defaultCategoryId,
      defaultLocationId,
    } = body;

    if (!name || !publisherName) {
      return NextResponse.json({ success: false, error: 'नाम और प्रकाशक नाम अनिवार्य हैं' }, { status: 400 });
    }

    const source = await db.newsSource.create({
      data: {
        name,
        publisherName,
        sourceType,
        feedUrl,
        websiteUrl,
        permissionMode,
        fetchInterval,
        defaultCategoryId: defaultCategoryId || undefined,
        defaultLocationId: defaultLocationId || undefined,
        isActive: true,
        healthStatus: 'Healthy',
      },
    });

    await db.auditLog.create({
      data: {
        action: 'CREATE_NEWS_SOURCE',
        objectType: 'NEWS_SOURCE',
        objectId: source.id,
        detailsJson: JSON.stringify({ name, sourceType, feedUrl }),
      },
    });

    return NextResponse.json({ success: true, data: source });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
