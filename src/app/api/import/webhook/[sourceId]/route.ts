import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  try {
    const { sourceId } = await params;
    const source = await db.newsSource.findUnique({ where: { id: sourceId } });

    if (!source || !source.isActive) {
      return NextResponse.json({ success: false, error: 'Source not active' }, { status: 403 });
    }

    const payload = await request.json();
    const title = payload.title || payload.headline || 'वेबहुक समाचार';
    const sourceUrl = payload.source_url || payload.url || source.websiteUrl || 'https://dainikmanyawar.in';
    const excerpt = payload.summary || payload.excerpt || title;

    const item = await db.newsImportItem.create({
      data: {
        sourceId: source.id,
        externalId: payload.id || `webhook-${Date.now()}`,
        sourceUrl,
        originalTitle: title,
        originalExcerpt: excerpt,
        rawContent: payload.content || excerpt,
        normalizedText: `<p>${excerpt}</p>`,
        imageUrl: payload.image_url || null,
        publisherName: source.publisherName,
        suggestedCategoryId: source.defaultCategoryId || undefined,
        suggestedLocationId: source.defaultLocationId || undefined,
        suggestedTagsJson: JSON.stringify(payload.tags || ['#वेबहुक']),
        status: 'NEW',
      },
    });

    return NextResponse.json({ success: true, message: 'Webhook news received in inbox', id: item.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
