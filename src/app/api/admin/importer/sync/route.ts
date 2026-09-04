import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NewsImportService } from '@/lib/importer/service';

export async function POST(request: Request) {
  try {
    const { sourceId } = await request.json().catch(() => ({ sourceId: undefined }));

    if (sourceId) {
      const result = await NewsImportService.fetchAndIngestSource(sourceId);
      return NextResponse.json({ success: true, result });
    }

    // Sync All Active Sources
    const activeSources = await db.newsSource.findMany({
      where: { isActive: true },
    });

    const results: Record<string, any> = {};
    for (const s of activeSources) {
      results[s.name] = await NewsImportService.fetchAndIngestSource(s.id);
    }

    return NextResponse.json({ success: true, syncedSources: activeSources.length, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
