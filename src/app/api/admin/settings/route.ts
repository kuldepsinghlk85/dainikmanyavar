import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }
    const settings = await db.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'सेटिंग्स लोड करने में विफल' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMINISTRATOR')) {
      return NextResponse.json({ success: false, error: 'केवल सुपर एडमिन को पोर्टल सेटिंग्स बदलने का अधिकार है।' }, { status: 403 });
    }

    const settingsObj = await request.json();

    for (const [key, value] of Object.entries(settingsObj)) {
      await db.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    await db.auditLog.create({
      data: {
        action: 'UPDATE_SETTINGS',
        objectType: 'SITE_SETTINGS',
        detailsJson: JSON.stringify(settingsObj),
      },
    });

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
