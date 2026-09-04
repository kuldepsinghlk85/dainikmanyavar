import { NextResponse } from 'next/server';
import { syncAllSpecialModules, ensureDailyDataSynced } from '@/lib/autoUpdateService';
import { db } from '@/lib/db';

export async function GET() {
  try {
    await ensureDailyDataSynced();

    const lastSync = await db.siteSetting.findUnique({
      where: { key: 'last_auto_sync_at' },
    });

    const [goldCount, stockCount, horoCount, cricketCount] = await Promise.all([
      db.commodityPrice.count(),
      db.stockMarketUpdate.count(),
      db.horoscope.count(),
      db.cricketMatch.count(),
    ]);

    return NextResponse.json({
      success: true,
      lastSyncAt: lastSync?.value || new Date().toISOString(),
      counts: {
        goldSilverCities: goldCount,
        stockMarketArticles: stockCount,
        horoscopeSigns: horoCount,
        cricketMatches: cricketCount,
      },
      message: 'ऑटोमैटिक सिंक सिस्टम सक्रिय है। प्रतिदिन सभी 4 मॉड्यूल्स स्वतः अपडेट होते हैं।',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await syncAllSpecialModules(true);
    return NextResponse.json({
      success: true,
      message: 'सभी 4 मॉड्यूल्स (सोना-चांदी, शेयर बाजार, 12 राशिफल, क्रिकेट व खेल) तुरंत सिंक व अपडेट हो गए!',
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
