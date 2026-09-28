import { NextResponse } from 'next/server';
import { liveDataService } from '@/lib/live-data/service';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const market = await liveDataService.getMarketIndices();
    const updates = await db.stockMarketUpdate.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    // Format legacy live object so older callers continue to render
    const legacyLive = market
      ? {
          sensex: {
            value: market.indices.sensex.value.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            change: `${market.indices.sensex.change >= 0 ? '+' : ''}${market.indices.sensex.change.toFixed(2)} (${market.indices.sensex.changePercent}%)`,
            isUp: market.indices.sensex.isUp,
          },
          nifty: {
            value: market.indices.nifty50.value.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            change: `${market.indices.nifty50.change >= 0 ? '+' : ''}${market.indices.nifty50.change.toFixed(2)} (${market.indices.nifty50.changePercent}%)`,
            isUp: market.indices.nifty50.isUp,
          },
          session: market.marketSession,
        }
      : null;

    return NextResponse.json({
      success: true,
      live: legacyLive,
      data: updates,
      marketData: market,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'शेयर बाजार डेटा अनुपलब्ध है' }, { status: 500 });
  }
}
