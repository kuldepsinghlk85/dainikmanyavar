import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_MOBILE_MENU_CONFIG, MobileMenuConfig } from '@/lib/mobileMenuDefaults';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: 'mobile_menu_config' },
    });

    const [activeCategories, activeDistricts] = await Promise.all([
      db.category.findMany({
        where: {
          articles: { some: { status: 'PUBLISHED' } },
        },
        orderBy: { order: 'asc' },
        select: { id: true, name: true, slug: true },
        take: 20,
      }),
      db.location.findMany({
        where: {
          articles: { some: { status: 'PUBLISHED' } },
        },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
        take: 20,
      }),
    ]);

    if (setting && setting.value) {
      try {
        const parsed: MobileMenuConfig = JSON.parse(setting.value);
        return NextResponse.json({
          success: true,
          data: parsed,
          activeCategories,
          activeDistricts,
        });
      } catch (parseErr) {
        console.error('Error parsing mobile_menu_config:', parseErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: DEFAULT_MOBILE_MENU_CONFIG,
      activeCategories,
      activeDistricts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch menu' }, { status: 500 });
  }
}
