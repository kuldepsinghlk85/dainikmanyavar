import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncSingleRssSource } from '@/lib/importer/rssEngine';

export async function POST() {
  try {
    const activeSources = await db.newsSource.findMany({
      where: { isActive: true },
    });

    let totalFound = 0;
    let newNews = 0;
    let duplicate = 0;
    let failed = 0;
    const syncedSources: string[] = [];

    for (const source of activeSources) {
      try {
        const res = await syncSingleRssSource(source.id);
        totalFound += res.totalFound;
        newNews += res.newNews;
        duplicate += res.duplicate;
        syncedSources.push(source.name);
      } catch (err) {
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `सफलतापूर्वक ${activeSources.length} सोर्सेज सिंक किए गए!`,
      totalSources: activeSources.length,
      totalFound,
      newNews,
      duplicate,
      failed,
      syncedSources,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
