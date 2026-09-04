import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureDailyDataSynced } from '@/lib/autoUpdateService';

export async function GET() {
  try {
    await ensureDailyDataSynced();
    const prices = await db.commodityPrice.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: prices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
