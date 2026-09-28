import { NextResponse } from 'next/server';
import { liveDataService } from '@/lib/live-data/service';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const live = await liveDataService.getCricketLive();

    // Map normalized data back to legacy format if legacy fields expected
    const legacyMatches = await db.cricketMatch.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: legacyMatches,
      liveData: live.data,
      meta: live.meta,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'क्रिकेट डेटा अनुपलब्ध है' }, { status: 500 });
  }
}
