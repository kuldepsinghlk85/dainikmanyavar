import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_MOBILE_MENU_CONFIG, MobileMenuConfig } from '@/lib/mobileMenuDefaults';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: 'mobile_menu_config' },
    });

    if (setting && setting.value) {
      try {
        const parsed: MobileMenuConfig = JSON.parse(setting.value);
        return NextResponse.json({ success: true, data: parsed });
      } catch (parseErr) {
        console.error('Error parsing mobile_menu_config:', parseErr);
      }
    }

    return NextResponse.json({ success: true, data: DEFAULT_MOBILE_MENU_CONFIG });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
