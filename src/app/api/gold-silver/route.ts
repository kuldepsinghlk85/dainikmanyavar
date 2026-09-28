import { NextResponse } from 'next/server';
import { liveDataService } from '@/lib/live-data/service';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rates = await liveDataService.getBullionRates();
    const prices = await db.commodityPrice.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: prices,
      liveRates: rates,
      meta: rates?.meta,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'सर्राफा भाव अनुपलब्ध हैं' }, { status: 500 });
  }
}
