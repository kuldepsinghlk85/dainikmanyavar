import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NewsImportService } from '@/lib/importer/service';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File is required' }, { status: 400 });
    }

    const text = await file.text();
    let items: any[] = [];

    if (file.name.endsWith('.json')) {
      items = JSON.parse(text);
    } else if (file.name.endsWith('.csv')) {
      // Basic CSV Parser
      const lines = text.split('\n').filter((l) => l.trim());
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const obj: any = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] || '';
        });
        items.push(obj);
      }
    }

    // Get or Create Manual Source
    let manualSource = await db.newsSource.findFirst({ where: { name: 'Manual File Import' } });
    if (!manualSource) {
      manualSource = await db.newsSource.create({
        data: {
          name: 'Manual File Import',
          publisherName: 'Manual CSV/JSON Upload',
          sourceType: 'CSV',
          permissionMode: 'METADATA_ONLY',
          isActive: true,
        },
      });
    }

    let importedCount = 0;
    const categories = await db.category.findMany();
    const defaultCatId = categories[0] ? categories[0].id : undefined;

    for (const item of items) {
      const title = item.title || item.original_title || 'मैनुअल इम्पोर्ट समाचार';
      const sourceUrl = item.source_url || item.url || 'https://dainikmanyawar.in';
      const excerpt = item.summary || item.excerpt || title;

      await db.newsImportItem.create({
        data: {
          sourceId: manualSource.id,
          externalId: `manual-${Date.now()}-${Math.random()}`,
          sourceUrl,
          originalTitle: title,
          originalExcerpt: excerpt,
          rawContent: excerpt,
          normalizedText: `<p>${excerpt}</p>`,
          imageUrl: item.image_url || null,
          publisherName: item.publisher || 'Manual File',
          suggestedCategoryId: defaultCatId,
          suggestedTagsJson: JSON.stringify(item.tags ? (Array.isArray(item.tags) ? item.tags : [item.tags]) : ['#मैनुअल']),
          status: 'NEW',
        },
      });
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `${importedCount} फ़ाइल समाचार इनबॉक्स में सफलतापूर्वक इम्पोर्ट किए गए!`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
