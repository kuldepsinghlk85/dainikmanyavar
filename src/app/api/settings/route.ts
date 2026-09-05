import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      where: {
        key: {
          in: [
            'site_name',
            'site_subtitle',
            'site_logo',
            'festival_banner_enabled',
            'festival_banner_image',
            'festival_banner_title',
            'festival_banner_link',
            'whatsapp_number',
            'contact_email',
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
