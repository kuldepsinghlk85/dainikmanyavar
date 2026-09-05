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
      } catch (e) {}
    }

    return NextResponse.json({ success: true, data: DEFAULT_MOBILE_MENU_CONFIG });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const config: MobileMenuConfig = body.config;

    if (!config || !Array.isArray(config.bottomNav) || !config.header || !config.drawer) {
      return NextResponse.json({ success: false, error: 'अमान्य कॉन्फ़िगरेशन डेटा।' }, { status: 400 });
    }

    await db.siteSetting.upsert({
      where: { key: 'mobile_menu_config' },
      update: {
        value: JSON.stringify(config),
      },
      create: {
        key: 'mobile_menu_config',
        value: JSON.stringify(config),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'मोबाइल ऐप मेनू सेटिंग्स सफलतापूर्वक सुरक्षित हो गईं!',
      data: config,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
