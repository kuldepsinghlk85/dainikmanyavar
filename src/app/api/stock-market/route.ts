import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureDailyDataSynced, getLiveStockMarketData } from '@/lib/autoUpdateService';

export async function GET() {
  try {
    await ensureDailyDataSynced();
    const live = getLiveStockMarketData();
    const updates = await db.stockMarketUpdate.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json({ success: true, live, data: updates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
