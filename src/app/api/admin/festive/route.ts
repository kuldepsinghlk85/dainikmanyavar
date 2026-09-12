import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { DEFAULT_FESTIVE_CONFIG, FestiveConfig } from '@/lib/festive';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश (Unauthorized)' }, { status: 401 });
    }

    const settings = await db.siteSetting.findMany({
      where: {
        key: { in: ['festive_section_enabled', 'festive_section_data'] },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const isEnabled = settingsMap['festive_section_enabled'] !== 'false';
    const rawData = settingsMap['festive_section_data'];

    let config: FestiveConfig = { ...DEFAULT_FESTIVE_CONFIG, enabled: isEnabled };
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        config = { ...DEFAULT_FESTIVE_CONFIG, ...parsed, enabled: isEnabled };
      } catch (e) {
        console.error('Failed to parse festive_section_data JSON:', e);
      }
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Failed to fetch admin festive config:', error);
    return NextResponse.json({ success: false, error: 'फेस्टिव सेटिंग्स लोड करने में त्रुटि' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश (Unauthorized)' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled, cards, ...rest } = body;

    const isEnabledStr = enabled === false ? 'false' : 'true';

    const cleanConfig = {
      enabled: isEnabledStr === 'true',
      headerTag: rest.headerTag || DEFAULT_FESTIVE_CONFIG.headerTag,
      headerTagIcon: rest.headerTagIcon || DEFAULT_FESTIVE_CONFIG.headerTagIcon,
      brandPrefix: rest.brandPrefix || DEFAULT_FESTIVE_CONFIG.brandPrefix,
      mainTitle: rest.mainTitle || DEFAULT_FESTIVE_CONFIG.mainTitle,
      subtitle: rest.subtitle || DEFAULT_FESTIVE_CONFIG.subtitle,
      primaryBtnText: rest.primaryBtnText || DEFAULT_FESTIVE_CONFIG.primaryBtnText,
      shareBtnText: rest.shareBtnText || DEFAULT_FESTIVE_CONFIG.shareBtnText,
      posterModalImage: rest.posterModalImage || DEFAULT_FESTIVE_CONFIG.posterModalImage,
      tickerText: rest.tickerText || DEFAULT_FESTIVE_CONFIG.tickerText,
      tickerWebsite: rest.tickerWebsite || DEFAULT_FESTIVE_CONFIG.tickerWebsite,
      tickerOffice: rest.tickerOffice || DEFAULT_FESTIVE_CONFIG.tickerOffice,
      cards: Array.isArray(cards) ? cards : DEFAULT_FESTIVE_CONFIG.cards,
    };

    // Save festive_section_enabled
    await db.siteSetting.upsert({
      where: { key: 'festive_section_enabled' },
      update: { value: isEnabledStr },
      create: { key: 'festive_section_enabled', value: isEnabledStr },
    });

    // Save festive_section_data
    await db.siteSetting.upsert({
      where: { key: 'festive_section_data' },
      update: { value: JSON.stringify(cleanConfig) },
      create: { key: 'festive_section_data', value: JSON.stringify(cleanConfig) },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'UPDATE_FESTIVE_CONFIG',
        objectType: 'FESTIVE_SECTION',
        detailsJson: JSON.stringify({
          updatedBy: session.email,
          enabled: cleanConfig.enabled,
          cardsCount: cleanConfig.cards.length,
        }),
      },
    });

    // Revalidate public page
    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
    } catch (e) {
      console.warn('Revalidation error:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'फेस्टिव सेटिंग्स सफलतापूर्वक सुरक्षित कर दी गईं!',
      data: cleanConfig,
    });
  } catch (error) {
    console.error('Failed to update festive config:', error);
    return NextResponse.json({ success: false, error: 'फेस्टिव सेटिंग्स सेव करने में विफल' }, { status: 500 });
  }
}
