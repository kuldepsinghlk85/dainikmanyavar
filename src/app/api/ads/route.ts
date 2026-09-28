import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    // Fetch placeholder visibility settings
    const [globalSetting, slotSetting] = await Promise.all([
      db.siteSetting.findUnique({ where: { key: 'ad_placeholders_enabled' } }),
      position ? db.siteSetting.findUnique({ where: { key: `ad_placeholder_${position}_enabled` } }) : null,
    ]);

    // Global placeholder enabled by default if not set, or respects 'false'
    const isGlobalEnabled = globalSetting ? globalSetting.value !== 'false' : false;
    const isSlotEnabled = slotSetting ? slotSetting.value !== 'false' : isGlobalEnabled;

    if (position) {
      const slot = await db.adSlot.findUnique({
        where: { position },
      });
      return NextResponse.json({
        success: true,
        data: slot,
        showPlaceholder: isSlotEnabled,
      });
    }

    const allSlots = await db.adSlot.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: allSlots,
      showPlaceholder: isGlobalEnabled,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'विज्ञापन डेटा लोड करने में त्रुटि' }, { status: 500 });
  }
}
