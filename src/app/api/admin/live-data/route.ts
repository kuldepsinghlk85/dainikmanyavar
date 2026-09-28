import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { liveDataService } from '@/lib/live-data/service';
import { liveCache } from '@/lib/live-data/cache';
import { getIndianMarketSession } from '@/lib/live-data/marketHours';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const health = await liveDataService.getAllHealth();
    const cacheStats = liveCache.getStats();
    const marketSession = getIndianMarketSession();

    // Fetch previews without forcing network if fresh
    const cricket = await liveDataService.getCricketLive(false);
    const bullion = await liveDataService.getBullionRates(false);
    const market = await liveDataService.getMarketIndices(false);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health,
      cache: cacheStats,
      marketSession,
      data: {
        cricket,
        bullion,
        market,
      },
    });
  } catch (err: any) {
    console.error('[Admin Live Data GET Error]:', err);
    return NextResponse.json(
      { success: false, error: 'आंतरिक सर्वर त्रुटि - लाइव डेटा प्राप्त करने में असमर्थ' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'sync-all';

    let result: any = null;

    if (action === 'clear-cache') {
      liveCache.invalidate('live:');
      result = { message: 'लाइव डेटा कैश सफलतापूर्वक साफ़ किया गया' };
    } else if (action === 'sync-cricket') {
      result = await liveDataService.getCricketLive(true);
    } else if (action === 'sync-bullion') {
      result = await liveDataService.getBullionRates(true);
    } else if (action === 'sync-market') {
      result = await liveDataService.getMarketIndices(true);
    } else {
      // sync-all
      const [cricket, bullion, market] = await Promise.all([
        liveDataService.getCricketLive(true),
        liveDataService.getBullionRates(true),
        liveDataService.getMarketIndices(true),
      ]);
      result = { cricket, bullion, market };
    }

    try {
      await db.auditLog.create({
        data: {
          action: 'LIVE_DATA_SYNC',
          objectType: 'LIVE_ENGINE',
          detailsJson: JSON.stringify({
            action,
            initiatedBy: session.email,
            role: session.role,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `कार्रवाई सफल: ${action}`,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (err: any) {
    console.error('[Admin Live Data POST Error]:', err);
    return NextResponse.json(
      { success: false, error: 'सिंक करने में विफल' },
      { status: 500 }
    );
  }
}
